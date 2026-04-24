import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { EventCard } from '@/components/events/event-card';
import { Button, Input, Select, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { EVENT_CATEGORIES } from '@/lib/constants/app';
import { platformService } from '@/services/platform-service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export const EventsExplorerScreen = ({
  mode,
  title,
  description,
}: {
  mode: 'public' | 'app';
  title: string;
  description: string;
}) => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [scope, setScope] = useState<'upcoming' | 'all'>('upcoming');

  const eventsQuery = useQuery({
    queryKey: ['events', mode, search, category, scope, profile?.id],
    queryFn: () =>
      platformService.getPublicEvents({
        search,
        category,
        upcomingOnly: scope === 'upcoming',
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (eventId: string) => platformService.toggleSavedEvent(profile!.id, eventId),
    onSuccess: async () => {
      toast.success('Saved events updated.');
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', profile?.id] });
      await queryClient.invalidateQueries({ queryKey: ['saved-events', profile?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (eventsQuery.isLoading) {
    return <LoadingScreen message="Curating campus events..." />;
  }

  const events = eventsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={mode === 'public' ? 'Discover' : 'Event finder'}
        title={title}
        description={description}
        action={
          mode === 'public' ? (
            <Button asChild>
              <a href="/signin">Sign in to register</a>
            </Button>
          ) : undefined
        }
      />

      <div className="surface-card grid gap-4 p-4 md:grid-cols-[1.6fr,0.7fr,0.7fr]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            className="pl-11"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, category, or vibe"
            value={search}
          />
        </div>
        <Select
          onChange={(event) => setCategory(event.target.value)}
          options={[{ label: 'All categories', value: 'All' }, ...EVENT_CATEGORIES.map((item) => ({ label: item, value: item }))]}
          value={category}
        />
        <Tabs onValueChange={(value) => setScope(value as 'upcoming' | 'all')} value={scope}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {events.length === 0 ? (
        <EmptyState
          description="Try another category, widen the timeline, or search with a different keyword."
          title="No events matched that filter"
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-3 md:grid-cols-2">
          {events.map((event) => (
            <EventCard
              actionLabel={mode === 'public' ? 'Preview event' : 'Open event'}
              event={event}
              href={mode === 'public' ? `/events/${event.slug}` : `/app/events/${event.slug}`}
              key={event.id}
              onSave={mode === 'app' && profile ? (eventId) => saveMutation.mutate(eventId) : undefined}
              saveBusy={saveMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};
