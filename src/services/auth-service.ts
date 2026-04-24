import { subMinutes } from 'date-fns';

import { supabase } from '@/lib/supabase/client';
import { supabaseEnv } from '@/lib/supabase/env';
import { calculateLevelFromXp } from '@/lib/utils/gamification';
import { clearMockSession, getMockSession, getMockState, saveMockState, setMockSession } from '@/services/mock-db';
import type { AuthSessionState, Profile } from '@/types';

const ensureAllowedDomain = (email: string) => {
  const allowedDomain = supabaseEnv.allowedEmailDomain?.trim().toLowerCase();

  if (allowedDomain && !email.toLowerCase().endsWith(`@${allowedDomain}`)) {
    throw new Error(`Please use your ${allowedDomain} email address to continue.`);
  }
};

const defaultProfileShape = (user: {
  id: string;
  email: string;
  full_name?: string;
  department?: string;
  year_of_study?: string;
}): Profile => ({
  id: user.id,
  full_name: user.full_name ?? user.email.split('@')[0],
  email: user.email,
  role: 'student',
  avatar_url: null,
  department: user.department ?? null,
  year_of_study: user.year_of_study ?? null,
  bio: 'New to Univentra and ready to explore campus life.',
  favorite_category: null,
  total_xp: 0,
  level: 1,
  rank_cache: null,
  participation_rate: 0,
  total_hours: 0,
  member_since: new Date().toISOString(),
  interests: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const authService = {
  async getSession(): Promise<AuthSessionState> {
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return { user: null, profile: null, loading: false };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return {
        user: {
          id: session.user.id,
          email: session.user.email ?? '',
        },
        profile,
        loading: false,
      };
    }

    const sessionUserId = getMockSession();

    if (!sessionUserId) {
      return { user: null, profile: null, loading: false };
    }

    const state = getMockState();
    const profile = state.profiles.find((entry) => entry.id === sessionUserId) ?? null;

    return {
      user: profile
        ? {
            id: profile.id,
            email: profile.email,
          }
        : null,
      profile,
      loading: false,
    };
  },

  async signIn(email: string, password: string) {
    ensureAllowedDomain(email);

    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return;
    }

    const state = getMockState();
    const account = state.mockUsers.find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
    );

    if (!account) {
      throw new Error('Invalid credentials. Try one of the demo accounts from the README.');
    }

    setMockSession(account.id);
  },

  async signUp(values: {
    fullName: string;
    email: string;
    password: string;
    department?: string;
    yearOfStudy?: string;
  }) {
    ensureAllowedDomain(values.email);

    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            department: values.department,
            year_of_study: values.yearOfStudy,
            role: 'student',
          },
        },
      });

      if (error) throw error;
      return;
    }

    const state = getMockState();

    if (state.mockUsers.some((entry) => entry.email.toLowerCase() === values.email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const id = crypto.randomUUID();
    const profile = defaultProfileShape({
      id,
      email: values.email,
      full_name: values.fullName,
      department: values.department,
      year_of_study: values.yearOfStudy,
    });

    const nextState = saveMockState({
      ...state,
      profiles: [
        ...state.profiles,
        {
          ...profile,
          level: calculateLevelFromXp(0),
          created_at: subMinutes(new Date(), 1).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      mockUsers: [
        ...state.mockUsers,
        {
          id,
          email: values.email,
          password: values.password,
        },
      ],
    });

    setMockSession(id);
    return nextState;
  },

  async signOut() {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return;
    }

    clearMockSession();
  },

  async sendPasswordReset(email: string) {
    ensureAllowedDomain(email);

    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/signin`,
      });

      if (error) throw error;
      return;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return data as Profile;
    }

    const state = getMockState();
    const profiles = state.profiles.map((profile) =>
      profile.id === userId
        ? {
            ...profile,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        : profile,
    );

    saveMockState({
      ...state,
      profiles,
    });

    return profiles.find((profile) => profile.id === userId)!;
  },
};
