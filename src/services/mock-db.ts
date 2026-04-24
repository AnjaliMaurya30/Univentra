import { createDemoState } from '@/data/demo';
import { calculateLevelFromXp } from '@/lib/utils/gamification';
import type { AppState, Profile } from '@/types';

const DB_KEY = 'univentra.mock.db';
const SESSION_KEY = 'univentra.mock.session';

const normalizeProfiles = (profiles: Profile[]) =>
  profiles
    .slice()
    .sort((a, b) => b.total_xp - a.total_xp)
    .map((profile, index) => ({
      ...profile,
      level: calculateLevelFromXp(profile.total_xp),
      rank_cache: index + 1,
    }));

const normalizeState = (state: AppState): AppState => {
  const profiles = normalizeProfiles(state.profiles);

  return {
    ...state,
    profiles,
    clubs: state.clubs.map((club) => ({
      ...club,
      member_count_cache: state.clubMembers.filter(
        (member) => member.club_id === club.id && member.is_active,
      ).length,
    })),
    events: state.events.map((event) => ({
      ...event,
      current_participants: state.eventRegistrations.filter(
        (registration) =>
          registration.event_id === event.id &&
          ['registered', 'waitlisted', 'attended'].includes(registration.registration_status),
      ).length,
      status:
        event.max_participants > 0 &&
        state.eventRegistrations.filter(
          (registration) =>
            registration.event_id === event.id &&
            ['registered', 'attended'].includes(registration.registration_status),
        ).length >= event.max_participants &&
        event.status === 'approved'
          ? 'full'
          : event.status,
    })),
  };
};

export const getMockState = (): AppState => {
  const raw = localStorage.getItem(DB_KEY);

  if (!raw) {
    const initial = normalizeState(createDemoState());
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return normalizeState(JSON.parse(raw) as AppState);
  } catch {
    const fresh = normalizeState(createDemoState());
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
};

export const saveMockState = (state: AppState) => {
  const normalized = normalizeState(state);
  localStorage.setItem(DB_KEY, JSON.stringify(normalized));
  return normalized;
};

export const resetMockState = () => {
  const fresh = normalizeState(createDemoState());
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  localStorage.removeItem(SESSION_KEY);
  return fresh;
};

export const getMockSession = () => localStorage.getItem(SESSION_KEY);
export const setMockSession = (userId: string) => localStorage.setItem(SESSION_KEY, userId);
export const clearMockSession = () => localStorage.removeItem(SESSION_KEY);
