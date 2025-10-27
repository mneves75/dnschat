import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  Platform,
} from "react-native";
import { MenuView } from '@react-native-menu/menu';
import type { NativeActionEvent } from '@react-native-menu/menu';
import { Message } from "../types/chat";
import { useTypography } from "../ui/hooks/useTypography";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getCornerRadius } from "../ui/theme/liquidGlassSpacing";
import { HapticFeedback } from "../utils/haptics";
import { ClipboardService } from "../services/ClipboardService";
import { ShareService } from "../services/ShareService";
import { MessageContent } from "./MessageContent";
import { useTranslation } from "../i18n";

interface MessageBubbleProps {
  message: Message;
}

/**
 * MessageBubble Component (Internal)
 *
 * Displays a single message bubble with context menu for Copy/Share actions.
 * Wrapped with React.memo below for performance optimization.
 */
function MessageBubbleComponent({ message }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const typography = useTypography();
  const palette = useImessagePalette();
  const { t } = useTranslation();

  const isUser = message.role === "user";
  const isLoading = message.status === "sending";
  const hasError = message.status === "error";
  const messageCornerRadius = getCornerRadius('message');

  /**
   * Handle context menu action selection
   *
   * TRICKY: MenuView's onPressAction uses NativeActionEvent type from @react-native-menu/menu.
   * Action ID is in nativeEvent.event (not nativeEvent.actionKey).
   * We use 'copy' and 'share' as action IDs and handle them in this function.
   */
  const handleMenuPress = async (event: NativeActionEvent) => {
    const actionKey = event.nativeEvent.event;

    switch (actionKey) {
      case 'copy':
        // Copy message content to clipboard
        await ClipboardService.copy(message.content);
        break;

      case 'share':
        // Share message via native share sheet
        await ShareService.shareMessage(message.content, message.timestamp);
        break;

      default:
        // Unknown action, silently ignore
        break;
    }
  };

  // iOS 26 HIG: Message bubbles are CONTENT, not controls
  // Use simple solid backgrounds (standard materials), NOT Liquid Glass
  // Real iMessage uses solid colors: blue for user, gray for assistant
  const bubbleStyles = [
    styles.bubbleBase,
    {
      backgroundColor: hasError
        ? palette.destructive
        : isUser
          ? palette.userBubble
          : palette.assistantBubble,
    },
    {
      // iMessage-style tail: small corner radius on message origin side
      borderBottomRightRadius: isUser ? 6 : messageCornerRadius,
      borderBottomLeftRadius: isUser ? messageCornerRadius : 6,
    },
    // iOS standard material: shadows for depth (not glass)
    isUser || hasError ? styles.prominentShadow : styles.subtleShadow,
  ];

  // Text color: white on blue/red, dark/light on gray depending on mode
  const textColor = isUser || hasError
    ? palette.bubbleTextOnBlue
    : palette.bubbleTextOnGray;

  const textStyles = [
    styles.text,
    {
      color: textColor,
    },
  ];

  const markdownStyles = {
    body: {
      color: textColor,
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      letterSpacing: typography.body.letterSpacing,
    },
    code_inline: {
      backgroundColor: isDark ? palette.solid : palette.surface,
      color: palette.warning,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: typography.footnote.fontSize,
      fontFamily: 'Courier',
    },
    code_block: {
      backgroundColor: isDark ? palette.solid : palette.surface,
      padding: LiquidGlassSpacing.sm,
      borderRadius: getCornerRadius('input'),
      marginVertical: LiquidGlassSpacing.xs,
      fontFamily: 'Courier',
    },
    fence: {
      backgroundColor: isDark ? palette.solid : palette.surface,
      padding: LiquidGlassSpacing.sm,
      borderRadius: getCornerRadius('input'),
      marginVertical: LiquidGlassSpacing.xs,
      fontFamily: 'Courier',
    },
  };

  /**
   * Context menu actions
   *
   * IMPORTANT: Disable context menu for messages with status="sending"
   * to prevent user from interacting with incomplete messages.
   *
   * iOS: Uses SF Symbols for icons (doc.on.doc, square.and.arrow.up)
   * Android: Menu items show without icons (MenuView doesn't support Android icons in this version)
   *
   * PERFORMANCE: useMemo prevents recreating array on every render.
   * Depends on t() for translations, re-computed when locale changes.
   */
  const menuActions = useMemo(() => [
    {
      id: 'copy',
      title: t('screen.chat.messageActions.copy'),
      image: Platform.OS === 'ios' ? 'doc.on.doc' : undefined,
    },
    {
      id: 'share',
      title: t('screen.chat.messageActions.share'),
      image: Platform.OS === 'ios' ? 'square.and.arrow.up' : undefined,
    },
  ], [t]); // Depends on t for locale changes

  /**
   * Render message content
   *
   * CRITICAL: Extracted to MessageContent component to eliminate code duplication.
   * Previously, message content was duplicated in two branches (loading vs non-loading).
   * Now, content rendering is in one place, wrapped conditionally by MenuView.
   */
  const messageContentProps = {
    message,
    textColor,
    textStyles,
    markdownStyles,
    palette,
    typography,
  };

  const content = (
    <View
      style={bubbleStyles}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${isUser ? 'Your' : 'Assistant'} message: ${message.content}`}
      accessibilityHint={isLoading ? "Message is loading" : "Long press to show copy and share options"}
    >
      <MessageContent {...messageContentProps} />
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {/* Conditionally wrap in MenuView for non-loading messages */}
      {/* IMPORTANT: MenuView only shown for sent/error messages, not sending */}
      {!isLoading ? (
        <MenuView
          onPressAction={handleMenuPress}
          actions={menuActions}
          shouldOpenOnLongPress={true}
        >
          {content}
        </MenuView>
      ) : (
        content
      )}
    </View>
  );
}

/**
 * Custom comparison function for React.memo
 *
 * PERFORMANCE: Prevents unnecessary re-renders when message hasn't changed.
 * Returns true if props are equal (skip re-render), false if different (re-render).
 *
 * IMPORTANT: With React 19.1 Compiler auto-memoization, this might be redundant
 * in production. However, explicit memoization with custom comparison provides:
 * 1. Clear intent for code readers
 * 2. Guaranteed optimization even if Compiler disabled
 * 3. Custom logic for deep equality checks on message fields
 *
 * TRICKY: We deep-compare message fields instead of reference equality because:
 * - ChatContext creates new message objects when updating (immutable pattern)
 * - Reference equality would always fail, causing unnecessary re-renders
 * - Deep comparison catches actual content changes while skipping cosmetic updates
 */
function arePropsEqual(
  prevProps: MessageBubbleProps,
  nextProps: MessageBubbleProps
): boolean {
  const prev = prevProps.message;
  const next = nextProps.message;

  // Compare all message fields that affect rendering
  return (
    prev.id === next.id &&
    prev.role === next.role &&
    prev.content === next.content &&
    prev.status === next.status &&
    prev.timestamp.getTime() === next.timestamp.getTime()
  );
}

/**
 * Memoized MessageBubble Component
 *
 * PERFORMANCE: React.memo with custom comparison prevents re-renders when:
 * - Other messages in the list change
 * - Parent component re-renders
 * - Unrelated context values change
 *
 * Only re-renders when THIS specific message's fields change.
 */
export const MessageBubble = React.memo(MessageBubbleComponent, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    marginVertical: LiquidGlassSpacing.xxs,
    marginHorizontal: LiquidGlassSpacing.md,
    maxWidth: "75%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  // iOS 26 HIG: Message bubbles use solid backgrounds (content layer)
  // NOT Liquid Glass (which is for controls/navigation layer only)
  bubbleBase: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: getCornerRadius('message'),
    minWidth: 60,
    // backgroundColor applied inline from palette (userBubble, assistantBubble, destructive)
    // borderBottomLeftRadius/borderBottomRightRadius applied inline for tail customization
  },
  // iOS standard material: prominent shadow for user/error bubbles
  prominentShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: Platform.OS === "android" ? 4 : undefined,
  },
  // iOS standard material: subtle shadow for assistant bubbles
  subtleShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: Platform.OS === "android" ? 2 : undefined,
  },
  text: {
    // Typography and color applied inline from palette
  },
});
