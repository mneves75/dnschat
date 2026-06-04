/**
 * Accessibility Context for DNSChat
 *
 * Provides accessibility configuration and utilities for screen readers,
 * focus management, motion reduction, and other accessibility features.
 */

import React, {
  createContext,
  use,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { AccessibilityInfo } from "react-native";
import { useSettings } from "./SettingsContext";
import { devWarn } from "../utils/devLog";

export interface AccessibilityConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
};

interface AccessibilityContextType {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => Promise<void>;
  announceToScreenReader: (message: string) => void;
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  getFontSizeScale: () => number;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const settings = useSettings();
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [systemReduceMotionEnabled, setSystemReduceMotionEnabled] = useState<
    boolean | null
  >(null);

  // Single source of truth: derive config directly from persisted settings
  // instead of mirroring it into local state through an effect. Mirroring
  // (setState-in-effect on a context value) is an update-loop hazard and can
  // drift from settings; a derived value keeps the provider a pure function of
  // its inputs.
  const config = settings.accessibility ?? DEFAULT_ACCESSIBILITY_CONFIG;

  // Monitor screen reader status using event listeners (not polling)
  // PERFORMANCE FIX: Previous implementation polled every 5 seconds via setInterval,
  // wasting CPU cycles and battery. Event listeners are the correct approach for
  // accessibility state changes.
  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    let mounted = true;

    // Initial check for screen reader status
    const checkScreenReader = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        if (mounted) {
          setScreenReaderEnabled(isEnabled);
        }
      } catch (error) {
        devWarn("[AccessibilityContext] Failed to check screen reader status", error);
      }
    };

    checkScreenReader();

    // Use event listener instead of polling for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (isEnabled) => {
        if (mounted) {
          setScreenReaderEnabled(isEnabled);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  // Honor the OS Reduce Motion setting, but do not expose children until the
  // first async probe completes. That avoids the 4.0.19 startup regression
  // where animated screens observed a false -> true transition immediately
  // after mount and retriggered transition effects.
  useEffect(() => {
    let mounted = true;

    const commitSystemReduceMotion = (isEnabled: boolean) => {
      if (!mounted) {
        return;
      }
      setSystemReduceMotionEnabled((previous) =>
        previous === isEnabled ? previous : isEnabled,
      );
    };

    const checkReduceMotion = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        commitSystemReduceMotion(isEnabled);
      } catch (error) {
        devWarn("[AccessibilityContext] Failed to check reduce-motion status", error);
        commitSystemReduceMotion(false);
      }
    };

    checkReduceMotion();

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      commitSystemReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const updateConfig = async (updates: Partial<AccessibilityConfig>) => {
    // Persist through settings; `config` re-derives from the updated settings,
    // so there is no separate local copy to keep in sync.
    await settings.updateAccessibility?.({ ...config, ...updates });
  };

  const announceToScreenReader = (message: string) => {
    if (screenReaderEnabled || config.screenReader) {
      // Use React Native's AccessibilityInfo for announcements
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const getFontSizeScale = (): number => {
    const scales = {
      small: 0.875,
      medium: 1.0,
      large: 1.125,
      'extra-large': 1.25,
    };
    return scales[config.fontSize] || 1.0;
  };

  const contextValue: AccessibilityContextType = {
    config,
    updateConfig,
    announceToScreenReader,
    isScreenReaderEnabled: screenReaderEnabled || config.screenReader,
    isReduceMotionEnabled:
      config.reduceMotion || systemReduceMotionEnabled === true,
    isHighContrastEnabled: config.highContrast,
    getFontSizeScale,
  };

  return (
    <AccessibilityContext value={contextValue}>
      {systemReduceMotionEnabled === null ? null : children}
    </AccessibilityContext>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = use(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

// Optional variant for components rendered outside the provider (e.g. focused
// unit tests that mount a single component). Returns defaults so consumers
// such as useMotionReduction/useHighContrast remain safe to call.
function useOptionalAccessibility(): AccessibilityContextType | undefined {
  return use(AccessibilityContext);
}

// Accessibility utility hooks
export function useScreenReader() {
  const ctx = useOptionalAccessibility();
  return {
    isEnabled: ctx?.isScreenReaderEnabled ?? false,
    announce: ctx?.announceToScreenReader ?? (() => undefined),
  };
}

export function useMotionReduction() {
  const ctx = useOptionalAccessibility();
  const shouldReduceMotion = ctx?.isReduceMotionEnabled ?? false;

  return {
    shouldReduceMotion,
    animationDuration: shouldReduceMotion ? 0 : undefined,
  };
}

export function useHighContrast() {
  const ctx = useOptionalAccessibility();

  return {
    isHighContrast: ctx?.isHighContrastEnabled ?? false,
  };
}

export function useFontSize() {
  const ctx = useOptionalAccessibility();

  return {
    scale: ctx?.getFontSizeScale ? ctx.getFontSizeScale() : 1.0,
  };
}
