import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthProvider';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { FriendsSheet } from './FriendsSheet';

/**
 * Opt-in account area in Settings: passwordless email-code sign-in, a public
 * username, sign-out and account deletion. Hidden entirely when Supabase isn't
 * configured. The app stays fully usable without an account.
 */
export function AccountSection() {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { enabled, ready, session, email, profile, sendCode, verifyCode, signOut, saveProfile, usernameAvailable } =
    useAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [check, setCheck] = useState<'idle' | 'checking' | 'free' | 'taken'>(
    'idle',
  );
  const [friendsOpen, setFriendsOpen] = useState(false);

  // Reset the transient sign-in form whenever the auth state flips.
  useEffect(() => {
    setStep('email');
    setCode('');
    setError(null);
  }, [session]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '');
    }
  }, [profile]);

  // Debounced live username availability check during profile setup.
  useEffect(() => {
    const name = username.trim();
    if (name.length < 3) {
      setCheck('idle');
      return;
    }
    setCheck('checking');
    let alive = true;
    const t = setTimeout(async () => {
      const ok = await usernameAvailable(name);
      if (alive) setCheck(ok ? 'free' : 'taken');
    }, 400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [username, usernameAvailable]);

  if (!enabled) return null;

  const run = async (fn: () => Promise<{ error?: string }>) => {
    setBusy(true);
    setError(null);
    const { error: err } = await fn();
    setBusy(false);
    if (err) setError(err);
    return !err;
  };

  const label = <Text style={styles.label}>Account</Text>;

  if (!ready) {
    return (
      <View style={styles.section}>
        {label}
        <ActivityIndicator color={chrome.accent} style={styles.loader} />
      </View>
    );
  }

  // --- Signed out: email -> code ------------------------------------------
  if (!session) {
    return (
      <View style={styles.section}>
        {label}
        <Text style={styles.hint}>
          Optional — sign in to share lists and follow friends. Everything works
          without an account too.
        </Text>
        {step === 'email' ? (
          <>
            <TextInput
              style={styles.input}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="you@email.com"
              placeholderTextColor={chrome.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <PrimaryButton
              styles={styles}
              chrome={chrome}
              label="Send code"
              busy={busy}
              disabled={!emailInput.includes('@')}
              onPress={async () => {
                const ok = await run(() => sendCode(emailInput));
                if (ok) setStep('code');
              }}
            />
          </>
        ) : (
          <>
            <Text style={styles.hint}>
              We sent a 6-digit code to {emailInput}.
            </Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="12345678"
              placeholderTextColor={chrome.muted}
              keyboardType="number-pad"
              maxLength={8}
            />
            <PrimaryButton
              styles={styles}
              chrome={chrome}
              label="Verify"
              busy={busy}
              disabled={code.trim().length < 6}
              onPress={() => run(() => verifyCode(emailInput, code))}
            />
            <Pressable onPress={() => setStep('email')} hitSlop={6}>
              <Text style={styles.linkText}>Change email</Text>
            </Pressable>
          </>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  // --- Signed in, no username yet: profile setup --------------------------
  if (profile && !profile.username) {
    return (
      <View style={styles.section}>
        {label}
        <Text style={styles.hint}>Pick a username so friends can find you.</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(t) =>
            setUsername(t.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())
          }
          placeholder="username"
          placeholderTextColor={chrome.muted}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
        />
        {check === 'checking' && (
          <Text style={styles.checkMuted}>Checking…</Text>
        )}
        {check === 'free' && <Text style={styles.checkOk}>✓ Available</Text>}
        {check === 'taken' && (
          <Text style={styles.checkBad}>✗ Already taken</Text>
        )}
        <PrimaryButton
          styles={styles}
          chrome={chrome}
          label="Save"
          busy={busy}
          disabled={username.trim().length < 3 || check !== 'free'}
          onPress={() => run(() => saveProfile(username, ''))}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable onPress={() => signOut()} hitSlop={6}>
          <Text style={styles.linkText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  // --- Signed in with a profile -------------------------------------------
  return (
    <View style={styles.section}>
      {label}
      <View style={styles.profileRow}>
        <Ionicons name="person-circle" size={34} color={chrome.accent} />
        <View style={styles.profileInfo}>
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.subtle}>{profile?.displayName || email}</Text>
        </View>
      </View>
      <Pressable style={styles.row} onPress={() => setFriendsOpen(true)}>
        <Ionicons name="people-outline" size={18} color={chrome.accent} />
        <Text style={[styles.rowText, { color: chrome.accent }]}>Friends</Text>
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
      <FriendsSheet
        visible={friendsOpen}
        onClose={() => setFriendsOpen(false)}
      />
    </View>
  );
}

function PrimaryButton({
  styles,
  chrome,
  label,
  onPress,
  busy,
  disabled,
}: {
  styles: ReturnType<typeof makeStyles>;
  chrome: ThemeChrome;
  label: string;
  onPress: () => void;
  busy: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.primaryBtn, (disabled || busy) && styles.primaryBtnOff]}
      onPress={onPress}
      disabled={disabled || busy}
    >
      {busy ? (
        <ActivityIndicator color={chrome.onAccent} size="small" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    section: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    label: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    hint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 13,
    },
    loader: {
      alignSelf: 'flex-start',
    },
    input: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 15,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
    },
    primaryBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: c.accent,
      minHeight: 40,
    },
    primaryBtnOff: {
      opacity: 0.5,
    },
    primaryBtnText: {
      color: c.onAccent,
      fontFamily: fonts.label,
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    linkText: {
      color: c.accent,
      fontFamily: fonts.label,
      fontSize: 13,
      marginTop: 2,
    },
    error: {
      color: colors.favorite,
      fontFamily: fonts.body,
      fontSize: 13,
    },
    checkOk: {
      color: colors.watched,
      fontFamily: fonts.body,
      fontSize: 12,
    },
    checkBad: {
      color: colors.favorite,
      fontFamily: fonts.body,
      fontSize: 12,
    },
    checkMuted: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 12,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    profileInfo: {
      flex: 1,
    },
    username: {
      color: c.accent,
      fontFamily: fonts.label,
      fontSize: 16,
    },
    subtle: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    rowText: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 14,
    },
  });
