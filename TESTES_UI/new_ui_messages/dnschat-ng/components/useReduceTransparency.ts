import { useEffect, useState } from 'react';

import { AccessibilityInfo, Platform } from 'react-native';

const EVENT = 'reduceTransparencyChanged';

/**
 * Hook returns whether Reduce Transparency accessibility option is active.
 * iOS exposes a dedicated API; other platforms default to false.
 */
export function useReduceTransparency(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === 'ios' && AccessibilityInfo.isReduceTransparencyEnabled) {
      AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
        if (mounted) setEnabled(value);
      });

      const listener = AccessibilityInfo.addEventListener?.(EVENT, (value: boolean) => {
        if (mounted) setEnabled(value);
      });

      return () => {
        mounted = false;
        listener?.remove?.();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  return enabled;
}
