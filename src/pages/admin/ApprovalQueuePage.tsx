import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const ApprovalQueuePage = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard', profile?.id],
    queryFn: () => platformService.getAdminDashboard(profile!.id),
    enabled: Boolean(profile?.id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: 'approved' | 'rejected' }) =>
      platformService.updateEventStatus(eventId, status, profile?.id),
    onSuccess: async () => {
      toast.success('Approval queue updated.');
      await queryClient.invalidateQueries({ queryKey: ['admin-dashboard', profile?.id] });
      await queryClient.invalidateQueries({ queryKey: ['managed-events', profile?.id] });
    },
  });

  if (dashboardQuery.isLoading) {
    return <LoadingScreen message="Loading approval queue..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals"
        title="Event approval queue"
        description="Approve, reject, and review organizer submissions before they go live."
      />
      <div className="grid gap-4">
        {dashboardQuery.data?.pendingEvents.map((event) => (
          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={event.id}>
            <div>
              <Badge variant="secondary">Pending review</Badge>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{event.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{event.description}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => statusMutation.mutate({ eventId: event.id, status: 'approved' })}>Approve</Button>
              <Button onClick={() => statusMutation.mutate({ eventId: event.id, status: 'rejected' })} variant="danger">
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
