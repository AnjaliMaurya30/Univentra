import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { eventTimingLabel } from '@/lib/utils/format';
import { platformService } from '@/services/platform-service';

export const ManageEventsPage = () => {
  const { profile, role } = useAuth();
  const eventsQuery = useQuery({
    queryKey: ['managed-events', profile?.id, role],
    queryFn: () => platformService.getManagedEvents(profile!.id, role!),
    enabled: Boolean(profile?.id && role),
  });

  if (eventsQuery.isLoading) {
    return <LoadingScreen message="Loading managed events..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Event operations"
        title="Manage events"
        description="Review registrations, edit event details, and monitor certificate and attendance workflows."
        action={
          <Button asChild>
            <Link to="/admin/events/create">Create event</Link>
          </Button>
        }
      />
      <div className="grid gap-4">
        {eventsQuery.data?.map((event) => (
          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={event.id}>
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={event.status === 'approved' ? 'success' : event.status === 'pending' ? 'secondary' : 'default'}>
                  {event.status}
                </Badge>
                <Badge variant="secondary">{event.category}</Badge>
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{event.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{eventTimingLabel(event.start_time, event.end_time)}</p>
              <p className="mt-1 text-sm text-ink-soft">{event.current_participants}/{event.max_participants} participants</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" variant="secondary">
                <Link to={`/admin/events/view/${event.slug}`}>Open event</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={`/admin/events/${event.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
