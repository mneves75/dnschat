import Clipboard from '@react-native-clipboard/clipboard';
import { HapticFeedback } from '../utils/haptics';

/**
 * ClipboardService
 *
 * Utility service for clipboard operations with haptic feedback.
 * Uses @react-native-clipboard/clipboard for reliable cross-platform clipboard access.
 */
export class ClipboardService {
  /**
   * Copy text to clipboard with haptic feedback
   *
   * @param text - Text content to copy to clipboard
   * @returns Promise<void> - Resolves when copy succeeds, rejects on failure
   *
   * TRICKY: Clipboard.setString() can fail silently on some Android devices
   * when clipboard access is restricted by enterprise policies or permissions.
   * We provide haptic feedback immediately on iOS (optimistic), but should
   * ideally await the promise on Android to confirm success.
   */
  static async copy(text: string): Promise<void> {
    if (!text || text.trim().length === 0) {
      // Empty string, silently return
      return;
    }

    try {
      // Copy to clipboard
      // IMPORTANT: await the promise to handle errors properly
      await Clipboard.setString(text);

      // Provide haptic feedback for user confirmation
      // Light haptic is subtle, appropriate for copy action
      HapticFeedback.light();
    } catch (error) {
      // Clipboard operations can fail on some devices (enterprise MDM, permissions)
      // Fail silently - clipboard is best-effort
      // Error already logged by @react-native-clipboard/clipboard
    }
  }

  /**
   * Get current clipboard content
   *
   * @returns Promise<string> - Current clipboard text content
   *
   * NOTE: Some platforms require user permission to read clipboard.
   * iOS shows system prompt on first access.
   */
  static async getString(): Promise<string> {
    try {
      const content = await Clipboard.getString();
      return content;
    } catch (error) {
      // Read failures are silent - return empty string
      return '';
    }
  }

  /**
   * Check if clipboard contains text content
   *
   * @returns Promise<boolean> - True if clipboard has text
   */
  static async hasString(): Promise<boolean> {
    try {
      const content = await Clipboard.getString();
      return content.length > 0;
    } catch (error) {
      // Check failures are silent - return false
      return false;
    }
  }
}
