import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { authService } from '@/services/auth-service';
import type { AuthSessionState, Profile } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

interface AuthContextValue extends AuthSessionState {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  role: Profile['role'] | null;
  refreshSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (values: {
    fullName: string;
    email: string;
    password: string;
    department?: string;
    yearOfStudy?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | undefined>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthSessionState>({
    user: null,
    profile: null,
    loading: true,
  });

  const refreshSession = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));
    const next = await authService.getSession();
    setState(next);
  }, []);

  useEffect(() => {
    refreshSession();

    if (!supabase) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshSession();
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await authService.signIn(email, password);
      await refreshSession();
    },
    [refreshSession],
  );

  const signUp = useCallback(
    async (values: {
      fullName: string;
      email: string;
      password: string;
      department?: string;
      yearOfStudy?: string;
    }) => {
      await authService.signUp(values);
      await refreshSession();
    },
    [refreshSession],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    queryClient.clear();
    setState({
      user: null,
      profile: null,
      loading: false,
    });
  }, [queryClient]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!state.user) return undefined;
      const profile = await authService.updateProfile(state.user.id, updates);
      setState((current) => ({
        ...current,
        profile,
      }));
      await queryClient.invalidateQueries();
      return profile;
    },
    [queryClient, state.user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      role: state.profile?.role ?? null,
      isAuthenticated: Boolean(state.user),
      isDemoMode: !isSupabaseConfigured,
      refreshSession,
      signIn,
      signUp,
      signOut,
      sendPasswordReset: authService.sendPasswordReset,
      updateProfile,
    }),
    [refreshSession, signIn, signOut, signUp, state, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider.');
  }
  return context;
};
