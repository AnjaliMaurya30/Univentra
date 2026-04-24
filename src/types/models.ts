export type UserRole = 'student' | 'organizer' | 'admin';
export type ClubRole = 'member' | 'coordinator' | 'president';
export type OrganizerType = 'club' | 'admin';
export type EventMode = 'offline' | 'online' | 'hybrid';
export type EventStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'full';
export type RegistrationStatus =
  | 'registered'
  | 'waitlisted'
  | 'cancelled'
  | 'attended'
  | 'absent';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  department: string | null;
  year_of_study: string | null;
  bio: string | null;
  favorite_category: string | null;
  total_xp: number;
  level: number;
  rank_cache: number | null;
  participation_rate: number;
  total_hours: number;
  member_since: string;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  cover_url: string | null;
  category: string;
  created_by: string | null;
  is_active: boolean;
  member_count_cache: number;
  created_at: string;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role_in_club: ClubRole;
  joined_at: string;
  is_active: boolean;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  organizer_type: OrganizerType;
  organizer_id: string;
  banner_url: string | null;
  venue: string;
  mode: EventMode;
  meeting_link: string | null;
  category: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  current_participants: number;
  team_based: boolean;
  certificate_enabled: boolean;
  attendance_qr_enabled: boolean;
  status: EventStatus;
  xp_reward: number;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_status: RegistrationStatus;
  qr_code_value: string;
  joined_team_id: string | null;
  certificate_issued: boolean;
  certificate_url: string | null;
  checked_in_at: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  event_id: string;
  team_name: string;
  leader_id: string;
  max_members: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
  badge_color: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface XpLog {
  id: string;
  user_id: string;
  event_id: string | null;
  action_type: string;
  xp_change: number;
  description: string;
  created_at: string;
}

export interface Comment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  target_type: 'campus' | 'club' | 'event';
  target_id: string | null;
  title: string;
  content: string;
  posted_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_link: string | null;
  created_at: string;
}

export interface EventFeedback {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  feedback_text: string;
  created_at: string;
}

export interface SavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  event_id: string;
  user_id: string;
  registration_id: string;
  certificate_number: string;
  certificate_url: string | null;
  issued_at: string;
}

export interface MockUser {
  id: string;
  email: string;
  password: string;
}

export interface EventCommentView extends Comment {
  author: Profile | undefined;
  replies: EventCommentView[];
}

export interface EventFeedbackView extends EventFeedback {
  author: Profile | undefined;
}

export interface CertificateView extends Certificate {
  event: EventView | undefined;
  profile: Profile | undefined;
}

export interface ClubView extends Club {
  members: ClubMember[];
  featuredCoordinator?: Profile;
  upcomingEvents: EventView[];
  pastEvents: EventView[];
  isJoined?: boolean;
}

export interface EventView extends Event {
  organizerProfile?: Profile;
  organizerClub?: Club;
  registrations?: EventRegistration[];
  comments?: EventCommentView[];
  feedback?: EventFeedbackView[];
  userRegistration?: EventRegistration | null;
  isSaved?: boolean;
}

export interface LeaderboardEntry {
  profile: Profile;
  badges: Badge[];
  attendedEvents: number;
}

export interface DashboardStats {
  totalXp: number;
  campusRank: number;
  eventsJoined: number;
  badges: number;
}

export interface DashboardSnapshot {
  stats: DashboardStats;
  upcomingEvents: EventView[];
  recommendedEvents: EventView[];
  announcements: Announcement[];
  categoryStats: Array<{ name: string; value: number; color: string }>;
  xpProgress: {
    current: number;
    nextLevelAt: number;
    progress: number;
    level: number;
  };
  savedCount: number;
}

export interface AdminDashboardSnapshot {
  metrics: {
    totalStudents: number;
    totalEvents: number;
    activeClubs: number;
    averageParticipation: number;
    pendingApprovals: number;
  };
  participationTrend: Array<{ month: string; participants: number }>;
  topClubs: Array<{ name: string; members: number }>;
  eventsByCategory: Array<{ name: string; value: number }>;
  eventsByMonth: Array<{ month: string; hosted: number }>;
  topEvents: Array<{ title: string; registrations: number }>;
  attendanceSummary: Array<{ label: string; value: number }>;
  pendingEvents: EventView[];
}

export interface OrganizerDashboardSnapshot {
  metrics: {
    clubsManaged: number;
    managedEvents: number;
    liveEvents: number;
    pendingReview: number;
    totalRegistrations: number;
    attendanceRate: number;
  };
  registrationTrend: Array<{ month: string; registrations: number }>;
  statusBreakdown: Array<{ name: string; value: number; fill: string }>;
  upcomingEvents: EventView[];
  attentionEvents: EventView[];
  clubsManagedList: Array<{
    club: Club;
    members: number;
    activeEvents: number;
    pendingEvents: number;
  }>;
  recentAnnouncements: Announcement[];
}

export interface AuthSessionState {
  user: {
    id: string;
    email: string;
  } | null;
  profile: Profile | null;
  loading: boolean;
}

export interface AppState {
  profiles: Profile[];
  clubs: Club[];
  clubMembers: ClubMember[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  teams: Team[];
  teamMembers: TeamMember[];
  badges: Badge[];
  userBadges: UserBadge[];
  xpLogs: XpLog[];
  comments: Comment[];
  announcements: Announcement[];
  notifications: Notification[];
  feedback: EventFeedback[];
  savedEvents: SavedEvent[];
  certificates: Certificate[];
  mockUsers: MockUser[];
}
