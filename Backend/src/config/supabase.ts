import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

export const supabase: SupabaseClient = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
