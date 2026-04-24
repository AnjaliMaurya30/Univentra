import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { EVENT_CATEGORIES } from '@/lib/constants/app';
import { eventFormSchema } from '@/schemas/event';
import { platformService } from '@/services/platform-service';
import { storageService } from '@/services/storage-service';
import { useAuth } from '@/hooks/use-auth';
import type { Event } from '@/types';

export const EventForm = ({
  initialValues,
  onSubmit,
  submitLabel,
}: {
  initialValues?: Partial<Event>;
  onSubmit: (values: Partial<Event>) => Promise<void>;
  submitLabel: string;
}) => {
  const { profile, role } = useAuth();
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const clubsQuery = useQuery({
    queryKey: ['clubs', 'form', profile?.id],
    queryFn: () => platformService.getClubs(profile?.id),
    enabled: Boolean(profile?.id),
  });

  const manageableClubs =
    role === 'admin'
      ? (clubsQuery.data ?? [])
      : (clubsQuery.data ?? []).filter(
          (club) =>
            club.created_by === profile?.id ||
            club.members.some(
              (member) =>
                member.user_id === profile?.id &&
                ['coordinator', 'president'].includes(member.role_in_club),
            ),
        );

  const form = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      short_description: initialValues?.short_description ?? '',
      description: initialValues?.description ?? '',
      category: initialValues?.category ?? 'Technology',
      venue: initialValues?.venue ?? '',
      mode: initialValues?.mode ?? 'offline',
      meeting_link: initialValues?.meeting_link ?? '',
      organizer_type: initialValues?.organizer_type ?? (profile?.role === 'admin' ? 'admin' : 'club'),
      organizer_id: initialValues?.organizer_id ?? clubsQuery.data?.[0]?.id ?? '',
      start_time: initialValues?.start_time?.slice(0, 16) ?? '',
      end_time: initialValues?.end_time?.slice(0, 16) ?? '',
      registration_deadline: initialValues?.registration_deadline?.slice(0, 16) ?? '',
      max_participants: initialValues?.max_participants ?? 100,
      xp_reward: initialValues?.xp_reward ?? 50,
      team_based: initialValues?.team_based ?? false,
      certificate_enabled: initialValues?.certificate_enabled ?? true,
      attendance_qr_enabled: initialValues?.attendance_qr_enabled ?? true,
    },
  });

  useEffect(() => {
    const organizerType = form.getValues('organizer_type');
    const organizerId = form.getValues('organizer_id');

    if (role !== 'admin' && organizerType !== 'club') {
      form.setValue('organizer_type', 'club');
    }

    if (form.getValues('organizer_type') === 'admin') {
      if (organizerId !== (profile?.id ?? '')) {
        form.setValue('organizer_id', profile?.id ?? '');
      }
      return;
    }

    if (!organizerId && manageableClubs[0]?.id) {
      form.setValue('organizer_id', manageableClubs[0].id);
    }
  }, [form, manageableClubs, profile?.id, role]);

  return (
    <Card>
      <form
        className="grid gap-5"
        onSubmit={form.handleSubmit(async (values) => {
          let bannerUrl = initialValues?.banner_url ?? null;
          if (bannerFile) {
            bannerUrl = await storageService.uploadPublicAsset(bannerFile, 'event-banners', 'events');
          }

          await onSubmit({
            ...values,
            banner_url: bannerUrl,
            meeting_link: values.meeting_link || null,
          });
        })}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {role !== 'admin' ? (
            <div className="rounded-[24px] bg-surface-muted p-4 text-sm leading-6 text-ink-soft lg:col-span-2">
              Organizer-created and organizer-edited events go to the admin approval queue before they go live.
            </div>
          ) : null}
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-ink">Event title</label>
            <Input {...form.register('title')} placeholder="Tech Hackathon 2025" />
            {form.formState.errors.title ? <p className="text-sm text-danger">{form.formState.errors.title.message}</p> : null}
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-ink">Short description</label>
            <Textarea {...form.register('short_description')} className="min-h-[90px]" placeholder="A one-line snapshot of the event vibe." />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-ink">Description</label>
            <Textarea {...form.register('description')} placeholder="Describe the event flow, expectations, and highlights." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Category</label>
            <Select
              options={EVENT_CATEGORIES.map((item) => ({ label: item, value: item }))}
              value={form.watch('category')}
              onChange={(event) => form.setValue('category', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Mode</label>
            <Select
              options={[
                { label: 'Offline', value: 'offline' },
                { label: 'Online', value: 'online' },
                { label: 'Hybrid', value: 'hybrid' },
              ]}
              value={form.watch('mode')}
              onChange={(event) => form.setValue('mode', event.target.value as Event['mode'])}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Venue</label>
            <Input {...form.register('venue')} placeholder="Innovation Hub Atrium" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Meeting link</label>
            <Input {...form.register('meeting_link')} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Organizer type</label>
            <Select
              options={
                role === 'admin'
                  ? [
                      { label: 'Club', value: 'club' },
                      { label: 'Admin', value: 'admin' },
                    ]
                  : [{ label: 'Club', value: 'club' }]
              }
              value={form.watch('organizer_type')}
              onChange={(event) => {
                const nextType = event.target.value as Event['organizer_type'];
                form.setValue('organizer_type', nextType);
                form.setValue(
                  'organizer_id',
                  nextType === 'admin' ? profile?.id ?? '' : manageableClubs[0]?.id ?? '',
                );
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Organizer source</label>
            <Select
              options={
                form.watch('organizer_type') === 'admin'
                  ? [{ label: 'Campus admin office', value: profile?.id ?? '' }]
                  : manageableClubs.map((club) => ({ label: club.name, value: club.id }))
              }
              value={form.watch('organizer_id')}
              onChange={(event) => form.setValue('organizer_id', event.target.value)}
            />
            {role !== 'admin' && manageableClubs.length === 0 ? (
              <p className="text-sm text-danger">You need coordinator or president access in a club to host an event.</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Start time</label>
            <Input type="datetime-local" {...form.register('start_time')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">End time</label>
            <Input type="datetime-local" {...form.register('end_time')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Registration deadline</label>
            <Input type="datetime-local" {...form.register('registration_deadline')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Capacity</label>
            <Input type="number" {...form.register('max_participants')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">XP reward</label>
            <Input type="number" {...form.register('xp_reward')} />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-ink">Event banner</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-surface-soft bg-surface-muted px-4 py-4 text-sm text-ink-soft transition hover:bg-white">
              <Upload className="h-4 w-4" />
              <span>{bannerFile ? bannerFile.name : 'Upload an event banner image'}</span>
              <input
                accept="image/*"
                className="hidden"
                onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4 text-sm text-ink">
            <input className="h-4 w-4 rounded border-surface-soft" type="checkbox" {...form.register('team_based')} />
            Team-based event
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4 text-sm text-ink">
            <input className="h-4 w-4 rounded border-surface-soft" type="checkbox" {...form.register('certificate_enabled')} />
            Issue certificates
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4 text-sm text-ink">
            <input className="h-4 w-4 rounded border-surface-soft" type="checkbox" {...form.register('attendance_qr_enabled')} />
            Enable QR attendance
          </label>
        </div>
        <div className="flex justify-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};
