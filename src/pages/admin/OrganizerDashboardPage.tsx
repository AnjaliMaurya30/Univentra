import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { LoadingScreen } from '@/components/common/loading-screen';
import { MetricCard } from '@/components/common/metric-card';
import { PageHeader } from '@/components/common/page-header';
import { Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { eventTimingLabel, relativeTime } from '@/lib/utils/format';
import { platformService } from '@/services/platform-service';

const statusVariant = (status: string) => {
  if (status === 'approved' || status === 'completed' || status === 'full') return 'success';
  if (status === 'pending') return 'blue';
  if (status === 'rejected' || status === 'cancelled') return 'danger';
  return 'secondary';
};

export const OrganizerDashboardPage = () => {
  const { profile } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ['organizer-dashboard', profile?.id],
    queryFn: () => platformService.getOrganizerDashboard(profile!.id),
    enabled: Boolean(profile?.id),
  });

  if (dashboardQuery.isLoading) {
    return <LoadingScreen message="Loading organizer workspace..." />;
  }

  const dashboard = dashboardQuery.data;
  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organizer overview"
        title="Club operations dashboard"
        description="Track approvals, registrations, and launch readiness for the clubs and events you manage."
        action={
          <Button asChild>
            <Link to="/admin/events/create">Create new event</Link>
          </Button>
        }
      />

      <Card className="overflow-hidden bg-gradient-cool text-white">
        <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-4">
            <Badge className="bg-white/20 text-white" variant="blue">
              Organizer Mode
            </Badge>
            <div className="space-y-3">
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Run events, coordinate clubs, and move submissions through approval with confidence.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-white/85">
                This view is scoped to your clubs and event pipeline, so you can stay focused on operations instead of
                campus-wide administration.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/75">Clubs managed</p>
              <p className="mt-2 font-display text-3xl font-semibold">{dashboard.metrics.clubsManaged}</p>
            </div>
            <div className="rounded-[24px] border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/75">Pending review</p>
              <p className="mt-2 font-display text-3xl font-semibold">{dashboard.metrics.pendingReview}</p>
            </div>
            <div className="rounded-[24px] border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/75">Attendance rate</p>
              <p className="mt-2 font-display text-3xl font-semibold">{dashboard.metrics.attendanceRate}%</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="blue"
          hint="Total events currently under your scope."
          icon={<CalendarClock className="h-5 w-5 text-brand-blue" />}
          label="Managed events"
          value={dashboard.metrics.managedEvents}
        />
        <MetricCard
          accent="purple"
          hint="Approved or full events still in motion."
          icon={<Sparkles className="h-5 w-5 text-brand-purple" />}
          label="Live events"
          value={dashboard.metrics.liveEvents}
        />
        <MetricCard
          accent="warm"
          hint="Registrations captured across your portfolio."
          icon={<Users className="h-5 w-5 text-brand-orange" />}
          label="Registrations"
          value={dashboard.metrics.totalRegistrations}
        />
        <MetricCard
          accent="blue"
          hint="Events currently waiting on admin review."
          icon={<ClipboardCheck className="h-5 w-5 text-brand-cyan" />}
          label="Approval queue"
          value={dashboard.metrics.pendingReview}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Registration momentum</h3>
          <p className="mt-2 text-sm text-ink-soft">How your event portfolio has been pulling registrations over the last six months.</p>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={dashboard.registrationTrend}>
                <CartesianGrid stroke="#EAEAEA" strokeDasharray="4 4" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="registrations" stroke="#1F7DFF" strokeWidth={3} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Status mix</h3>
          <p className="mt-2 text-sm text-ink-soft">A quick pulse check on where your events currently sit in the workflow.</p>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie data={dashboard.statusBreakdown} dataKey="value" innerRadius={72} outerRadius={108}>
                  {dashboard.statusBreakdown.map((entry) => (
                    <Cell fill={entry.fill} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {dashboard.statusBreakdown.map((entry) => (
              <div className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3" key={entry.name}>
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                  <span className="text-sm text-ink">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-ink">{entry.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-ink">Events needing attention</h3>
              <p className="mt-2 text-sm text-ink-soft">Pending and rejected items that need review, edits, or admin action.</p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/events">Open event board</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-4">
            {dashboard.attentionEvents.length === 0 ? (
              <p className="text-sm text-ink-soft">No events currently need action. Your workflow is looking clean.</p>
            ) : (
              dashboard.attentionEvents.map((event) => (
                <div className="rounded-[24px] bg-surface-muted p-4" key={event.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(event.status) as never}>{event.status}</Badge>
                    <Badge variant="secondary">{event.category}</Badge>
                  </div>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">{event.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{event.short_description}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
                    <span>{relativeTime(event.updated_at)}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/events/${event.id}/edit`}>Review event</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-ink">Upcoming run-sheet</h3>
              <p className="mt-2 text-sm text-ink-soft">What is coming up next across your approved and in-flight events.</p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/attendance">Open attendance</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-4">
            {dashboard.upcomingEvents.length === 0 ? (
              <p className="text-sm text-ink-soft">No upcoming events are scheduled yet for your current club portfolio.</p>
            ) : (
              dashboard.upcomingEvents.map((event) => (
                <div className="rounded-[24px] bg-surface-muted p-4" key={event.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(event.status) as never}>{event.status}</Badge>
                    <Badge variant="blue">{event.mode}</Badge>
                  </div>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">{event.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{eventTimingLabel(event.start_time, event.end_time)}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Venue</p>
                      <p className="mt-1 text-sm font-medium text-ink">{event.venue}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Participants</p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {event.current_participants}/{event.max_participants}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Club portfolio</h3>
          <p className="mt-2 text-sm text-ink-soft">A quick summary of the clubs you currently lead or coordinate.</p>
          <div className="mt-5 space-y-4">
            {dashboard.clubsManagedList.length === 0 ? (
              <p className="text-sm text-ink-soft">No managed clubs found for this organizer account.</p>
            ) : (
              dashboard.clubsManagedList.map((entry) => (
                <div className="rounded-[24px] border border-surface-soft bg-white p-4" key={entry.club.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Badge variant="blue">{entry.club.category}</Badge>
                      <p className="mt-3 font-display text-2xl font-semibold text-ink">{entry.club.name}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-cool text-white">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-surface-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Members</p>
                      <p className="mt-1 font-semibold text-ink">{entry.members}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Active events</p>
                      <p className="mt-1 font-semibold text-ink">{entry.activeEvents}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Pending</p>
                      <p className="mt-1 font-semibold text-ink">{entry.pendingEvents}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-ink">Recent announcement activity</h3>
              <p className="mt-2 text-sm text-ink-soft">Posts and targeted updates connected to your events and clubs.</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-pop text-white">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5">
            {dashboard.recentAnnouncements.length === 0 ? (
              <p className="text-sm text-ink-soft">No recent announcement activity for your managed areas yet.</p>
            ) : (
              <div className="h-[360px]">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={dashboard.recentAnnouncements.map((announcement) => ({
                    title: announcement.title.slice(0, 20),
                    length: announcement.content.length,
                  }))}>
                    <CartesianGrid stroke="#EAEAEA" strokeDasharray="4 4" />
                    <XAxis dataKey="title" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="length" fill="#7A4DFF" radius={[14, 14, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.recentAnnouncements.map((announcement) => (
              <div className="rounded-2xl bg-surface-muted px-4 py-3" key={announcement.id}>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={announcement.target_type === 'event' ? 'purple' : announcement.target_type === 'club' ? 'blue' : 'secondary'}>
                    {announcement.target_type}
                  </Badge>
                  <span className="text-xs text-ink-faint">{relativeTime(announcement.created_at)}</span>
                </div>
                <p className="mt-3 font-medium text-ink">{announcement.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{announcement.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
