import { useQuery } from '@tanstack/react-query';
import { Bell, Bookmark, Medal, Star, Trophy } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

import { LoadingScreen } from '@/components/common/loading-screen';
import { MetricCard } from '@/components/common/metric-card';
import { PageHeader } from '@/components/common/page-header';
import { EventCard } from '@/components/events/event-card';
import { Badge, Card, Progress } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const DashboardPage = () => {
  const { profile } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', profile?.id],
    queryFn: () => platformService.getDashboard(profile!.id),
    enabled: Boolean(profile?.id),
  });

  if (dashboardQuery.isLoading) {
    return <LoadingScreen message="Building your student dashboard..." />;
  }

  const dashboard = dashboardQuery.data;

  if (!dashboard || !profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome back, ${profile.full_name.split(' ')[0]}`}
        description="Your next campus win starts here. Track XP, discover events, and stay ahead of announcements."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard accent="warm" hint="Keep climbing the leaderboard." icon={<Trophy className="h-5 w-5 text-brand-orange" />} label="Total XP" value={dashboard.stats.totalXp} />
        <MetricCard accent="purple" hint="Your live rank across campus." icon={<Medal className="h-5 w-5 text-brand-purple" />} label="Campus rank" value={`#${dashboard.stats.campusRank}`} />
        <MetricCard accent="blue" hint="Registrations across active events." icon={<Star className="h-5 w-5 text-brand-blue" />} label="Events joined" value={dashboard.stats.eventsJoined} />
        <MetricCard accent="warm" hint="Saved plans ready for later." icon={<Bookmark className="h-5 w-5 text-brand-orange" />} label="Saved events" value={dashboard.savedCount} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-orange">Momentum</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">XP progress</h2>
            </div>
            <Badge variant="purple">Level {dashboard.xpProgress.level}</Badge>
          </div>
          <div className="mt-6 rounded-[28px] bg-surface-muted p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Current XP</p>
                <p className="mt-2 font-display text-5xl font-semibold text-ink">{dashboard.xpProgress.current}</p>
              </div>
              <p className="text-sm text-ink-soft">Next level at {dashboard.xpProgress.nextLevelAt} XP</p>
            </div>
            <Progress className="mt-5" value={dashboard.xpProgress.progress} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {dashboard.announcements.slice(0, 2).map((announcement) => (
              <Card className="bg-surface-muted" key={announcement.id}>
                <div className="flex items-center gap-2 text-brand-orange">
                  <Bell className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Announcement</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">{announcement.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{announcement.content}</p>
              </Card>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-orange">Category pulse</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Where you show up most</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={dashboard.categoryStats}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {dashboard.categoryStats.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3">
            {dashboard.categoryStats.map((entry) => (
              <div className="flex items-center justify-between rounded-[20px] bg-surface-muted px-4 py-3" key={entry.name}>
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-medium text-ink">{entry.name}</span>
                </div>
                <span className="text-sm text-ink-soft">{entry.value} events</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div>
          <PageHeader
            eyebrow="Upcoming"
            title="Your next registrations"
            description="A quick look at the experiences already on your calendar."
          />
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {dashboard.upcomingEvents.map((event) => (
              <EventCard actionLabel="Open registration" event={event} href={`/app/events/${event.slug}`} key={event.id} />
            ))}
          </div>
        </div>
        <div>
          <PageHeader
            eyebrow="Recommended"
            title="Curated for your interests"
            description="Based on your favorite categories, saved events, and recent participation."
          />
          <div className="mt-5 grid gap-4">
            {dashboard.recommendedEvents.map((event) => (
              <Card className="bg-white/92" key={event.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant={event.category === 'Technology' ? 'purple' : 'blue'}>{event.category}</Badge>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{event.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{event.short_description}</p>
                  </div>
                  <Badge variant="secondary">{event.current_participants} joined</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
