import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase/client';
import type { UserProfile } from '../types/ipl';

function getSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function mapProfile(row: Record<string, unknown>, user: User): UserProfile {
  return {
    uid: user.id,
    displayName: String(row.display_name ?? user.user_metadata.display_name ?? user.email?.split('@')[0] ?? 'Manager'),
    email: user.email ?? undefined,
    role: row.role === 'admin' ? 'admin' : 'user',
    favoriteTeamId: typeof row.favorite_team_id === 'string' ? row.favorite_team_id : undefined,
    defaultSeasonId: typeof row.default_season_id === 'string' ? row.default_season_id : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function syncUserProfile(user: User): Promise<UserProfile> {
  const client = getSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (data) return mapProfile(data as Record<string, unknown>, user);

  const now = new Date().toISOString();
  const profile = {
    id: user.id,
    display_name: user.user_metadata.display_name || user.email?.split('@')[0] || 'Manager',
    email: user.email ?? null,
    role: 'user',
    created_at: now,
    updated_at: now,
  };
  const { data: created, error: createError } = await client
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select('*')
    .single();

  if (createError) throw createError;
  return mapProfile(created as Record<string, unknown>, user);
}

export async function signInWithGoogle(): Promise<UserProfile | null> {
  const client = getSupabase();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
  return null;
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign-in completed without returning a user.');
  return syncUserProfile(data.user);
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile | null> {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data.user && data.session ? syncUserProfile(data.user) : null;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login?recovery=1`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await getSupabase().auth.updateUser({ password });
  if (error) throw error;
}

export async function logoutUser(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  const client = getSupabase();
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    queueMicrotask(() => callback(session?.user ?? null));
  });
  return () => data.subscription.unsubscribe();
}

export async function updateUserProfile(
  uid: string,
  updates: Pick<UserProfile, 'displayName' | 'favoriteTeamId'>
): Promise<void> {
  const { error } = await getSupabase()
    .from('profiles')
    .update({
      display_name: updates.displayName,
      favorite_team_id: updates.favoriteTeamId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', uid);
  if (error) throw error;
}
