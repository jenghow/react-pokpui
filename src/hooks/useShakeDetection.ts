import { useEffect, useRef } from 'react';

const SHAKE_THRESHOLD = 12;
const MIN_SHAKES = 2;
const SHAKE_WINDOW = 600;

export async function requestMotionPermission(): Promise<boolean> {
  if (typeof DeviceMotionEvent !== 'undefined' && 'requestPermission' in DeviceMotionEvent) {
    try {
      const result = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

export function useShakeDetection(onShake: () => void, enabled: boolean) {
  const onShakeRef = useRef(onShake);

  useEffect(() => {
    onShakeRef.current = onShake;
  });

  useEffect(() => {
    if (!enabled) return;

    let shakeCount = 0;
    let lastShakeTime = 0;

    const handler = (e: DeviceMotionEvent) => {
      let y: number | null = null;
      if (e.acceleration?.y != null) {
        y = e.acceleration.y;
      } else if (e.accelerationIncludingGravity?.y != null) {
        y = e.accelerationIncludingGravity.y - 9.8;
      }
      if (y == null) return;

      if (Math.abs(y) > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime > SHAKE_WINDOW) {
          shakeCount = 0;
        }
        lastShakeTime = now;
        shakeCount++;
        if (shakeCount >= MIN_SHAKES) {
          shakeCount = 0;
          onShakeRef.current();
        }
      }
    };

    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [enabled]);
}
