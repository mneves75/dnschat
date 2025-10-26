import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { useSettings } from "../context/SettingsContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { configureHaptics, preloadHaptics } from "../utils/haptics";

/**
 * Keeps native haptics wiring aligned with settings + accessibility state.
 */
export function HapticsConfigurator() {
  const { enableHaptics, loading: settingsLoading } = useSettings();
  const { config } = useAccessibility();
  const hasPreloadedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "ios" || settingsLoading) {
      return;
    }

    configureHaptics({
      userEnabled: enableHaptics,
      reduceMotion: Boolean(config.reduceMotion),
    });

    if (!hasPreloadedRef.current) {
      hasPreloadedRef.current = true;
      preloadHaptics().catch((error) => {
        if (__DEV__) {
          console.warn("Haptics preload failed:", error);
        }
      });
    }
  }, [enableHaptics, config.reduceMotion, settingsLoading]);

  return null;
}

