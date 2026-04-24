import { Bookmark, CalendarDays, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, CardDescription, CardTitle } from '@/components/ui';
import { seatsLeft, eventTimingLabel } from '@/lib/utils/format';
import type { EventView } from '@/types';

export const EventCard = ({
  event,
  onSave,
  saveBusy,
  actionLabel = 'View details',
  href,
}: {
  event: EventView;
  onSave?: (eventId: string) => void;
  saveBusy?: boolean;
  actionLabel?: string;
  href: string;
}) => (
  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.24 }}>
    <Card className="h-full overflow-hidden p-0">
      <div className="relative overflow-hidden rounded-[28px]">
        <div className="grid min-h-[190px] bg-hero-grid p-5">
          <div className="flex items-start justify-between gap-3">
            <Badge variant={event.category === 'Technology' ? 'purple' : event.category === 'Sports' ? 'blue' : 'default'}>
              {event.category}
            </Badge>
            {onSave ? (
              <button
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 shadow-soft transition hover:scale-[1.03]"
                disabled={saveBusy}
                onClick={() => onSave(event.id)}
                type="button"
              >
                <Bookmark className={`h-4 w-4 ${event.isSaved ? 'fill-current text-brand-orange' : 'text-ink-soft'}`} />
              </button>
            ) : null}
          </div>
          <div className="mt-auto">
            <p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {event.status}
            </p>
            <CardTitle className="mt-4 text-2xl">{event.title}</CardTitle>
            <CardDescription className="mt-2 max-w-xl">{event.short_description}</CardDescription>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="grid gap-3 text-sm text-ink-soft">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{eventTimingLabel(event.start_time, event.end_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {event.current_participants}/{event.max_participants} joined • {seatsLeft(event.current_participants, event.max_participants)} seats left
            </span>
          </div>
        </div>
        <Button asChild className="w-full justify-center">
          <Link to={href}>{actionLabel}</Link>
        </Button>
      </div>
    </Card>
  </motion.div>
);
