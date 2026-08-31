import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

// Regular client with service role key for admin operations
export const supabase: SupabaseClient = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': config.supabaseSecretKey
    }
  }
});
