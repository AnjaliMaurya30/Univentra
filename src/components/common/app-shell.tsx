import {
  Bell,
  CalendarCog,
  CalendarRange,
  ChartColumnBig,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PlusCircle,
  QrCode,
  ShieldPlus,
  Trophy,
  UserRound,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Logo } from '@/components/common/logo';
import { Avatar, Badge, Button } from '@/components/ui';
import { SIDEBAR_LINKS } from '@/lib/constants/app';
import { cn } from '@/lib/utils/cn';
import { platformService } from '@/services/platform-service';
import { useAuth } from '@/hooks/use-auth';

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'calendar-range': CalendarRange,
  'shield-plus': ShieldPlus,
  trophy: Trophy,
  bell: Bell,
  'user-round': UserRound,
  'calendar-cog': CalendarCog,
  'plus-circle': PlusCircle,
  'building-2': Building2,
  'badge-check': BadgeCheck,
  'chart-column-big': ChartColumnBig,
  megaphone: Megaphone,
  'qr-code': QrCode,
};

const workspaceCopy = {
  student: {
    eyebrow: 'Student workspace',
    title: 'Make your campus journey visible.',
  },
  organizer: {
    eyebrow: 'Organizer workspace',
    title: 'Run clubs, events, and approvals with clarity.',
  },
  admin: {
    eyebrow: 'Campus workspace',
    title: 'Guide engagement across the whole campus.',
  },
};

export const AppShell = ({ mode }: { mode: 'student' | 'organizer' | 'admin' }) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const links = SIDEBAR_LINKS[mode];
  const shellCopy = workspaceCopy[mode];
  const notificationsQuery = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: () => platformService.getNotifications(profile!.id),
    enabled: Boolean(profile?.id),
  });

  const unreadCount = notificationsQuery.data?.filter((entry) => !entry.is_read).length ?? 0;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="surface-panel grid-ambient flex w-full shrink-0 flex-col justify-between overflow-hidden p-4 lg:w-[280px]">
          <div className="space-y-8">
            <Logo />
            <nav className="space-y-2">
              {links.map((link) => {
                const Icon = iconMap[link.icon as keyof typeof iconMap] ?? LayoutDashboard;
                return (
                  <NavLink
                    key={link.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-ink-soft transition-all duration-300 hover:bg-white/80 hover:text-ink',
                        isActive && 'bg-white text-ink shadow-soft',
                      )
                    }
                    to={link.to}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="surface-card mt-6 space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={profile?.full_name} src={profile?.avatar_url} />
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{profile?.full_name}</p>
                <p className="truncate text-xs uppercase tracking-[0.2em] text-ink-faint">{profile?.role}</p>
              </div>
            </div>
            <Button
              className="w-full justify-center"
              onClick={async () => {
                await signOut();
                navigate('/signin');
              }}
              variant="secondary"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-6">
          <header className="surface-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-orange">{shellCopy.eyebrow}</p>
              <h2 className="font-display text-2xl font-semibold text-ink">{shellCopy.title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                className={cn(
                  'relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft transition hover:-translate-y-0.5',
                  unreadCount > 0 && 'animate-bell',
                )}
                onClick={() =>
                  navigate(mode === 'student' ? '/app/notifications' : '/admin/announcements')
                }
                type="button"
              >
                <Bell className="h-5 w-5 text-ink" />
                {unreadCount > 0 ? (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-pink" />
                ) : null}
              </button>
              <Badge variant={mode === 'admin' ? 'purple' : mode === 'organizer' ? 'blue' : 'default'}>
                {mode === 'student' ? 'Student Mode' : mode === 'organizer' ? 'Organizer Mode' : 'Admin Mode'}
              </Badge>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
