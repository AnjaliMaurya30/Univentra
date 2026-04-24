import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { QrPassCard } from '@/components/qr/qr-pass';
import { Badge, Button, Card, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { eventTimingLabel } from '@/lib/utils/format';
import { platformService } from '@/services/platform-service';

export const MyRegistrationsPage = () => {
  const { profile } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const registrationsQuery = useQuery({
    queryKey: ['my-registrations', profile?.id],
    queryFn: () => platformService.getMyRegistrations(profile!.id),
    enabled: Boolean(profile?.id),
  });

  if (registrationsQuery.isLoading) {
    return <LoadingScreen message="Loading your registrations..." />;
  }

  const selected = registrationsQuery.data?.find((entry) => entry.id === selectedId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="QR attendance"
        title="Your QR event passes"
        description="Open your student QR passes here for campus event check-in and review your attendance outcomes."
      />
      <div className="grid gap-4">
        {registrationsQuery.data?.map((registration) => (
          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={registration.id}>
            <div>
              <h3 className="font-display text-2xl font-semibold text-ink">{registration.event.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{eventTimingLabel(registration.event.start_time, registration.event.end_time)}</p>
              <p className="mt-1 text-sm text-ink-soft">{registration.event.venue}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={registration.registration_status === 'attended' ? 'success' : 'secondary'}>
                {registration.registration_status}
              </Badge>
              <Button onClick={() => setSelectedId(registration.id)} variant="secondary">
                Show QR pass
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog onOpenChange={(open) => !open && setSelectedId(null)} open={Boolean(selected)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your event pass</DialogTitle>
            <DialogDescription>Show this QR pass to organizers during event check-in.</DialogDescription>
          </DialogHeader>
          {selected ? <QrPassCard event={selected.event} profile={profile} registration={selected} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};
