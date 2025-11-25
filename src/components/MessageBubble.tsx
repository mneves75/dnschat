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

// Platform-specific monospace font for code rendering
const MONOSPACE_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'Courier',
});

interface MessageBubbleProps {
  message: Message;
}

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
      fontFamily: MONOSPACE_FONT,
    },
    code_block: {
      backgroundColor: isDark ? palette.solid : palette.surface,
      padding: LiquidGlassSpacing.sm,
      borderRadius: getCornerRadius('input'),
      marginVertical: LiquidGlassSpacing.xs,
      fontFamily: MONOSPACE_FONT,
    },
    fence: {
      backgroundColor: isDark ? palette.solid : palette.surface,
      padding: LiquidGlassSpacing.sm,
      borderRadius: getCornerRadius('input'),
      marginVertical: LiquidGlassSpacing.xs,
      fontFamily: MONOSPACE_FONT,
    },
  };

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
    bubbleBase: {
      paddingHorizontal: LiquidGlassSpacing.md,
      paddingVertical: LiquidGlassSpacing.sm,
      borderRadius: getCornerRadius('message'),
      minWidth: 60,
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
