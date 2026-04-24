import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

export const useRealtimeNotifications = (userId?: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase || !userId) return undefined;
    const client = supabase;

    const channel = client
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
          void queryClient.invalidateQueries({ queryKey: ['dashboard', userId] });
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [queryClient, userId]);
};
