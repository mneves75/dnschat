import { Alert, Share } from 'react-native';
import { HapticFeedback } from '../utils/haptics';
import { createTranslator } from '../i18n';
import type { SupportedLocale } from '../i18n/translations';

/**
 * ShareService
 *
 * Utility service for sharing message content via native share sheets.
 * Uses React Native's Share API for iOS UIActivityViewController and Android Intent.ACTION_SEND.
 */
export class ShareService {
  /**
   * Share message text via native share sheet
   *
   * @param content - Message text content to share
   * @param timestamp - Message timestamp (optional, for context in share)
   * @returns Promise<void> - Resolves when share completes or is dismissed
   *
   * IMPORTANT: React Native's Share API behavior differs by platform:
   * - iOS: Resolves with { action: 'sharedAction' | 'dismissedAction' }
   * - Android: Always resolves with { action: 'sharedAction' } (even when dismissed)
   * - Both throw errors only for actual failures (invalid content, no share providers)
   *
   * TRICKY: User dismissal does NOT throw an error on iOS (it just resolves with dismissedAction).
   * We only catch actual errors (e.g., no share providers available, invalid content).
   */
  static async shareMessage(
    content: string,
    timestamp?: Date,
    locale: SupportedLocale = "en-US",
  ): Promise<void> {
    if (!content || content.trim().length === 0) {
      // Empty content, silently return
      return;
    }

    const t = createTranslator(locale);

    try {
      // Provide haptic feedback before opening share sheet
      HapticFeedback.medium();

      // Format share content with timestamp if available
      let shareText = content;
      if (timestamp) {
        const formattedDate = new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(timestamp);
        shareText = `${content}\n\n${t("components.share.footer", { date: formattedDate })}`;
      }

      // Use React Native's Share.share() for text-only content
      // Works reliably on iOS (UIActivityViewController) and Android (Intent.ACTION_SEND)
      await Share.share({
        message: shareText,
        title: t("components.share.title"),
      });

      // Note: We don't need to check result.action because:
      // - iOS: dismissedAction is a normal flow (user changed their mind)
      // - Android: doesn't reliably report dismissal
      // - Only actual errors are caught in catch block below
    } catch (error: unknown) {
      // Actual error occurred (not user dismissal)
      // Examples: no share providers available, invalid content, platform error

      // TRICKY: Only show alert for real errors. Type guard for Error object.
      if (error instanceof Error) {
        Alert.alert(
          t("components.share.failedTitle"),
          t("components.share.failedMessage"),
          [{ text: t("common.ok") }],
        );
      }
    }
  }

  /**
   * Share multiple messages as a conversation thread
   *
   * @param messages - Array of message contents to share
   * @returns Promise<void>
   *
   * Future enhancement: Combine multiple messages into formatted conversation.
   */
  static async shareConversation(
    messages: string[],
    locale: SupportedLocale = "en-US",
  ): Promise<void> {
    if (!messages || messages.length === 0) {
      // Empty conversation, silently return
      return;
    }

    const conversationText = messages
      .map((msg, index) => `${index + 1}. ${msg}`)
      .join('\n\n');

    await this.shareMessage(conversationText, undefined, locale);
  }
}
