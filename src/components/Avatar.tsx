import { useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useThemeChrome } from '@/context/ThemeProvider';

/** Circular avatar (photo or fallback icon); tap a photo to view it fullscreen. */
export function Avatar({
  uri,
  size,
  color,
  noZoom,
}: {
  uri?: string | null;
  size: number;
  color?: string;
  /** When true, tapping does nothing (lets a parent handle the press). */
  noZoom?: boolean;
}) {
  const chrome = useThemeChrome();
  const [zoom, setZoom] = useState(false);
  const tint = color ?? chrome.accent;

  return (
    <>
      <Pressable
        onPress={() => uri && setZoom(true)}
        disabled={noZoom || !uri}
        pointerEvents={noZoom ? 'none' : 'auto'}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1,
              borderColor: tint,
            }}
          />
        ) : (
          <Ionicons name="person-circle" size={size} color={tint} />
        )}
      </Pressable>
      <Modal
        visible={zoom}
        transparent
        animationType="fade"
        onRequestClose={() => setZoom(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setZoom(false)}>
          {uri && <Image source={{ uri }} style={styles.big} contentFit="contain" />}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 4, 2, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  big: {
    width: '88%',
    height: '68%',
    borderRadius: 16,
  },
});
