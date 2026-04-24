import { createClient } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabaseEnv } from './env';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseEnv.supabaseUrl!, supabaseEnv.supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
