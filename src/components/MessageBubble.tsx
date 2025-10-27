import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  Alert,
  Platform,
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
  const messageCornerRadius = getCornerRadius('message');

  const handleLongPress = () => {
    HapticFeedback.medium();

    Alert.alert("Copy Message", "Do you want to copy this message?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Copy",
        onPress: () => {
          // In a real app, you'd use Clipboard from '@react-native-clipboard/clipboard'
          HapticFeedback.light();
        },
      },
    ]);
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
                { color: textColor },
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
              { color: textColor, opacity: 0.6 },
            ]}
          >
            {format(message.timestamp, "HH:mm")}
          </Text>

          {hasError && (
            <Text
              style={[styles.errorIndicator, { backgroundColor: palette.destructive, color: palette.bubbleTextOnBlue }]}
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
  messageInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: LiquidGlassSpacing.xxs,
  },
  timestamp: {
    marginTop: 2,
    // Color and opacity applied inline from palette
  },
  errorIndicator: {
    fontSize: 12,
    fontWeight: "bold",
    // color and backgroundColor applied inline from palette
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
