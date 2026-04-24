import {
  format,
  isAfter,
  isFuture,
  isPast,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';

import { CATEGORY_COLORS } from '@/lib/constants/app';
import { supabase } from '@/lib/supabase/client';
import { getXpProgress } from '@/lib/utils/gamification';
import { generateCertificateNumber } from '@/lib/utils/qr';
import { getMockState, saveMockState } from '@/services/mock-db';
import type {
  AdminDashboardSnapshot,
  Announcement,
  AppState,
  Badge,
  Certificate,
  Club,
  ClubMember,
  ClubView,
  Comment,
  DashboardSnapshot,
  Event,
  EventCommentView,
  EventFeedback,
  EventFeedbackView,
  EventRegistration,
  EventStatus,
  EventView,
  LeaderboardEntry,
  Notification,
  OrganizerDashboardSnapshot,
  Profile,
  SavedEvent,
  UserRole,
} from '@/types';

const REGISTRATION_XP = 20;

const loadSupabaseState = async (): Promise<AppState> => {
  const [
    profiles,
    clubs,
    clubMembers,
    events,
    registrations,
    teams,
    teamMembers,
    badges,
    userBadges,
    xpLogs,
    comments,
    announcements,
    notifications,
    feedback,
    savedEvents,
    certificates,
  ] = await Promise.all([
    supabase!.from('profiles').select('*'),
    supabase!.from('clubs').select('*'),
    supabase!.from('club_members').select('*'),
    supabase!.from('events').select('*'),
    supabase!.from('event_registrations').select('*'),
    supabase!.from('teams').select('*'),
    supabase!.from('team_members').select('*'),
    supabase!.from('badges').select('*'),
    supabase!.from('user_badges').select('*'),
    supabase!.from('xp_logs').select('*'),
    supabase!.from('comments').select('*'),
    supabase!.from('announcements').select('*'),
    supabase!.from('notifications').select('*'),
    supabase!.from('event_feedback').select('*'),
    supabase!.from('saved_events').select('*'),
    supabase!.from('certificates').select('*'),
  ]);

  const responses = [
    profiles,
    clubs,
    clubMembers,
    events,
    registrations,
    teams,
    teamMembers,
    badges,
    userBadges,
    xpLogs,
    comments,
    announcements,
    notifications,
    feedback,
    savedEvents,
    certificates,
  ];

  const failingResponse = responses.find((response) => response.error);

  if (failingResponse?.error) {
    throw failingResponse.error;
  }

  return {
    profiles: (profiles.data ?? []) as Profile[],
    clubs: (clubs.data ?? []) as Club[],
    clubMembers: (clubMembers.data ?? []) as ClubMember[],
    events: (events.data ?? []) as Event[],
    eventRegistrations: (registrations.data ?? []) as EventRegistration[],
    teams: (teams.data ?? []) as AppState['teams'],
    teamMembers: (teamMembers.data ?? []) as AppState['teamMembers'],
    badges: (badges.data ?? []) as Badge[],
    userBadges: (userBadges.data ?? []) as AppState['userBadges'],
    xpLogs: (xpLogs.data ?? []) as AppState['xpLogs'],
    comments: (comments.data ?? []) as Comment[],
    announcements: (announcements.data ?? []) as Announcement[],
    notifications: (notifications.data ?? []) as Notification[],
    feedback: (feedback.data ?? []) as EventFeedback[],
    savedEvents: (savedEvents.data ?? []) as SavedEvent[],
    certificates: (certificates.data ?? []) as Certificate[],
    mockUsers: [],
  };
};

const loadState = async () => (supabase ? loadSupabaseState() : getMockState());

const getProfile = (state: AppState, userId?: string | null) =>
  state.profiles.find((profile) => profile.id === userId);

const buildCommentTree = (state: AppState, eventId: string): EventCommentView[] => {
  const comments = state.comments.filter((comment) => comment.event_id === eventId);

  const byParent = comments.reduce<Record<string, Comment[]>>((acc, comment) => {
    const key = comment.parent_id ?? 'root';
    acc[key] = acc[key] ?? [];
    acc[key].push(comment);
    return acc;
  }, {});

  const attach = (comment: Comment): EventCommentView => ({
    ...comment,
    author: state.profiles.find((profile) => profile.id === comment.user_id),
    replies: (byParent[comment.id] ?? []).map(attach),
  });

  return (byParent.root ?? []).map(attach);
};

const hydrateFeedback = (state: AppState, eventId: string): EventFeedbackView[] =>
  state.feedback
    .filter((entry) => entry.event_id === eventId)
    .map((entry) => ({
      ...entry,
      author: state.profiles.find((profile) => profile.id === entry.user_id),
    }));

const hydrateEvent = (state: AppState, event: Event, userId?: string | null): EventView => ({
  ...event,
  organizerProfile:
    event.organizer_type === 'admin'
      ? state.profiles.find((profile) => profile.id === event.organizer_id)
      : undefined,
  organizerClub:
    event.organizer_type === 'club'
      ? state.clubs.find((club) => club.id === event.organizer_id)
      : undefined,
  registrations: state.eventRegistrations.filter((registration) => registration.event_id === event.id),
  comments: buildCommentTree(state, event.id),
  feedback: hydrateFeedback(state, event.id),
  userRegistration:
    state.eventRegistrations.find(
      (registration) => registration.event_id === event.id && registration.user_id === userId,
    ) ?? null,
  isSaved: Boolean(
    state.savedEvents.find((saved) => saved.event_id === event.id && saved.user_id === userId),
  ),
});

const relevantAnnouncements = (state: AppState, userId?: string | null) => {
  if (!userId) {
    return state.announcements.filter((announcement) => announcement.target_type === 'campus');
  }

  const joinedClubIds = state.clubMembers
    .filter((member) => member.user_id === userId && member.is_active)
    .map((member) => member.club_id);
  const registeredEventIds = state.eventRegistrations
    .filter((registration) => registration.user_id === userId)
    .map((registration) => registration.event_id);

  return state.announcements.filter((announcement) => {
    if (announcement.target_type === 'campus') return true;
    if (announcement.target_type === 'club') return joinedClubIds.includes(announcement.target_id ?? '');
    if (announcement.target_type === 'event') return registeredEventIds.includes(announcement.target_id ?? '');
    return false;
  });
};

const evaluateBadgesForUser = (state: AppState, userId: string) => {
  const existingBadgeIds = new Set(
    state.userBadges.filter((entry) => entry.user_id === userId).map((entry) => entry.badge_id),
  );
  const attendedEvents = state.eventRegistrations.filter(
    (registration) => registration.user_id === userId && registration.registration_status === 'attended',
  ).length;
  const clubsJoined = state.clubMembers.filter(
    (member) => member.user_id === userId && member.is_active,
  ).length;
  const totalXp = getProfile(state, userId)?.total_xp ?? 0;

  const nextBadges = state.badges.filter((badge) => {
    if (existingBadgeIds.has(badge.id)) return false;
    if (badge.criteria_type === 'events_attended') return attendedEvents >= badge.criteria_value;
    if (badge.criteria_type === 'xp_total') return totalXp >= badge.criteria_value;
    if (badge.criteria_type === 'clubs_joined') return clubsJoined >= badge.criteria_value;
    return false;
  });

  if (!nextBadges.length) return state;

  return {
    ...state,
    userBadges: [
      ...state.userBadges,
      ...nextBadges.map((badge) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        badge_id: badge.id,
        earned_at: new Date().toISOString(),
      })),
    ],
    notifications: [
      ...state.notifications,
      ...nextBadges.map((badge) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        title: 'Badge unlocked',
        message: `You earned the ${badge.name} badge.`,
        type: 'badge',
        is_read: false,
        related_link: '/app/profile',
        created_at: new Date().toISOString(),
      })),
    ],
  };
};

const persistState = (nextState: AppState) => (supabase ? nextState : saveMockState(nextState));

const getLeaderboardEntries = (state: AppState): LeaderboardEntry[] =>
  state.profiles
    .filter((profile) => profile.role === 'student')
    .sort((a, b) => b.total_xp - a.total_xp)
    .map((profile) => ({
      profile,
      badges: state.userBadges
        .filter((entry) => entry.user_id === profile.id)
        .map((entry) => state.badges.find((badge) => badge.id === entry.badge_id))
        .filter(Boolean) as Badge[],
      attendedEvents: state.eventRegistrations.filter(
        (registration) =>
          registration.user_id === profile.id && registration.registration_status === 'attended',
      ).length,
    }));

const recommendEvents = (state: AppState, userId: string) => {
  const profile = getProfile(state, userId);
  const savedEventIds = new Set(
    state.savedEvents.filter((entry) => entry.user_id === userId).map((entry) => entry.event_id),
  );
  const attendedCategories = state.eventRegistrations
    .filter(
      (registration) =>
        registration.user_id === userId &&
        ['registered', 'attended'].includes(registration.registration_status),
    )
    .map((registration) => state.events.find((event) => event.id === registration.event_id)?.category)
    .filter(Boolean) as string[];
  const affinityCategories = new Set([profile?.favorite_category, ...attendedCategories].filter(Boolean));

  const ranked = state.events
    .filter((event) => ['approved', 'full'].includes(event.status) && isFuture(parseISO(event.start_time)))
    .sort((a, b) => {
      const aScore =
        (affinityCategories.has(a.category) ? 20 : 0) +
        (savedEventIds.has(a.id) ? 10 : 0) +
        a.current_participants;
      const bScore =
        (affinityCategories.has(b.category) ? 20 : 0) +
        (savedEventIds.has(b.id) ? 10 : 0) +
        b.current_participants;
      return bScore - aScore;
    });

  return ranked.slice(0, 4).map((event) => hydrateEvent(state, event, userId));
};

const canManageClubEvents = (state: AppState, userId: string, clubId: string) => {
  const profile = getProfile(state, userId);
  if (profile?.role === 'admin') return true;
  return state.clubMembers.some(
    (member) =>
      member.user_id === userId &&
      member.club_id === clubId &&
      ['coordinator', 'president'].includes(member.role_in_club),
  );
};

const getManagedClubs = (state: AppState, userId: string) =>
  state.clubs.filter((club) => canManageClubEvents(state, userId, club.id));

export const platformService = {
  async getPublicEvents(filters?: { search?: string; category?: string; upcomingOnly?: boolean }) {
    const state = await loadState();
    const search = filters?.search?.trim().toLowerCase();

    return state.events
      .filter((event) => ['approved', 'completed', 'full'].includes(event.status))
      .filter((event) => (filters?.upcomingOnly ? isAfter(parseISO(event.end_time), new Date()) : true))
      .filter((event) =>
        filters?.category && filters.category !== 'All' ? event.category === filters.category : true,
      )
      .filter((event) =>
        search
          ? [event.title, event.short_description, event.description, event.category]
              .join(' ')
              .toLowerCase()
              .includes(search)
          : true,
      )
      .sort((a, b) => Number(parseISO(a.start_time)) - Number(parseISO(b.start_time)))
      .map((event) => hydrateEvent(state, event));
  },

  async getEventBySlug(slug: string, userId?: string | null) {
    const state = await loadState();
    const event = state.events.find((entry) => entry.slug === slug);
    return event ? hydrateEvent(state, event, userId) : null;
  },

  async getEventById(eventId: string, userId?: string | null) {
    const state = await loadState();
    const event = state.events.find((entry) => entry.id === eventId);
    return event ? hydrateEvent(state, event, userId) : null;
  },

  async getDashboard(userId: string): Promise<DashboardSnapshot> {
    const state = await loadState();
    const profile = getProfile(state, userId);
    const registrations = state.eventRegistrations.filter((entry) => entry.user_id === userId);
    const userBadges = state.userBadges.filter((entry) => entry.user_id === userId);
    const upcomingEvents = registrations
      .map((entry) => state.events.find((event) => event.id === entry.event_id))
      .filter(Boolean)
      .filter((event) => event && isFuture(parseISO(event.start_time)))
      .slice(0, 4)
      .map((event) => hydrateEvent(state, event!, userId));

    const categoryStats = Object.entries(
      registrations.reduce<Record<string, number>>((acc, registration) => {
        const event = state.events.find((entry) => entry.id === registration.event_id);
        if (!event) return acc;
        acc[event.category] = (acc[event.category] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] ?? '#FFB800',
    }));

    const xpProgress = getXpProgress(profile?.total_xp ?? 0);

    return {
      stats: {
        totalXp: profile?.total_xp ?? 0,
        campusRank: profile?.rank_cache ?? 0,
        eventsJoined: registrations.length,
        badges: userBadges.length,
      },
      upcomingEvents,
      recommendedEvents: recommendEvents(state, userId),
      announcements: relevantAnnouncements(state, userId)
        .sort((a, b) => Number(parseISO(b.created_at)) - Number(parseISO(a.created_at)))
        .slice(0, 5),
      categoryStats,
      xpProgress: {
        ...xpProgress,
        current: profile?.total_xp ?? 0,
      },
      savedCount: state.savedEvents.filter((entry) => entry.user_id === userId).length,
    };
  },

  async getClubs(userId?: string | null): Promise<ClubView[]> {
    const state = await loadState();

    return state.clubs.map((club) => ({
      ...club,
      members: state.clubMembers.filter((member) => member.club_id === club.id && member.is_active),
      featuredCoordinator: state.profiles.find((profile) =>
        state.clubMembers.some(
          (member) =>
            member.club_id === club.id &&
            member.user_id === profile.id &&
            ['coordinator', 'president'].includes(member.role_in_club),
        ),
      ),
      upcomingEvents: state.events.filter(
        (event) =>
          event.organizer_type === 'club' &&
          event.organizer_id === club.id &&
          !isPast(parseISO(event.end_time)) &&
          ['approved', 'full'].includes(event.status),
      ).map((event) => hydrateEvent(state, event, userId)),
      pastEvents: state.events.filter(
        (event) =>
          event.organizer_type === 'club' &&
          event.organizer_id === club.id &&
          isPast(parseISO(event.end_time)),
      ).map((event) => hydrateEvent(state, event, userId)),
      isJoined: Boolean(
        state.clubMembers.find(
          (member) => member.club_id === club.id && member.user_id === userId && member.is_active,
        ),
      ),
    }));
  },

  async getClubBySlug(slug: string, userId?: string | null) {
    const clubs = await this.getClubs(userId);
    return clubs.find((club) => club.slug === slug) ?? null;
  },

  async joinClub(userId: string, clubId: string) {
    if (supabase) {
      const { error } = await supabase.from('club_members').insert({
        club_id: clubId,
        user_id: userId,
      });
      if (error) throw error;
      return;
    }

    const state = getMockState();
    if (state.clubMembers.some((member) => member.club_id === clubId && member.user_id === userId)) {
      return;
    }

    const nextState = evaluateBadgesForUser(
      {
        ...state,
        clubMembers: [
          ...state.clubMembers,
          {
            id: crypto.randomUUID(),
            club_id: clubId,
            user_id: userId,
            role_in_club: 'member',
            joined_at: new Date().toISOString(),
            is_active: true,
          },
        ],
        notifications: [
          ...state.notifications,
          {
            id: crypto.randomUUID(),
            user_id: userId,
            title: 'Club joined',
            message: 'You are now part of a new campus club.',
            type: 'club',
            is_read: false,
            related_link: '/app/clubs',
            created_at: new Date().toISOString(),
          },
        ],
      },
      userId,
    );

    persistState(nextState);
  },

  async getLeaderboard() {
    const state = await loadState();
    return getLeaderboardEntries(state);
  },

  async getNotifications(userId: string) {
    const state = await loadState();
    return state.notifications
      .filter((notification) => notification.user_id === userId)
      .sort((a, b) => Number(parseISO(b.created_at)) - Number(parseISO(a.created_at)));
  },

  async markNotificationRead(notificationId: string) {
    if (supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
      return;
    }

    const state = getMockState();
    persistState({
      ...state,
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification,
      ),
    });
  },

  async getProfileSummary(userId: string) {
    const state = await loadState();
    const profile = getProfile(state, userId);
    const registrations = state.eventRegistrations.filter((entry) => entry.user_id === userId);
    const attendedEvents = registrations
      .filter((entry) => entry.registration_status === 'attended')
      .map((entry) => state.events.find((event) => event.id === entry.event_id))
      .filter(Boolean) as Event[];
    const joinedClubs = state.clubMembers
      .filter((member) => member.user_id === userId && member.is_active)
      .map((member) => state.clubs.find((club) => club.id === member.club_id))
      .filter(Boolean) as Club[];
    const badges = state.userBadges
      .filter((badge) => badge.user_id === userId)
      .map((entry) => state.badges.find((badge) => badge.id === entry.badge_id))
      .filter(Boolean) as Badge[];
    const recentAchievements = state.xpLogs
      .filter((entry) => entry.user_id === userId)
      .sort((a, b) => Number(parseISO(b.created_at)) - Number(parseISO(a.created_at)))
      .slice(0, 5);

    return {
      profile,
      attendedEvents,
      registrations: registrations.map((entry) => ({
        ...entry,
        event: state.events.find((event) => event.id === entry.event_id),
      })),
      joinedClubs,
      badges,
      recentAchievements,
    };
  },

  async getSavedEvents(userId: string) {
    const state = await loadState();
    return state.savedEvents
      .filter((entry) => entry.user_id === userId)
      .map((entry) => state.events.find((event) => event.id === entry.event_id))
      .filter(Boolean)
      .map((event) => hydrateEvent(state, event!, userId));
  },

  async toggleSavedEvent(userId: string, eventId: string) {
    if (supabase) {
      const existing = await supabase
        .from('saved_events')
        .select('id')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();
      if (existing.error) throw existing.error;

      if (existing.data?.id) {
        const { error } = await supabase.from('saved_events').delete().eq('id', existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('saved_events').insert({ user_id: userId, event_id: eventId });
        if (error) throw error;
      }
      return;
    }

    const state = getMockState();
    const existing = state.savedEvents.find((entry) => entry.user_id === userId && entry.event_id === eventId);

    persistState({
      ...state,
      savedEvents: existing
        ? state.savedEvents.filter((entry) => entry.id !== existing.id)
        : [
            ...state.savedEvents,
            {
              id: crypto.randomUUID(),
              user_id: userId,
              event_id: eventId,
              created_at: new Date().toISOString(),
            },
          ],
    });
  },

  async registerForEvent(userId: string, eventId: string) {
    if (supabase) {
      const { error } = await supabase.from('event_registrations').insert({
        user_id: userId,
        event_id: eventId,
      });

      if (error) throw error;
      return;
    }

    const state = getMockState();

    if (state.eventRegistrations.some((entry) => entry.user_id === userId && entry.event_id === eventId)) {
      return;
    }

    const event = state.events.find((entry) => entry.id === eventId);
    if (!event) throw new Error('Event not found.');

    const updatedProfiles = state.profiles.map((profile) =>
      profile.id === userId
        ? {
            ...profile,
            total_xp: profile.total_xp + REGISTRATION_XP,
            updated_at: new Date().toISOString(),
          }
        : profile,
    );

    const nextState = evaluateBadgesForUser(
      {
        ...state,
        profiles: updatedProfiles,
        eventRegistrations: [
          ...state.eventRegistrations,
          {
            id: crypto.randomUUID(),
            event_id: eventId,
            user_id: userId,
            registration_status: 'registered',
            qr_code_value: `UVR-${eventId.slice(0, 5).toUpperCase()}-${userId.slice(0, 5).toUpperCase()}-${Math.floor(
              Math.random() * 9999,
            )}`,
            joined_team_id: null,
            certificate_issued: false,
            certificate_url: null,
            checked_in_at: null,
            created_at: new Date().toISOString(),
          },
        ],
        xpLogs: [
          ...state.xpLogs,
          {
            id: crypto.randomUUID(),
            user_id: userId,
            event_id: eventId,
            action_type: 'registration',
            xp_change: REGISTRATION_XP,
            description: `Registered for ${event.title}`,
            created_at: new Date().toISOString(),
          },
        ],
        notifications: [
          ...state.notifications,
          {
            id: crypto.randomUUID(),
            user_id: userId,
            title: 'Registration confirmed',
            message: `Your spot for ${event.title} is confirmed.`,
            type: 'registration',
            is_read: false,
            related_link: `/app/events/${event.slug}`,
            created_at: new Date().toISOString(),
          },
        ],
      },
      userId,
    );

    persistState(nextState);
  },

  async getMyRegistrations(userId: string) {
    const state = await loadState();
    return state.eventRegistrations
      .filter((entry) => entry.user_id === userId)
      .sort((a, b) => Number(parseISO(b.created_at)) - Number(parseISO(a.created_at)))
      .map((entry) => ({
        ...entry,
        event: hydrateEvent(
          state,
          state.events.find((event) => event.id === entry.event_id)!,
          userId,
        ),
      }));
  },

  async addComment(userId: string, eventId: string, content: string, parentId?: string | null) {
    if (supabase) {
      const { error } = await supabase.from('comments').insert({
        event_id: eventId,
        user_id: userId,
        content,
        parent_id: parentId ?? null,
      });
      if (error) throw error;
      return;
    }

    const state = getMockState();
    persistState({
      ...state,
      comments: [
        ...state.comments,
        {
          id: crypto.randomUUID(),
          event_id: eventId,
          user_id: userId,
          content,
          parent_id: parentId ?? null,
          created_at: new Date().toISOString(),
        },
      ],
    });
  },

  async submitFeedback(userId: string, eventId: string, rating: number, feedbackText: string) {
    if (supabase) {
      const { error } = await supabase.from('event_feedback').upsert(
        {
          user_id: userId,
          event_id: eventId,
          rating,
          feedback_text: feedbackText,
        },
        { onConflict: 'event_id,user_id' },
      );

      if (error) throw error;
      return;
    }

    const state = getMockState();
    const existing = state.feedback.find((entry) => entry.user_id === userId && entry.event_id === eventId);

    persistState({
      ...state,
      feedback: existing
        ? state.feedback.map((entry) =>
            entry.id === existing.id
              ? { ...entry, rating, feedback_text: feedbackText, created_at: new Date().toISOString() }
              : entry,
          )
        : [
            ...state.feedback,
            {
              id: crypto.randomUUID(),
              user_id: userId,
              event_id: eventId,
              rating,
              feedback_text: feedbackText,
              created_at: new Date().toISOString(),
            },
          ],
    });
  },

  async getAdminDashboard(userId: string): Promise<AdminDashboardSnapshot> {
    const state = await loadState();
    const now = new Date();
    const students = state.profiles.filter((profile) => profile.role === 'student');
    const activeClubs = state.clubs.filter((club) => club.is_active);
    const approvedEvents = state.events.filter((event) => ['approved', 'completed', 'full'].includes(event.status));

    const participationTrend = Array.from({ length: 6 }).map((_, index) => {
      const monthStart = startOfMonth(subMonths(now, 5 - index));
      return {
        month: format(monthStart, 'MMM'),
        participants: state.eventRegistrations.filter((registration) => {
          const event = state.events.find((entry) => entry.id === registration.event_id);
          return event ? isSameMonth(parseISO(event.start_time), monthStart) : false;
        }).length,
      };
    });

    const topClubs = activeClubs
      .map((club) => ({
        name: club.name,
        members: state.clubMembers.filter((member) => member.club_id === club.id && member.is_active)
          .length,
      }))
      .sort((a, b) => b.members - a.members)
      .slice(0, 5);

    const eventsByCategory = Object.entries(
      approvedEvents.reduce<Record<string, number>>((acc, event) => {
        acc[event.category] = (acc[event.category] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));

    const eventsByMonth = Array.from({ length: 6 }).map((_, index) => {
      const monthStart = startOfMonth(subMonths(now, 5 - index));
      return {
        month: format(monthStart, 'MMM'),
        hosted: approvedEvents.filter((event) => isSameMonth(parseISO(event.start_time), monthStart)).length,
      };
    });

    const topEvents = approvedEvents
      .map((event) => ({
        title: event.title,
        registrations: state.eventRegistrations.filter((registration) => registration.event_id === event.id).length,
      }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 5);

    const attendanceSummary = [
      {
        label: 'Registered',
        value: state.eventRegistrations.filter((registration) => registration.registration_status === 'registered')
          .length,
      },
      {
        label: 'Attended',
        value: state.eventRegistrations.filter((registration) => registration.registration_status === 'attended')
          .length,
      },
      {
        label: 'Absent',
        value: state.eventRegistrations.filter((registration) => registration.registration_status === 'absent').length,
      },
    ];

    const pendingEvents = state.events
      .filter((event) => event.status === 'pending')
      .map((event) => hydrateEvent(state, event, userId));

    return {
      metrics: {
        totalStudents: students.length,
        totalEvents: state.events.length,
        activeClubs: activeClubs.length,
        averageParticipation:
          approvedEvents.length === 0
            ? 0
            : Math.round(
                approvedEvents.reduce((sum, event) => sum + (event.current_participants / event.max_participants) * 100, 0) /
                  approvedEvents.length,
              ),
        pendingApprovals: pendingEvents.length,
      },
      participationTrend,
      topClubs,
      eventsByCategory,
      eventsByMonth,
      topEvents,
      attendanceSummary,
      pendingEvents,
    };
  },

  async getOrganizerDashboard(userId: string): Promise<OrganizerDashboardSnapshot> {
    const state = await loadState();
    const now = new Date();
    const managedClubs = getManagedClubs(state, userId);
    const managedClubIds = new Set(managedClubs.map((club) => club.id));
    const managedEventsRaw = state.events.filter(
      (event) =>
        event.created_by === userId ||
        (event.organizer_type === 'club' && managedClubIds.has(event.organizer_id)),
    );
    const managedEventIds = new Set(managedEventsRaw.map((event) => event.id));
    const registrations = state.eventRegistrations.filter((registration) =>
      managedEventIds.has(registration.event_id),
    );
    const attendedCount = registrations.filter(
      (registration) => registration.registration_status === 'attended',
    ).length;
    const totalRegistrations = registrations.length;
    const statusLabels: Record<EventStatus, string> = {
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      full: 'Full',
    };
    const statusColors: Record<EventStatus, string> = {
      draft: '#D1D5DB',
      pending: '#49D6FF',
      approved: '#1F7DFF',
      rejected: '#FF4DBA',
      completed: '#7A4DFF',
      cancelled: '#9CA3AF',
      full: '#FFB800',
    };

    return {
      metrics: {
        clubsManaged: managedClubs.length,
        managedEvents: managedEventsRaw.length,
        liveEvents: managedEventsRaw.filter(
          (event) =>
            ['approved', 'full'].includes(event.status) &&
            isFuture(parseISO(event.end_time)),
        ).length,
        pendingReview: managedEventsRaw.filter((event) => event.status === 'pending').length,
        totalRegistrations,
        attendanceRate:
          totalRegistrations === 0 ? 0 : Math.round((attendedCount / totalRegistrations) * 100),
      },
      registrationTrend: Array.from({ length: 6 }).map((_, index) => {
        const monthStart = startOfMonth(subMonths(now, 5 - index));
        return {
          month: format(monthStart, 'MMM'),
          registrations: registrations.filter((registration) =>
            isSameMonth(parseISO(registration.created_at), monthStart),
          ).length,
        };
      }),
      statusBreakdown: (
        ['pending', 'approved', 'full', 'completed', 'rejected', 'cancelled'] as EventStatus[]
      )
        .map((status) => ({
          name: statusLabels[status],
          value: managedEventsRaw.filter((event) => event.status === status).length,
          fill: statusColors[status],
        }))
        .filter((entry) => entry.value > 0),
      upcomingEvents: managedEventsRaw
        .filter(
          (event) =>
            ['approved', 'full', 'pending'].includes(event.status) &&
            isFuture(parseISO(event.end_time)),
        )
        .sort((a, b) => Number(parseISO(a.start_time)) - Number(parseISO(b.start_time)))
        .slice(0, 4)
        .map((event) => hydrateEvent(state, event, userId)),
      attentionEvents: managedEventsRaw
        .filter((event) => ['pending', 'rejected'].includes(event.status))
        .sort((a, b) => Number(parseISO(b.updated_at)) - Number(parseISO(a.updated_at)))
        .slice(0, 5)
        .map((event) => hydrateEvent(state, event, userId)),
      clubsManagedList: managedClubs
        .map((club) => ({
          club,
          members: state.clubMembers.filter(
            (member) => member.club_id === club.id && member.is_active,
          ).length,
          activeEvents: managedEventsRaw.filter(
            (event) =>
              event.organizer_type === 'club' &&
              event.organizer_id === club.id &&
              ['approved', 'full'].includes(event.status) &&
              isFuture(parseISO(event.end_time)),
          ).length,
          pendingEvents: managedEventsRaw.filter(
            (event) =>
              event.organizer_type === 'club' &&
              event.organizer_id === club.id &&
              event.status === 'pending',
          ).length,
        }))
        .sort((a, b) => b.pendingEvents - a.pendingEvents || b.activeEvents - a.activeEvents),
      recentAnnouncements: state.announcements
        .filter(
          (announcement) =>
            announcement.posted_by === userId ||
            (announcement.target_type === 'club' &&
              managedClubIds.has(announcement.target_id ?? '')) ||
            (announcement.target_type === 'event' &&
              managedEventIds.has(announcement.target_id ?? '')),
        )
        .sort((a, b) => Number(parseISO(b.created_at)) - Number(parseISO(a.created_at)))
        .slice(0, 5),
    };
  },

  async getManagedEvents(userId: string, role: UserRole) {
    const state = await loadState();

    return state.events
      .filter((event) => {
        if (role === 'admin') return true;
        if (event.created_by === userId) return true;
        if (event.organizer_type === 'club') return canManageClubEvents(state, userId, event.organizer_id);
        return false;
      })
      .sort((a, b) => Number(parseISO(b.created_at)) - Number(parseISO(a.created_at)))
      .map((event) => hydrateEvent(state, event, userId));
  },

  async createEvent(
    userId: string,
    role: UserRole,
    payload: Partial<Event> & Pick<Event, 'title' | 'description' | 'category' | 'start_time' | 'end_time'>,
  ) {
    const state = await loadState();

    if (role !== 'admin') {
      if (payload.organizer_type === 'admin') {
        throw new Error('Only admins can create campus-owned events.');
      }

      if (!payload.organizer_id || !canManageClubEvents(state, userId, payload.organizer_id)) {
        throw new Error('You can only create events for clubs you manage.');
      }
    }

    const body = {
      ...payload,
      short_description: payload.short_description ?? payload.description.slice(0, 120),
      slug: payload.slug ?? payload.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      organizer_type: payload.organizer_type ?? 'club',
      max_participants: payload.max_participants ?? 100,
      venue: payload.venue ?? 'TBA',
      mode: payload.mode ?? 'offline',
      meeting_link: payload.meeting_link ?? null,
      registration_deadline: payload.registration_deadline ?? payload.start_time,
      team_based: payload.team_based ?? false,
      certificate_enabled: payload.certificate_enabled ?? true,
      attendance_qr_enabled: payload.attendance_qr_enabled ?? true,
      status: role === 'admin' ? 'approved' : 'pending',
      xp_reward: payload.xp_reward ?? 50,
      created_by: userId,
      approved_by: role === 'admin' ? userId : null,
    };

    if (supabase) {
      const { error } = await supabase.from('events').insert(body);
      if (error) throw error;
      return;
    }

    const mockState = getMockState();
    persistState({
      ...mockState,
      events: [
        ...mockState.events,
        {
          id: crypto.randomUUID(),
          banner_url: null,
          current_participants: 0,
          organizer_id: body.organizer_id ?? 'club-innovators',
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          ...body,
        } as Event,
      ],
    });
  },

  async updateEvent(eventId: string, userId: string, role: UserRole, updates: Partial<Event>) {
    const state = await loadState();
    const currentEvent = state.events.find((event) => event.id === eventId);

    if (!currentEvent) {
      throw new Error('Event not found.');
    }

    if (
      role !== 'admin' &&
      currentEvent.organizer_type === 'club' &&
      !canManageClubEvents(state, userId, currentEvent.organizer_id)
    ) {
      throw new Error('You can only edit events for clubs you manage.');
    }

    if (role !== 'admin' && updates.organizer_type === 'admin') {
      throw new Error('Only admins can assign campus-owned events.');
    }

    if (
      role !== 'admin' &&
      updates.organizer_id &&
      (updates.organizer_type ?? currentEvent.organizer_type) === 'club' &&
      !canManageClubEvents(state, userId, updates.organizer_id)
    ) {
      throw new Error('You can only assign events to clubs you manage.');
    }

    const requiresApproval =
      role !== 'admin' && !['completed', 'cancelled'].includes(currentEvent.status);

    const normalizedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
      ...(requiresApproval
        ? {
            status: 'pending' as EventStatus,
            approved_by: null,
          }
        : {}),
    };

    if (supabase) {
      const { error } = await supabase
        .from('events')
        .update(normalizedUpdates)
        .eq('id', eventId);
      if (error) throw error;
      return;
    }

    const mockState = getMockState();
    persistState({
      ...mockState,
      events: mockState.events.map((event) =>
        event.id === eventId ? { ...event, ...normalizedUpdates } : event,
      ),
    });
  },

  async updateEventStatus(eventId: string, status: EventStatus, reviewerId?: string) {
    if (supabase) {
      const { error } = await supabase
        .from('events')
        .update({
          status,
          approved_by: status === 'approved' ? reviewerId : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);
      if (error) throw error;
      return;
    }

    const state = getMockState();
    persistState({
      ...state,
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status,
              approved_by: status === 'approved' ? reviewerId ?? null : null,
              updated_at: new Date().toISOString(),
            }
          : event,
      ),
    });
  },

  async createAnnouncement(userId: string, title: string, content: string, targetType: Announcement['target_type'], targetId?: string | null) {
    const normalizedTargetId = targetType === 'campus' ? null : targetId?.trim() || null;

    if (supabase) {
      const { error } = await supabase.from('announcements').insert({
        posted_by: userId,
        title,
        content,
        target_type: targetType,
        target_id: normalizedTargetId,
      });
      if (error) throw error;
      return;
    }

    const state = getMockState();
    persistState({
      ...state,
      announcements: [
        {
          id: crypto.randomUUID(),
          posted_by: userId,
          title,
          content,
          target_type: targetType,
          target_id: normalizedTargetId,
          created_at: new Date().toISOString(),
        },
        ...state.announcements,
      ],
    });
  },

  async getAnnouncements(userId?: string | null) {
    const state = await loadState();
    return relevantAnnouncements(state, userId).sort(
      (a, b) => Number(parseISO(b.created_at)) - Number(parseISO(a.created_at)),
    );
  },

  async getEligibleCertificates(userId: string) {
    const state = await loadState();
    return state.certificates
      .filter((certificate) => certificate.user_id === userId)
      .sort((a, b) => Number(parseISO(b.issued_at)) - Number(parseISO(a.issued_at)))
      .map((certificate) => ({
        ...certificate,
        event: (() => {
          const event = state.events.find((entry) => entry.id === certificate.event_id);
          return event ? hydrateEvent(state, event, userId) : undefined;
        })(),
        profile: state.profiles.find((profile) => profile.id === certificate.user_id),
      }));
  },

  async getEventAttendees(eventId: string) {
    const state = await loadState();
    return state.eventRegistrations
      .filter((registration) => registration.event_id === eventId)
      .map((registration) => ({
        ...registration,
        event: state.events.find((event) => event.id === eventId),
        profile: state.profiles.find((profile) => profile.id === registration.user_id),
        certificate: state.certificates.find((certificate) => certificate.registration_id === registration.id),
      }));
  },

  async markAttendanceByQr(eventId: string, qrValue: string) {
    if (supabase) {
      const registration = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('qr_code_value', qrValue)
        .maybeSingle();

      if (registration.error) throw registration.error;
      if (!registration.data) throw new Error('Invalid QR pass for this event.');
      if (registration.data.registration_status === 'attended') {
        throw new Error('This attendee has already been checked in.');
      }

      const { error } = await supabase
        .from('event_registrations')
        .update({
          registration_status: 'attended',
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', registration.data.id);

      if (error) throw error;

      const state = await loadState();
      const profile = state.profiles.find((entry) => entry.id === registration.data.user_id);
      const event = state.events.find((entry) => entry.id === eventId);

      return { registration: registration.data, profile, event };
    }

    const state = getMockState();
    const target = state.eventRegistrations.find(
      (registration) => registration.event_id === eventId && registration.qr_code_value === qrValue,
    );
    if (!target) throw new Error('Invalid QR pass for this event.');
    if (target.registration_status === 'attended') {
      throw new Error('This attendee has already been checked in.');
    }

    const event = state.events.find((entry) => entry.id === eventId);
    const attendee = state.profiles.find((entry) => entry.id === target.user_id);
    if (!event || !attendee) throw new Error('Unable to match attendee record.');

    const profiles = state.profiles.map((profile) =>
      profile.id === attendee.id
        ? {
            ...profile,
            total_xp: profile.total_xp + event.xp_reward,
            updated_at: new Date().toISOString(),
          }
        : profile,
    );

    const nextState = evaluateBadgesForUser(
      {
        ...state,
        profiles,
        eventRegistrations: state.eventRegistrations.map((registration) =>
          registration.id === target.id
            ? {
                ...registration,
                registration_status: 'attended',
                checked_in_at: new Date().toISOString(),
              }
            : registration,
        ),
        xpLogs: [
          ...state.xpLogs,
          {
            id: crypto.randomUUID(),
            user_id: attendee.id,
            event_id: event.id,
            action_type: 'attendance',
            xp_change: event.xp_reward,
            description: `Attendance marked for ${event.title}`,
            created_at: new Date().toISOString(),
          },
        ],
        notifications: [
          ...state.notifications,
          {
            id: crypto.randomUUID(),
            user_id: attendee.id,
            title: 'Attendance confirmed',
            message: `You checked in successfully for ${event.title}.`,
            type: 'attendance',
            is_read: false,
            related_link: `/app/events/${event.slug}`,
            created_at: new Date().toISOString(),
          },
        ],
      },
      attendee.id,
    );

    persistState(nextState);

    return { registration: target, profile: attendee, event };
  },

  async upsertCertificateRecord(eventId: string, userId: string, registrationId: string, certificateUrl: string) {
    const certificateNumber = generateCertificateNumber(eventId, userId);

    if (supabase) {
      const existing = await supabase
        .from('certificates')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
      if (existing.error) throw existing.error;

      if (existing.data?.id) {
        if (!existing.data.certificate_url) {
          const { data, error } = await supabase
            .from('certificates')
            .update({
              certificate_url: certificateUrl,
            })
            .eq('id', existing.data.id)
            .select('*')
            .single();

          if (error) throw error;

          await supabase
            .from('event_registrations')
            .update({
              certificate_issued: true,
              certificate_url: certificateUrl,
            })
            .eq('id', registrationId);

          return data;
        }

        return existing.data;
      }

      const { data, error } = await supabase
        .from('certificates')
        .insert({
          event_id: eventId,
          user_id: userId,
          registration_id: registrationId,
          certificate_number: certificateNumber,
          certificate_url: certificateUrl,
        })
        .select('*')
        .single();

      if (error) throw error;

      await supabase
        .from('event_registrations')
        .update({
          certificate_issued: true,
          certificate_url: certificateUrl,
        })
        .eq('id', registrationId);

      return data;
    }

    const state = getMockState();
    const existing = state.certificates.find(
      (certificate) => certificate.event_id === eventId && certificate.user_id === userId,
    );
    if (existing) {
      if (!existing.certificate_url) {
        const updated = {
          ...existing,
          certificate_url: certificateUrl,
        };

        persistState({
          ...state,
          certificates: state.certificates.map((certificate) =>
            certificate.id === existing.id ? updated : certificate,
          ),
          eventRegistrations: state.eventRegistrations.map((registration) =>
            registration.id === registrationId
              ? {
                  ...registration,
                  certificate_issued: true,
                  certificate_url: certificateUrl,
                }
              : registration,
          ),
        });

        return updated;
      }

      return existing;
    }

    const certificate = {
      id: crypto.randomUUID(),
      event_id: eventId,
      user_id: userId,
      registration_id: registrationId,
      certificate_number: certificateNumber,
      certificate_url: certificateUrl,
      issued_at: new Date().toISOString(),
    };

    persistState({
      ...state,
      certificates: [...state.certificates, certificate],
      eventRegistrations: state.eventRegistrations.map((registration) =>
        registration.id === registrationId
          ? {
              ...registration,
              certificate_issued: true,
              certificate_url: certificateUrl,
            }
          : registration,
      ),
      notifications: [
        ...state.notifications,
        {
          id: crypto.randomUUID(),
          user_id: userId,
          title: 'Certificate issued',
          message: 'Your event certificate is now available in Certificate Center.',
          type: 'certificate',
          is_read: false,
          related_link: '/app/certificates',
          created_at: new Date().toISOString(),
        },
      ],
    });

    return certificate;
  },
};
