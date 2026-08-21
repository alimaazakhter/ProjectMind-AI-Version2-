import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseClient: SupabaseClient | null = null;

export const isSupabaseConfigured = Boolean(
  env.SUPABASE_URL &&
  env.SUPABASE_URL.startsWith('http') &&
  env.SUPABASE_SERVICE_ROLE_KEY &&
  env.SUPABASE_SERVICE_ROLE_KEY !== 'your-supabase-service-role-key'
);

if (isSupabaseConfigured) {
  supabaseClient = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('⚡ Supabase PostgreSQL client connected successfully.');
} else {
  console.log('ℹ️ Supabase credentials not set or using placeholder. Running in-memory database storage for local testing.');
}

export const supabase = supabaseClient;
