const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseEnv = {
  supabaseUrl,
  supabaseAnonKey,
  allowedEmailDomain: import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN,
};
