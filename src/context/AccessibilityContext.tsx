/**
 * Accessibility Context for DNSChat
 *
 * Provides accessibility configuration and utilities for screen readers,
 * focus management, motion reduction, and other accessibility features.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { useSettings } from "./SettingsContext";
import { devWarn } from "../utils/devLog";

export interface AccessibilityConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

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
  const [config, setConfig] = useState<AccessibilityConfig>(
    settings.accessibility || {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
    }
  );

  // Monitor screen reader status using event listeners (not polling)
  // PERFORMANCE FIX: Previous implementation polled every 5 seconds via setInterval,
  // wasting CPU cycles and battery. Event listeners are the correct approach for
  // accessibility state changes.
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

  // Update config when settings change
  useEffect(() => {
    if (settings.accessibility) {
      setConfig(settings.accessibility);
    }
  }, [settings.accessibility]);

  const updateConfig = async (updates: Partial<AccessibilityConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);

    // Update settings context
    if (settings.updateAccessibility) {
      await settings.updateAccessibility(newConfig);
    }
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
    isReduceMotionEnabled: config.reduceMotion,
    isHighContrastEnabled: config.highContrast,
    getFontSizeScale,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

// Accessibility utility hooks
export function useScreenReader() {
  const { isScreenReaderEnabled, announceToScreenReader } = useAccessibility();

  return {
    isEnabled: isScreenReaderEnabled,
    announce: announceToScreenReader,
  };
}

export function useMotionReduction() {
  const { isReduceMotionEnabled } = useAccessibility();

  return {
    shouldReduceMotion: isReduceMotionEnabled,
    animationDuration: isReduceMotionEnabled ? 0 : undefined,
  };
}

export function useHighContrast() {
  const { isHighContrastEnabled } = useAccessibility();

  return {
    isHighContrast: isHighContrastEnabled,
  };
}

export function useFontSize() {
  const { getFontSizeScale } = useAccessibility();

  return {
    scale: getFontSizeScale(),
  };
}
