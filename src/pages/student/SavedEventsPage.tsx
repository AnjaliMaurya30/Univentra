import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '@/components/common/empty-state';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { EventCard } from '@/components/events/event-card';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const SavedEventsPage = () => {
  const { profile } = useAuth();
  const savedQuery = useQuery({
    queryKey: ['saved-events', profile?.id],
    queryFn: () => platformService.getSavedEvents(profile!.id),
    enabled: Boolean(profile?.id),
  });

  if (savedQuery.isLoading) {
    return <LoadingScreen message="Collecting your saved events..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Saved"
        title="Saved events"
        description="Come back to the events you bookmarked when you're ready to register."
      />
      {savedQuery.data?.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {savedQuery.data.map((event) => (
            <EventCard event={event} href={`/app/events/${event.slug}`} key={event.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Saved events show up here so you can quickly return to them later."
          title="No saved events yet"
        />
      )}
    </div>
  );
};
