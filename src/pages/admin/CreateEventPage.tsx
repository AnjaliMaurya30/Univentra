import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { EventForm } from '@/components/admin/event-form';
import { PageHeader } from '@/components/common/page-header';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const { profile, role } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New event"
        title="Create an event"
        description={
          role === 'admin'
            ? 'Launch a polished event experience with banners, categories, deadlines, XP rewards, and attendance controls.'
            : 'Build the event draft and send it to the admin approval queue before it goes live on campus.'
        }
      />
      <EventForm
        onSubmit={async (values) => {
          try {
            await platformService.createEvent(profile!.id, role!, values as never);
            toast.success(
              role === 'admin' ? 'Event created successfully.' : 'Event submitted for admin approval.',
            );
            navigate('/admin/events');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to create event.');
          }
        }}
        submitLabel="Create event"
      />
    </div>
  );
};
