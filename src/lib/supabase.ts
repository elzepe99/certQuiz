import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True only when both Supabase env vars are present. The comments UI checks
 * this so the app still runs locally (and degrades gracefully) without keys.
 */
export const isCommentsEnabled = Boolean(url && anonKey);

/**
 * Shared Supabase client, or null when not configured. The anon key is meant to
 * be public — data access is governed by Row Level Security, not by hiding it.
 */
export const supabase: SupabaseClient | null = isCommentsEnabled
  ? createClient(url as string, anonKey as string)
  : null;
