import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthProvider';
import { useProfile } from '@/context/ProfileProvider';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { Avatar } from './Avatar';

/**
 * Opt-in account area in Settings: passwordless email-code sign-in, a public
 * username, sign-out and account deletion. Hidden entirely when Supabase isn't
 * configured. The app stays fully usable without an account.
 */
export function AccountSection() {
  const chrome = useThemeChrome();
  const { text } = useLanguage();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { enabled, ready, session, email, profile, sendCode, verifyCode, signOut, saveProfile, usernameAvailable, uploadAvatar, setPrivate } =
    useAuth();
  const { name: localName } = useProfile();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [check, setCheck] = useState<'idle' | 'checking' | 'free' | 'taken'>(
    'idle',
  );

  // Reset the transient sign-in form whenever the auth state flips.
  useEffect(() => {
    setStep('email');
    setCode('');
    setError(null);
  }, [session]);

  useEffect(() => {
    if (!profile) return;
    if (profile.username) {
      setUsername(profile.username);
    } else if (localName) {
      // Continue the name the user already picked instead of asking twice.
      setUsername(
        localName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20),
      );
    }
  }, [profile, localName]);

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

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError(text.photoDenied);
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.[0]) return;
    setAvatarBusy(true);
    setError(null);
    const { error: err } = await uploadAvatar(res.assets[0].uri);
    setAvatarBusy(false);
    if (err) setError(err);
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
        <Text style={styles.hint}>{text.accountIntro}</Text>
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
              label={text.sendCode}
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
              {text.codeSent.replace('{email}', emailInput)}
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
              label={text.verify}
              busy={busy}
              disabled={code.trim().length < 6}
              onPress={() => run(() => verifyCode(emailInput, code))}
            />
            <Pressable onPress={() => setStep('email')} hitSlop={6}>
              <Text style={styles.linkText}>{text.changeEmail}</Text>
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
        <Text style={styles.hint}>{text.pickUsername}</Text>
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
          <Text style={styles.checkMuted}>{text.checking}</Text>
        )}
        {check === 'free' && (
          <Text style={styles.checkOk}>{text.usernameFree}</Text>
        )}
        {check === 'taken' && (
          <Text style={styles.checkBad}>{text.usernameTaken}</Text>
        )}
        <PrimaryButton
          styles={styles}
          chrome={chrome}
          label={text.save}
          busy={busy}
          disabled={username.trim().length < 3 || check !== 'free'}
          onPress={() => run(() => saveProfile(username, ''))}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable onPress={() => signOut()} hitSlop={6}>
          <Text style={styles.linkText}>{text.signOut}</Text>
        </Pressable>
      </View>
    );
  }

  // --- Signed in with a profile -------------------------------------------
  return (
    <View style={styles.section}>
      {label}
      <View style={styles.profileRow}>
        <View style={styles.avatarBtn}>
          <Avatar uri={profile?.avatarUrl} size={44} color={chrome.accent} />
          <Pressable
            style={styles.avatarEdit}
            onPress={pickAvatar}
            disabled={avatarBusy}
            hitSlop={6}
          >
            {avatarBusy ? (
              <ActivityIndicator color={chrome.onAccent} size="small" />
            ) : (
              <Ionicons name="camera" size={12} color={chrome.onAccent} />
            )}
          </Pressable>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.subtle}>{profile?.displayName || email}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Ionicons
          name={profile?.isPrivate ? 'lock-closed-outline' : 'earth-outline'}
          size={18}
          color={chrome.muted}
        />
        <View style={styles.privacyText}>
          <Text style={styles.rowText}>{text.privateAccount}</Text>
          <Text style={styles.subtle}>
            {profile?.isPrivate ? text.privateOn : text.privateOff}
          </Text>
        </View>
        <Switch
          value={!!profile?.isPrivate}
          onValueChange={(v) => setPrivate(v)}
          trackColor={{ true: chrome.accent, false: chrome.border }}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
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
      fontSize: 15,
    },
    loader: {
      alignSelf: 'flex-start',
    },
    input: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 17,
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
      fontSize: 15,
    },
    checkOk: {
      color: colors.watched,
      fontFamily: fonts.body,
      fontSize: 14,
    },
    checkBad: {
      color: colors.favorite,
      fontFamily: fonts.body,
      fontSize: 14,
    },
    checkMuted: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 14,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    avatarBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: c.accent,
    },
    avatarEdit: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileInfo: {
      flex: 1,
    },
    privacyText: {
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
      fontSize: 14,
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
