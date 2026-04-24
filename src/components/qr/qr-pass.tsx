import { useEffect, useState } from 'react';

import QRCode from 'qrcode';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';

import { Badge, Card } from '@/components/ui';
import { createQrPayload } from '@/lib/utils/qr';
import { formatDateTime } from '@/lib/utils/format';
import type { EventView, EventRegistration, Profile } from '@/types';

export const QrPassCard = ({
  event,
  registration,
  profile,
}: {
  event: EventView;
  registration: EventRegistration;
  profile?: Profile | null;
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(createQrPayload(event.id, registration.qr_code_value), {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#333333',
        light: '#ffffff',
      },
      width: 280,
    }).then((value) => {
      if (isMounted) setQrDataUrl(value);
    });

    return () => {
      isMounted = false;
    };
  }, [event.id, registration.qr_code_value]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-6 p-6 md:grid-cols-[1.2fr,0.8fr]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Badge variant="default">QR Event Pass</Badge>
            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {registration.registration_status}
            </span>
          </div>
          <h3 className="mt-4 font-display text-3xl font-semibold text-ink">{event.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Present this QR pass at the venue entrance. It is unique to your registration and supports secure
            attendance check-in.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-ink-soft">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span>{profile?.full_name ?? 'Registered attendee'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>{formatDateTime(event.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}</span>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] bg-surface-muted p-4 text-xs leading-6 text-ink-soft">
            <p className="font-semibold uppercase tracking-[0.16em] text-ink-faint">Registration code</p>
            <p className="mt-2 break-all font-medium text-ink">{registration.qr_code_value}</p>
          </div>
        </div>

        <div className="surface-panel flex items-center justify-center p-4">
          {qrDataUrl ? <img alt={`${event.title} QR pass`} className="w-full max-w-[260px]" src={qrDataUrl} /> : null}
        </div>
      </div>
    </Card>
  );
};
