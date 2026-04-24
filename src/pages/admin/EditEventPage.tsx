import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { EventForm } from '@/components/admin/event-form';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const EditEventPage = () => {
  const { id = '' } = useParams();
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const eventQuery = useQuery({
    queryKey: ['event-by-id', id, profile?.id],
    queryFn: () => platformService.getEventById(id, profile?.id),
    enabled: Boolean(id),
  });

  if (eventQuery.isLoading) {
    return <LoadingScreen message="Loading event editor..." />;
  }

  if (!eventQuery.data) {
    return null;
  }

  const event = eventQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Event editor"
        title={`Edit ${event.title}`}
        description={
          role === 'admin'
            ? 'Update the event experience and keep the live program polished.'
            : 'Update the event experience and resubmit the revised version to admin for approval.'
        }
      />
      <EventForm
        initialValues={event}
        onSubmit={async (values) => {
          try {
            await platformService.updateEvent(id, profile!.id, role!, values);
            toast.success(
              role === 'admin' || ['completed', 'cancelled'].includes(event.status)
                ? 'Event updated successfully.'
                : 'Changes submitted for admin approval.',
            );
            navigate('/admin/events');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update event.');
          }
        }}
        submitLabel="Save changes"
      />
    </div>
  );
};
