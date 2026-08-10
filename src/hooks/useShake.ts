import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

// Magnitude (in g) that counts as a shake; ~1g is rest.
const SHAKE_G = 2.2;
// Ignore repeat shakes within this window.
const COOLDOWN_MS = 1200;

/** Calls onShake when the device is shaken. Only listens while `enabled`. */
export function useShake(onShake: () => void, enabled = true) {
  const cb = useRef(onShake);
  cb.current = onShake;
  const last = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    Accelerometer.setUpdateInterval(80);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > SHAKE_G && now - last.current > COOLDOWN_MS) {
        last.current = now;
        cb.current();
      }
    });
    return () => sub.remove();
  }, [enabled]);
}
