import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabase, supabase } from '@/api/supabase';

export interface Profile {
  id: string;
  username: string | null;
  displayName: string | null;
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
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .eq('id', id)
      .maybeSingle();
    setProfile(
      data
        ? { id: data.id, username: data.username, displayName: data.display_name }
        : { id, username: null, displayName: null },
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
        username: username.trim(),
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

  const deleteAccount = useCallback(async () => {
    if (!userId) return { error: 'Not signed in.' };
    const { error } = await supabase.rpc('delete_own_account');
    if (error) return { error: msg(error, 'Could not delete the account.') };
    await supabase.auth.signOut();
    setProfile(null);
    return {};
  }, [userId]);

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
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
