import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  Alert,
} from "react-native";
import { format } from "date-fns";
import Markdown from "react-native-markdown-display";
import { Message } from "../types/chat";
import { useTypography } from "../ui/hooks/useTypography";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getCornerRadius } from "../ui/theme/liquidGlassSpacing";
import { HapticFeedback } from "../utils/haptics";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const typography = useTypography();
  const palette = useImessagePalette();

  const isUser = message.role === "user";
  const isLoading = message.status === "sending";
  const hasError = message.status === "error";

  const handleLongPress = () => {
    // Haptic feedback on long press
    HapticFeedback.medium();

    Alert.alert("Copy Message", "Do you want to copy this message?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Copy",
        onPress: () => {
          // In a real app, you'd use Clipboard from '@react-native-clipboard/clipboard'
          // Copy functionality would be implemented here
          HapticFeedback.light();
        },
      },
    ]);
  };

  // iOS 26 HIG: Use semantic colors from palette for all bubble states
  const bubbleStyles = [
    styles.bubble,
    {
      backgroundColor: hasError
        ? palette.destructive
        : isUser
          ? palette.accentTint
          : palette.surface,
      borderBottomRightRadius: isUser ? 6 : getCornerRadius('message'),
      borderBottomLeftRadius: isUser ? getCornerRadius('message') : 6,
    },
  ];

  const textStyles = [
    styles.text,
    {
      color: isUser || hasError ? "#FFFFFF" : palette.textPrimary,
    },
  ];

  const markdownStyles = {
    body: {
      color: isUser ? "#FFFFFF" : palette.textPrimary,
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      letterSpacing: typography.body.letterSpacing,
    },
    code_inline: {
      backgroundColor: isDark ? palette.solid : palette.surface,
      color: isDark ? "#FF9500" : "#AF52DE",
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

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <Pressable
        onLongPress={handleLongPress}
        style={bubbleStyles}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={`${isUser ? 'Your' : 'Assistant'} message: ${message.content}`}
        accessibilityHint="Long press to copy message"
      >
        {isUser ? (
          <Text style={[textStyles, typography.body]}>{message.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        )}

        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Text
              style={[
                styles.loadingText,
                typography.body,
                { color: isUser ? "#FFFFFF" : palette.textPrimary },
              ]}
            >
              ●●●
            </Text>
          </View>
        )}

        <View style={styles.messageInfo}>
          <Text
            style={[
              styles.timestamp,
              typography.caption1,
              { color: isUser ? "#FFFFFF" : palette.textTertiary },
            ]}
          >
            {format(message.timestamp, "HH:mm")}
          </Text>

          {hasError && (
            <Text
              style={[styles.errorIndicator, { backgroundColor: palette.destructive }]}
              accessible={true}
              accessibilityLabel="Message failed to send"
            >
              !
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

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
  bubble: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: getCornerRadius('message'),
    minWidth: 60,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    // backgroundColor applied inline from palette (user/assistant/error)
    // borderBottomLeftRadius/borderBottomRightRadius applied inline based on isUser
  },
  text: {
    // Typography and color applied inline from palette
  },
  messageInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: LiquidGlassSpacing.xxs,
  },
  timestamp: {
    opacity: 0.5,
    marginTop: 2,
    // Color applied inline from palette
  },
  errorIndicator: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    // backgroundColor applied inline from palette.destructive
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  loadingIndicator: {
    marginTop: LiquidGlassSpacing.xxs,
  },
  loadingText: {
    opacity: 0.6,
    textAlign: "center",
    // Color applied inline from palette
  },
});
