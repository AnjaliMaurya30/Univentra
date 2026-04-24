import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';

import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { relativeTime } from '@/lib/utils/format';
import { platformService } from '@/services/platform-service';

export const NotificationsPage = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  useRealtimeNotifications(profile?.id);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: () => platformService.getNotifications(profile!.id),
    enabled: Boolean(profile?.id),
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => platformService.markNotificationRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] });
    },
  });

  if (notificationsQuery.isLoading) {
    return <LoadingScreen message="Collecting your notifications..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Realtime updates"
        title="Notifications"
        description="Registration updates, badge unlocks, approvals, and certificate alerts in one live feed."
      />
      <div className="grid gap-4">
        {notificationsQuery.data?.map((notification) => (
          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={notification.id}>
            <div className="flex gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${notification.is_read ? 'bg-surface-muted text-ink-soft' : 'bg-gradient-pop text-white'}`}>
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-ink">{notification.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{notification.message}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-faint">{relativeTime(notification.created_at)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {notification.related_link ? (
                <Button asChild size="sm" variant="secondary">
                  <Link to={notification.related_link}>Open</Link>
                </Button>
              ) : null}
              {!notification.is_read ? (
                <Button onClick={() => markReadMutation.mutate(notification.id)} size="sm" variant="outline">
                  Mark as read
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
