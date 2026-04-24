import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

import { QrScanner } from '@/components/qr/qr-scanner';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Badge, Card, Select } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { parseQrPayload } from '@/lib/utils/qr';
import { platformService } from '@/services/platform-service';

export const QrAttendancePage = () => {
  const { profile, role } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [recentScans, setRecentScans] = useState<Array<{ attendee: string; event: string; time: string }>>([]);

  const eventsQuery = useQuery({
    queryKey: ['managed-events', profile?.id, role],
    queryFn: () => platformService.getManagedEvents(profile!.id, role!),
    enabled: Boolean(profile?.id && role),
  });

  if (eventsQuery.isLoading) {
    return <LoadingScreen message="Preparing QR attendance workspace..." />;
  }

  const scannableEvents = (eventsQuery.data ?? []).filter((event) => event.attendance_qr_enabled);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attendance"
        title="QR attendance scanner"
        description="Use the device camera to scan student QR passes, verify registrations, and mark attendance instantly."
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Choose event</h3>
          <div className="mt-5">
            <Select
              onChange={(event) => setSelectedEventId(event.target.value)}
              options={scannableEvents.map((event) => ({ label: event.title, value: event.id }))}
              placeholder="Select an event"
              value={selectedEventId}
            />
          </div>
          <div className="mt-5 rounded-[24px] bg-surface-muted p-4 text-sm leading-6 text-ink-soft">
            For the cleanest scan flow, keep the student QR code centered inside the scan frame and ensure the correct
            event is selected before scanning.
          </div>
          <div className="mt-5">
            <QrScanner
              enabled={Boolean(selectedEventId)}
              onScan={async (value) => {
                if (!selectedEventId) return;

                const payload = parseQrPayload(value);
                if (!payload) {
                  toast.error('That QR code is not a valid Univentra event pass.');
                  return;
                }

                if (payload.eventId !== selectedEventId) {
                  toast.error('This QR pass belongs to a different event.');
                  return;
                }

                try {
                  const result = await platformService.markAttendanceByQr(selectedEventId, payload.qrValue);
                  toast.success(`Checked in ${result.profile?.full_name} for ${result.event?.title}.`);
                  setRecentScans((current) => [
                    {
                      attendee: result.profile?.full_name ?? 'Attendee',
                      event: result.event?.title ?? 'Event',
                      time: new Date().toLocaleTimeString(),
                    },
                    ...current,
                  ].slice(0, 8));
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Unable to check in attendee.');
                }
              }}
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Recent successful scans</h3>
          <div className="mt-5 space-y-4">
            {recentScans.length === 0 ? (
              <p className="text-sm text-ink-soft">Successful check-ins will appear here as you scan attendees.</p>
            ) : (
              recentScans.map((scan, index) => (
                <div className="flex items-center justify-between rounded-[24px] bg-surface-muted p-4" key={`${scan.attendee}-${index}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-warm text-brand-foreground">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{scan.attendee}</p>
                      <p className="text-sm text-ink-soft">{scan.event}</p>
                    </div>
                  </div>
                  <Badge variant="success">{scan.time}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
