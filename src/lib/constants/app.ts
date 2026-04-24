import type { UserRole } from '@/types';

export const APP_NAME = 'Univentra';
export const APP_TAGLINE = 'Connect. Participate. Celebrate.';
export const PRIMARY_COLOR = '#FFB800';

export const EVENT_CATEGORIES = [
  'Technology',
  'Cultural',
  'Sports',
  'Workshops',
  'Music',
  'Leadership',
  'Photography',
  'Entrepreneurship',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#7A4DFF',
  Cultural: '#FF4DBA',
  Sports: '#1F7DFF',
  Workshops: '#FF8A00',
  Music: '#49D6FF',
  Leadership: '#FFC247',
  Photography: '#8D5CFF',
  Entrepreneurship: '#FF7D5E',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  organizer: 'Organizer',
  admin: 'Admin',
};

export const SIDEBAR_LINKS: Record<
  'student' | 'organizer' | 'admin',
  Array<{ label: string; to: string; icon: string }>
> = {
  student: [
    { label: 'Home', to: '/app', icon: 'layout-dashboard' },
    { label: 'Events', to: '/app/events', icon: 'calendar-range' },
    { label: 'QR Passes', to: '/app/attendance', icon: 'qr-code' },
    { label: 'Clubs', to: '/app/clubs', icon: 'shield-plus' },
    { label: 'Leaderboard', to: '/app/leaderboard', icon: 'trophy' },
    { label: 'Notifications', to: '/app/notifications', icon: 'bell' },
    { label: 'Profile', to: '/app/profile', icon: 'user-round' },
  ],
  organizer: [
    { label: 'Overview', to: '/admin', icon: 'layout-dashboard' },
    { label: 'Manage Events', to: '/admin/events', icon: 'calendar-cog' },
    { label: 'Create Event', to: '/admin/events/create', icon: 'plus-circle' },
    { label: 'Manage Clubs', to: '/admin/clubs', icon: 'building-2' },
    { label: 'Announcements', to: '/admin/announcements', icon: 'megaphone' },
    { label: 'Attendance Scanner', to: '/admin/attendance', icon: 'qr-code' },
  ],
  admin: [
    { label: 'Overview', to: '/admin', icon: 'layout-dashboard' },
    { label: 'Manage Events', to: '/admin/events', icon: 'calendar-cog' },
    { label: 'Create Event', to: '/admin/events/create', icon: 'plus-circle' },
    { label: 'Manage Clubs', to: '/admin/clubs', icon: 'building-2' },
    { label: 'Approval Queue', to: '/admin/approvals', icon: 'badge-check' },
    { label: 'Analytics', to: '/admin/analytics', icon: 'chart-column-big' },
    { label: 'Announcements', to: '/admin/announcements', icon: 'megaphone' },
    { label: 'Attendance Scanner', to: '/admin/attendance', icon: 'qr-code' },
  ],
};
