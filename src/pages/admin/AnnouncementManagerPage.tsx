import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { announcementSchema } from '@/schemas/announcement';
import { platformService } from '@/services/platform-service';

export const AnnouncementManagerPage = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [targetType, setTargetType] = useState<'campus' | 'club' | 'event'>('campus');

  const announcementsQuery = useQuery({
    queryKey: ['announcements', profile?.id],
    queryFn: () => platformService.getAnnouncements(profile?.id),
  });
  const clubsQuery = useQuery({
    queryKey: ['clubs', profile?.id],
    queryFn: () => platformService.getClubs(profile?.id),
  });
  const eventsQuery = useQuery({
    queryKey: ['managed-events', profile?.id, profile?.role],
    queryFn: () => platformService.getManagedEvents(profile!.id, profile!.role),
    enabled: Boolean(profile?.id && profile?.role),
  });

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      target_type: 'campus',
      target_id: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof announcementSchema>) =>
      platformService.createAnnouncement(profile!.id, values.title, values.content, values.target_type, values.target_id),
    onSuccess: async () => {
      toast.success('Announcement posted.');
      form.reset({
        title: '',
        content: '',
        target_type: 'campus',
        target_id: '',
      });
      setTargetType('campus');
      await queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (announcementsQuery.isLoading) {
    return <LoadingScreen message="Loading announcement center..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Announcements"
        title="Announcement manager"
        description="Broadcast campus-wide updates or target specific clubs and events with timely messages."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Post new announcement</h3>
          <form className="mt-5 grid gap-4" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
            <Input placeholder="Announcement title" {...form.register('title')} />
            <Select
              onChange={(event) => {
                const value = event.target.value as 'campus' | 'club' | 'event';
                setTargetType(value);
                form.setValue('target_type', value);
                form.setValue('target_id', '');
              }}
              options={[
                { label: 'Campus-wide', value: 'campus' },
                { label: 'Club specific', value: 'club' },
                { label: 'Event specific', value: 'event' },
              ]}
              value={targetType}
            />
            {targetType !== 'campus' ? (
              <Select
                onChange={(event) => form.setValue('target_id', event.target.value)}
                options={
                  targetType === 'club'
                    ? (clubsQuery.data ?? []).map((club) => ({ label: club.name, value: club.id }))
                    : (eventsQuery.data ?? []).map((event) => ({ label: event.title, value: event.id }))
                }
                placeholder={`Select ${targetType}`}
                value={form.watch('target_id') ?? ''}
              />
            ) : null}
            {form.formState.errors.target_id ? (
              <p className="text-sm text-danger">{form.formState.errors.target_id.message}</p>
            ) : null}
            <Textarea placeholder="Write the announcement content..." {...form.register('content')} />
            <Button disabled={createMutation.isPending} type="submit">
              Publish announcement
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Announcement feed</h3>
          <div className="mt-5 space-y-4">
            {announcementsQuery.data?.map((announcement) => (
              <div className="rounded-[24px] bg-surface-muted p-4" key={announcement.id}>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">{announcement.target_type}</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">{announcement.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{announcement.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
