import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { hasSupabase, supabase } from '@/api/supabase';

export interface Profile {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
}

interface AuthValue {
  /** Whether social features are configured at all. */
  enabled: boolean;
  /** True once the initial session has been restored from storage. */
  ready: boolean;
  session: Session | null;
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  /** Sends a 6-digit login code to the email (creates the user if new). */
  sendCode: (email: string) => Promise<{ error?: string }>;
  /** Verifies the emailed code and starts a session. */
  verifyCode: (email: string, token: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  /** Saves username + display name for the signed-in user. */
  saveProfile: (
    username: string,
    displayName: string,
  ) => Promise<{ error?: string }>;
  /** Whether a username is free (case-insensitive), ignoring the user's own. */
  usernameAvailable: (name: string) => Promise<boolean>;
  /** Picks a photo, shrinks it and saves it as the profile avatar. */
  uploadAvatar: (uri: string) => Promise<{ error?: string }>;
  /** Toggles whether the account is private (follow requests) or public. */
  setPrivate: (value: boolean) => Promise<void>;
  /** Permanently deletes the account (auth row + owned data). */
  deleteAccount: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

/** Human-readable message from a Supabase error (or a fallback). */
function msg(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!hasSupabase);
  const [profile, setProfile] = useState<Profile | null>(null);

  const userId = session?.user.id ?? null;
  const email = session?.user.email ?? null;

  const loadProfile = useCallback(async (id: string | null) => {
    if (!id) {
      setProfile(null);
      return;
    }
    type Row = {
      id: string;
      username: string | null;
      display_name: string | null;
      avatar_url?: string | null;
      is_private?: boolean;
    };
    const withAvatar = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_private')
      .eq('id', id)
      .maybeSingle();
    let row = withAvatar.data as Row | null;
    // The avatar_url column may not exist yet — fall back so the profile still
    // loads (username/icon keep working until the column is added).
    if (withAvatar.error) {
      const base = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .eq('id', id)
        .maybeSingle();
      row = base.data as Row | null;
    }
    setProfile(
      row
        ? {
            id: row.id,
            username: row.username,
            displayName: row.display_name,
            avatarUrl: row.avatar_url ?? null,
            isPrivate: row.is_private ?? true,
          }
        : {
            id,
            username: null,
            displayName: null,
            avatarUrl: null,
            isPrivate: true,
          },
    );
  }, []);

  useEffect(() => {
    if (!hasSupabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadProfile(userId);
  }, [userId, loadProfile]);

  const sendCode = useCallback(async (rawEmail: string) => {
    const address = rawEmail.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: true },
    });
    return error ? { error: msg(error, 'Could not send the code.') } : {};
  }, []);

  const verifyCode = useCallback(async (rawEmail: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: rawEmail.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    return error ? { error: msg(error, 'That code did not work.') } : {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const saveProfile = useCallback(
    async (username: string, displayName: string) => {
      if (!userId) return { error: 'Not signed in.' };
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        username: username.trim().toLowerCase(),
        display_name: displayName.trim() || null,
      });
      if (error) {
        const taken = 'code' in error && error.code === '23505';
        return {
          error: taken
            ? 'That username is already taken.'
            : msg(error, 'Could not save your profile.'),
        };
      }
      await loadProfile(userId);
      return {};
    },
    [userId, loadProfile],
  );

  const usernameAvailable = useCallback(
    async (name: string) => {
      const clean = name.trim().toLowerCase();
      if (clean.length < 3) return false;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', clean)
        .neq('id', userId ?? '00000000-0000-0000-0000-000000000000')
        .maybeSingle();
      return !data;
    },
    [userId],
  );

  const deleteAccount = useCallback(async () => {
    if (!userId) return { error: 'Not signed in.' };
    const { error } = await supabase.rpc('delete_own_account');
    if (error) return { error: msg(error, 'Could not delete the account.') };
    await supabase.auth.signOut();
    setProfile(null);
    return {};
  }, [userId]);

  // Small avatars are stored inline as a data URI on the profile row (readable
  // by friends via the existing profiles RLS) — no storage bucket needed.
  const uploadAvatar = useCallback(
    async (uri: string) => {
      if (!userId) return { error: 'Not signed in.' };
      try {
        const out = await manipulateAsync(uri, [{ resize: { width: 256 } }], {
          compress: 0.6,
          format: SaveFormat.JPEG,
          base64: true,
        });
        if (!out.base64) return { error: 'Could not read that image.' };
        const dataUri = `data:image/jpeg;base64,${out.base64}`;
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: dataUri })
          .eq('id', userId);
        if (error) return { error: msg(error, 'Could not save the photo.') };
        await loadProfile(userId);
        return {};
      } catch (e) {
        return { error: msg(e, 'Could not process the image.') };
      }
    },
    [userId, loadProfile],
  );

  const setPrivate = useCallback(
    async (val: boolean) => {
      if (!userId) return;
      await supabase.from('profiles').update({ is_private: val }).eq('id', userId);
      await loadProfile(userId);
    },
    [userId, loadProfile],
  );

  const value = useMemo<AuthValue>(
    () => ({
      enabled: hasSupabase,
      ready,
      session,
      userId,
      email,
      profile,
      sendCode,
      verifyCode,
      signOut,
      saveProfile,
      usernameAvailable,
      uploadAvatar,
      setPrivate,
      deleteAccount,
    }),
    [
      ready,
      session,
      userId,
      email,
      profile,
      sendCode,
      verifyCode,
      signOut,
      saveProfile,
      usernameAvailable,
      uploadAvatar,
      setPrivate,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
