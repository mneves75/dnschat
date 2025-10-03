/**
 * DNSChat Design System - Animation Tokens
 *
 * Animation timing, easing curves, and motion constants following
 * iOS Human Interface Guidelines and Material Design motion principles.
 *
 * @version 2.0.1
 * @author DNSChat Mobile Platform Team
 */

// ============================================================================
// DURATION (Timing in milliseconds)
// ============================================================================

export const DURATION = {
  /**
   * Micro-interactions (instant feedback)
   */
  instant: 0,
  fast: 100,       // Button press, toggle
  quick: 200,      // Tooltip, dropdown

  /**
   * Standard transitions
   */
  short: 300,      // iOS standard, card slide
  medium: 400,     // Modal present, sheet expand
  long: 500,       // Page transition, complex animation

  /**
   * Extended animations
   */
  extended: 800,   // Onboarding entrance, hero
  slow: 1000,      // Loading states, skeleton screens
  verySlow: 1500,  // Complex multi-stage animations

  /**
   * Component-specific durations
   */
  toast: 3000,     // Toast/snackbar display time
  tooltip: 2000,   // Tooltip auto-dismiss
  splash: 2500,    // Splash screen minimum display
} as const;

// ============================================================================
// EASING CURVES
// ============================================================================

export const EASING = {
  /**
   * iOS-style easing curves
   */
  ios: {
    // Standard iOS curve (similar to ease-in-out)
    standard: [0.4, 0.0, 0.2, 1.0] as const,

    // Accelerate (entrance)
    accelerate: [0.4, 0.0, 1.0, 1.0] as const,

    // Decelerate (exit)
    decelerate: [0.0, 0.0, 0.2, 1.0] as const,

    // Sharp (quick movements)
    sharp: [0.4, 0.0, 0.6, 1.0] as const,
  },

  /**
   * Material Design easing curves
   */
  material: {
    // Standard Material curve
    standard: [0.4, 0.0, 0.2, 1.0] as const,

    // Emphasized (prominent transitions)
    emphasized: [0.0, 0.0, 0.2, 1.0] as const,

    // Accelerate
    accelerate: [0.4, 0.0, 1.0, 1.0] as const,

    // Decelerate
    decelerate: [0.0, 0.0, 0.2, 1.0] as const,
  },

  /**
   * React Native Animated easing
   * Use with: Animated.timing(value, { easing: Easing.bezier(...) })
   */
  rn: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  /**
   * Spring animation configs (iOS-style bounce)
   */
  spring: {
    // Gentle bounce (subtle feedback)
    gentle: {
      tension: 100,
      friction: 10,
    },

    // Medium bounce (standard interactions)
    medium: {
      tension: 150,
      friction: 12,
    },

    // Bouncy (playful feedback)
    bouncy: {
      tension: 200,
      friction: 10,
    },

    // Wobbly (attention-grabbing)
    wobbly: {
      tension: 180,
      friction: 8,
    },
  },
} as const;

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const ANIMATION_PRESETS = {
  /**
   * Fade animations
   */
  fade: {
    in: {
      duration: DURATION.short,
      easing: EASING.ios.decelerate,
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    out: {
      duration: DURATION.quick,
      easing: EASING.ios.accelerate,
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
  },

  /**
   * Slide animations (for modals, sheets)
   */
  slide: {
    up: {
      duration: DURATION.medium,
      easing: EASING.ios.decelerate,
      from: { translateY: 100 },
      to: { translateY: 0 },
    },
    down: {
      duration: DURATION.short,
      easing: EASING.ios.accelerate,
      from: { translateY: 0 },
      to: { translateY: 100 },
    },
    left: {
      duration: DURATION.short,
      easing: EASING.ios.standard,
      from: { translateX: -100 },
      to: { translateX: 0 },
    },
    right: {
      duration: DURATION.short,
      easing: EASING.ios.standard,
      from: { translateX: 100 },
      to: { translateX: 0 },
    },
  },

  /**
   * Scale animations (for press states, pop-ups)
   */
  scale: {
    in: {
      duration: DURATION.quick,
      easing: EASING.spring.gentle,
      from: { scale: 0.8 },
      to: { scale: 1.0 },
    },
    out: {
      duration: DURATION.fast,
      easing: EASING.ios.accelerate,
      from: { scale: 1.0 },
      to: { scale: 0.8 },
    },
    press: {
      duration: DURATION.fast,
      easing: EASING.ios.sharp,
      from: { scale: 1.0 },
      to: { scale: 0.96 }, // Material Design standard
    },
  },

  /**
   * Combined animations (fade + slide for elegance)
   */
  fadeSlideUp: {
    duration: DURATION.medium,
    easing: EASING.ios.decelerate,
    from: { opacity: 0, translateY: 50 },
    to: { opacity: 1, translateY: 0 },
  },

  fadeSlideDown: {
    duration: DURATION.short,
    easing: EASING.ios.accelerate,
    from: { opacity: 1, translateY: 0 },
    to: { opacity: 0, translateY: 50 },
  },

  /**
   * Loading animations (for skeleton screens, spinners)
   */
  loading: {
    pulse: {
      duration: DURATION.slow,
      easing: EASING.rn.easeInOut,
      loop: true,
      from: { opacity: 0.3 },
      to: { opacity: 1.0 },
    },
    spinner: {
      duration: DURATION.slow,
      easing: EASING.rn.linear,
      loop: true,
      from: { rotate: '0deg' },
      to: { rotate: '360deg' },
    },
    shimmer: {
      duration: DURATION.extended,
      easing: EASING.rn.linear,
      loop: true,
      from: { translateX: -100 },
      to: { translateX: 100 },
    },
  },
} as const;

// ============================================================================
// TRANSITION CONFIGS (React Navigation)
// ============================================================================

export const TRANSITIONS = {
  /**
   * iOS-style slide transition (default)
   */
  ios: {
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: {
        animation: 'spring',
        config: EASING.spring.gentle,
      },
      close: {
        animation: 'spring',
        config: EASING.spring.gentle,
      },
    },
  },

  /**
   * Material-style slide transition
   */
  android: {
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: DURATION.short,
          easing: EASING.material.emphasized,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: DURATION.quick,
          easing: EASING.material.accelerate,
        },
      },
    },
  },

  /**
   * Modal presentation (bottom sheet style)
   */
  modal: {
    gestureEnabled: true,
    gestureDirection: 'vertical',
    transitionSpec: {
      open: {
        animation: 'spring',
        config: EASING.spring.medium,
      },
      close: {
        animation: 'timing',
        config: {
          duration: DURATION.short,
          easing: EASING.ios.accelerate,
        },
      },
    },
  },

  /**
   * Fade transition (for overlays, alerts)
   */
  fade: {
    gestureEnabled: false,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: DURATION.quick,
          easing: EASING.ios.decelerate,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: DURATION.fast,
          easing: EASING.ios.accelerate,
        },
      },
    },
  },
} as const;

// ============================================================================
// HAPTIC FEEDBACK (iOS)
// ============================================================================

export const HAPTICS = {
  /**
   * Impact feedback (physical button press feeling)
   */
  impact: {
    light: 'light',     // Subtle tap
    medium: 'medium',   // Standard button
    heavy: 'heavy',     // Prominent action
  },

  /**
   * Notification feedback (success, warning, error)
   */
  notification: {
    success: 'success',
    warning: 'warning',
    error: 'error',
  },

  /**
   * Selection feedback (picker, toggle)
   */
  selection: 'selection',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get animation config for React Native Animated
 * @param preset - Animation preset name
 * @returns Animated timing config
 */
export function getAnimationConfig(preset: keyof typeof ANIMATION_PRESETS) {
  return ANIMATION_PRESETS[preset];
}

/**
 * Get transition config for React Navigation
 * @param platform - Platform ('ios' | 'android')
 * @returns Navigation transition config
 */
export function getTransitionConfig(platform: 'ios' | 'android' | 'modal' | 'fade') {
  return TRANSITIONS[platform];
}

/**
 * Trigger haptic feedback (iOS only)
 * @param type - Haptic type
 * @param intensity - Intensity level (optional)
 */
export function triggerHaptic(
  type: 'impact' | 'notification' | 'selection',
  intensity?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
) {
  if (typeof window === 'undefined') return; // Server-side check

  // Implementation would use react-native-haptic-feedback or Expo Haptics
  console.log(`🔸 Haptic: ${type} ${intensity || ''}`);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ANIMATIONS = {
  duration: DURATION,
  easing: EASING,
  presets: ANIMATION_PRESETS,
  transitions: TRANSITIONS,
  haptics: HAPTICS,

  // Helper functions
  getAnimationConfig,
  getTransitionConfig,
  triggerHaptic,
} as const;

export default ANIMATIONS;
