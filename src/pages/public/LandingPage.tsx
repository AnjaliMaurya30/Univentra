import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BellRing, ChartSpline, QrCode, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EventCard } from '@/components/events/event-card';
import { Badge, Button, Card } from '@/components/ui';
import { APP_TAGLINE } from '@/lib/constants/app';
import { platformService } from '@/services/platform-service';

export const LandingPage = () => {
  const featuredEventsQuery = useQuery({
    queryKey: ['landing-featured-events'],
    queryFn: () => platformService.getPublicEvents({ upcomingOnly: true }),
  });

  const featuredEvents = (featuredEventsQuery.data ?? []).slice(0, 3);

  return (
    <div className="space-y-12">
      <section className="container">
        <div className="surface-panel grid gap-10 overflow-hidden px-6 py-10 md:px-10 md:py-12 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <Badge variant="default">Modern campus engagement platform</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-tight text-ink md:text-6xl">
                {APP_TAGLINE}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink-soft">
                Univentra brings event discovery, clubs, attendance, certificates, gamification, and analytics into one
                polished student experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/browse">
                  Browse events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/signin">Sign in</Link>
              </Button>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {[
                ['12+', 'Live campus events'],
                ['5 clubs', 'Active student communities'],
                ['QR + certificates', 'End-to-end participation flow'],
              ].map(([value, label]) => (
                <Card className="bg-white/90 p-4" key={value}>
                  <p className="font-display text-3xl font-semibold text-ink">{value}</p>
                  <p className="mt-1 text-sm text-ink-soft">{label}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <Card className="grid gap-5 bg-white/92 md:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-orange">Student dashboard</p>
                <h2 className="font-display text-3xl font-semibold text-ink">A premium home base for every student.</h2>
                <p className="text-sm leading-6 text-ink-soft">
                  Track your XP, discover recommendations, manage registrations, and stay synced with announcements.
                </p>
              </div>
              <div className="grid gap-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Leaderboard</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-ink">#12</p>
                    </div>
                    <Trophy className="h-8 w-8 text-brand-orange" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Unread notices</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-ink">04</p>
                    </div>
                    <BellRing className="h-8 w-8 text-brand-purple" />
                  </div>
                </Card>
              </div>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-gradient-cool text-white">
                <QrCode className="h-6 w-6" />
                <h3 className="mt-4 font-display text-2xl font-semibold">QR attendance</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Secure student check-in with instant XP awarding and attendance confirmation.
                </p>
              </Card>
              <Card className="bg-gradient-pop text-white">
                <ShieldCheck className="h-6 w-6" />
                <h3 className="mt-4 font-display text-2xl font-semibold">Admin visibility</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Approval workflows, analytics, and announcements for organizers and campus teams.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-5 lg:grid-cols-3">
        {[
          {
            icon: <Sparkles className="h-6 w-6 text-brand-orange" />,
            title: 'Student-first dashboard',
            description: 'Personalized recommendations, saved events, progress tracking, and beautifully organized actions.',
          },
          {
            icon: <ChartSpline className="h-6 w-6 text-brand-blue" />,
            title: 'Actionable analytics',
            description: 'Real participation trends, top clubs, event categories, and attendance performance for admins.',
          },
          {
            icon: <ShieldCheck className="h-6 w-6 text-brand-purple" />,
            title: 'Secure role-based workflows',
            description: 'Supabase Auth, RLS, approval flows, storage buckets, and scoped organizer actions built in.',
          },
        ].map((feature) => (
          <Card key={feature.title}>
            {feature.icon}
            <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{feature.description}</p>
          </Card>
        ))}
      </section>

      <section className="container space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-orange">Featured events</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-ink">Campus energy, curated beautifully.</h2>
          </div>
          <Button asChild variant="secondary">
            <Link to="/browse">See all events</Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard event={event} href={`/events/${event.slug}`} key={event.id} />
          ))}
        </div>
      </section>

      <footer className="container pb-12 pt-4">
        <div className="surface-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-semibold text-ink">Univentra</p>
            <p className="mt-1 text-sm text-ink-soft">A polished full-stack campus engagement platform powered by Supabase.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/browse">Explore events</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
