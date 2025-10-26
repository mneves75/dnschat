import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type HapticConfiguration = {
  userEnabled?: boolean;
  reduceMotion?: boolean;
};

let userEnabled = true;
let reduceMotionEnabled = false;
let hardwareSupported: boolean | null = null;
let availabilityPromise: Promise<boolean> | null = null;

// CoreHaptics attempts to load /Library/Audio/.../hapticpatternlibrary.plist even on hardware
// without a Taptic Engine (simulators, iPads, older devices) which triggers the crash we saw.
// We proactively gate every call on this availability probe so we never touch CoreHaptics unless
// the platform actually provides the system pattern library.
const resolveAvailabilityCheck = (): Promise<boolean> => {
  const availabilityFn = (Haptics as typeof Haptics & {
    isAvailableAsync?: () => Promise<boolean>;
  }).isAvailableAsync;
  if (typeof availabilityFn === "function") {
    return availabilityFn();
  }
  // expo-haptics typings miss isAvailableAsync; fallback to iOS assumption.
  return Promise.resolve(Platform.OS === "ios");
};

const ensureHardwareSupport = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    hardwareSupported = false;
    return false;
  }
  if (hardwareSupported !== null) {
    return hardwareSupported;
  }
  if (!availabilityPromise) {
    availabilityPromise = resolveAvailabilityCheck()
      .then((available: boolean) => {
        hardwareSupported = available;
        return available;
      })
      .catch((error: unknown) => {
        hardwareSupported = false;
        if (__DEV__) {
          console.warn('Haptics availability check failed:', error);
        }
        return false;
      })
      .finally(() => {
        availabilityPromise = null;
      });
  }
  return availabilityPromise!;
};

const shouldPlay = async (): Promise<boolean> => {
  if (!userEnabled || reduceMotionEnabled) {
    return false;
  }
  return ensureHardwareSupport();
};

const runWithGuard = async (
  action: () => Promise<void>,
  label: string,
): Promise<void> => {
  if (!(await shouldPlay())) {
    return;
  }
  try {
    await action();
  } catch (error) {
    if (__DEV__) {
      console.warn(`Haptics ${label} feedback failed:`, error);
    }
  }
};

const runImpact = (
  style: Haptics.ImpactFeedbackStyle,
  label: string,
): Promise<void> => runWithGuard(() => Haptics.impactAsync(style), label);

const runNotification = (
  type: Haptics.NotificationFeedbackType,
  label: string,
): Promise<void> =>
  runWithGuard(() => Haptics.notificationAsync(type), label);

const runSelection = (): Promise<void> =>
  runWithGuard(() => Haptics.selectionAsync(), 'selection');

export const configureHaptics = (config: HapticConfiguration = {}) => {
  if (typeof config.userEnabled === 'boolean') {
    userEnabled = config.userEnabled;
  }
  if (typeof config.reduceMotion === 'boolean') {
    reduceMotionEnabled = config.reduceMotion;
  }
};

export const preloadHaptics = async () => {
  await ensureHardwareSupport();
};

/**
 * Haptic Feedback System for iOS 26 Liquid Glass
 *
 * Provides consistent haptic feedback across the app following
 * iOS Human Interface Guidelines and Material Design principles.
 *
 * Usage Guidelines:
 * - Light: Button taps, switch toggles, selections
 * - Medium: Confirmations, swipe actions, transitions
 * - Heavy: Errors, destructive actions, important alerts
 * - Success: Task completion, successful operations
 * - Warning: Caution messages, potential issues
 * - Error: Failed operations, validation errors
 */

export class HapticFeedback {
  /**
   * Light impact feedback
   * Use for: Button taps, switch toggles, radio/checkbox selections
   *
   * @example
   * ```typescript
   * <TouchableOpacity onPress={() => {
   *   HapticFeedback.light();
   *   // ... handle press
   * }}>
   * ```
   */
  static light = () =>
    runImpact(Haptics.ImpactFeedbackStyle.Light, 'light');

  /**
   * Medium impact feedback
   * Use for: Confirmations, swipe actions, important selections, pull-to-refresh
   *
   * @example
   * ```typescript
   * const handleSend = () => {
   *   HapticFeedback.medium();
   *   sendMessage();
   * };
   * ```
   */
  static medium = () =>
    runImpact(Haptics.ImpactFeedbackStyle.Medium, 'medium');

  /**
   * Heavy impact feedback
   * Use for: Errors, destructive actions, critical alerts, important completions
   *
   * @example
   * ```typescript
   * const handleDelete = () => {
   *   HapticFeedback.heavy();
   *   deleteItem();
   * };
   * ```
   */
  static heavy = () =>
    runImpact(Haptics.ImpactFeedbackStyle.Heavy, 'heavy');

  /**
   * Success notification feedback
   * Use for: Task completion, successful operations, confirmations
   *
   * @example
   * ```typescript
   * const handleSave = async () => {
   *   await saveSettings();
   *   HapticFeedback.success();
   *   showToast('Saved successfully');
   * };
   * ```
   */
  static success = () =>
    runNotification(Haptics.NotificationFeedbackType.Success, 'success');

  /**
   * Warning notification feedback
   * Use for: Caution messages, potential issues, non-critical alerts
   *
   * @example
   * ```typescript
   * if (batteryLow) {
   *   HapticFeedback.warning();
   *   showToast('Battery low');
   * }
   * ```
   */
  static warning = () =>
    runNotification(Haptics.NotificationFeedbackType.Warning, 'warning');

  /**
   * Error notification feedback
   * Use for: Failed operations, validation errors, critical failures
   *
   * @example
   * ```typescript
   * try {
   *   await sendMessage();
   * } catch (error) {
   *   HapticFeedback.error();
   *   showError('Failed to send');
   * }
   * ```
   */
  static error = () =>
    runNotification(Haptics.NotificationFeedbackType.Error, 'error');

  /**
   * Selection changed feedback
   * Use for: Scrolling through picker values, adjusting sliders
   *
   * @example
   * ```typescript
   * const handleSliderChange = (value: number) => {
   *   HapticFeedback.selection();
   *   updateValue(value);
   * };
   * ```
   */
  static selection = () => runSelection();

  /**
   * Rigid impact (iOS 13+)
   * Sharp, precise feedback for mechanical interactions
   *
   * Use sparingly for special interactions that need
   * a distinct, rigid feel (e.g., locking mechanisms)
   */
  static rigid = () =>
    runImpact(Haptics.ImpactFeedbackStyle.Rigid, 'rigid');

  /**
   * Soft impact (iOS 13+)
   * Gentle, soft feedback for subtle interactions
   *
   * Use for very subtle feedback needs where light
   * might be too strong
   */
  static soft = () => runImpact(Haptics.ImpactFeedbackStyle.Soft, 'soft');
}

/**
 * Convenience functions for common haptic patterns
 */

/**
 * Button press haptic
 * Standard feedback for button interactions
 */
export const buttonPress = () => HapticFeedback.light();

/**
 * Toggle switch haptic
 * Feedback for switch/toggle state changes
 */
export const toggleSwitch = () => HapticFeedback.light();

/**
 * Swipe action haptic
 * Feedback for swipe-to-delete or swipe-to-action
 */
export const swipeAction = () => HapticFeedback.medium();

/**
 * Delete action haptic
 * Strong feedback for destructive actions
 */
export const deleteAction = () => HapticFeedback.heavy();

/**
 * Save success haptic
 * Feedback for successful save operations
 */
export const saveSuccess = () => HapticFeedback.success();

/**
 * Send message haptic
 * Feedback for sending messages or submitting forms
 */
export const sendMessage = () => HapticFeedback.medium();

/**
 * Pull to refresh haptic
 * Feedback when pull-to-refresh triggers
 */
export const pullToRefresh = () => HapticFeedback.light();

/**
 * Navigation haptic
 * Subtle feedback for navigation transitions
 */
export const navigation = () => HapticFeedback.soft();

/**
 * Long press haptic
 * Feedback when long press gesture is recognized
 */
export const longPress = () => HapticFeedback.medium();

/**
 * Error shake haptic pattern
 * Multiple impacts to simulate shake feedback
 */
export const errorShake = async () => {
  await HapticFeedback.error();
  // Add additional impacts for shake feel
  setTimeout(() => HapticFeedback.light(), 100);
  setTimeout(() => HapticFeedback.light(), 200);
};

export interface HapticsPreferencePersistenceOptions {
  loading: boolean;
  setSaving?: (saving: boolean) => void;
  setTempValue?: (value: boolean) => void;
  updateEnableHaptics: (value: boolean) => Promise<void>;
  logLabel?: string;
}

export const persistHapticsPreference = async (
  value: boolean,
  {
    loading,
    setSaving,
    setTempValue,
    updateEnableHaptics,
    logLabel = "Enable haptics saved",
  }: HapticsPreferencePersistenceOptions,
) => {
  if (loading) {
    return;
  }
  try {
    setTempValue?.(value);
    setSaving?.(true);
    await updateEnableHaptics(value);
    toggleSwitch();
    if (__DEV__) {
      console.log(`✅ ${logLabel}:`, value);
    }
  } catch (error) {
    if (__DEV__) {
      console.log("❌ Failed to save haptics preference:", error);
    }
  } finally {
    setSaving?.(false);
  }
};

export default HapticFeedback;
export type { HapticConfiguration };

// Test-only helpers so unit specs can observe internal state safely.
export const __hapticsTestHooks = {
  getState: () => ({
    userEnabled,
    reduceMotionEnabled,
    hardwareSupported,
  }),
  shouldPlayCheck: () => shouldPlay(),
};
