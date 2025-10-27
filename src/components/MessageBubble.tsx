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
import { LiquidGlassWrapper } from "./LiquidGlassWrapper";

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

  // iOS 26 HIG: Glass effect for message bubbles
  const glassVariant = isUser ? "prominent" : "regular";
  const glassTint = hasError ? palette.destructive : (isUser ? palette.accentTint : undefined);

  // BUGFIX: Platform-specific bubble styling to prevent shadow/glass conflicts
  // iOS: Clean glass rendering without shadows (shadows conflict with native glass)
  // Non-iOS: Standard styling with shadows and background colors
  const bubbleStyles = [
    styles.bubbleBase,
    Platform.OS === "ios"
      ? styles.bubbleGlass
      : [
          styles.bubbleShadow,
          {
            backgroundColor: hasError
              ? palette.destructive
              : isUser
                ? palette.accentTint
                : palette.surface,
          },
          // BUGFIX: Tail customization only for non-iOS
          // iOS glass uses uniform corner radius to avoid shape mismatch
          {
            borderBottomRightRadius: isUser ? 6 : getCornerRadius('message'),
            borderBottomLeftRadius: isUser ? getCornerRadius('message') : 6,
          },
        ],
  ].flat().filter(Boolean);

  const textStyles = [
    styles.text,
    {
      color: isUser || hasError ? palette.solid : palette.textPrimary,
    },
  ];

  const markdownStyles = {
    body: {
      color: isUser ? palette.solid : palette.textPrimary,
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

  // iOS 26 HIG: Render bubble content (shared between glass and fallback)
  const bubbleContent = (
    <>
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
              { color: isUser ? palette.solid : palette.textPrimary },
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
            { color: isUser ? palette.solid : palette.textTertiary },
          ]}
        >
          {format(message.timestamp, "HH:mm")}
        </Text>

        {hasError && (
          <Text
            style={[styles.errorIndicator, { backgroundColor: palette.destructive, color: palette.solid }]}
            accessible={true}
            accessibilityLabel="Message failed to send"
          >
            !
          </Text>
        )}
      </View>
    </>
  );

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {Platform.OS === "ios" ? (
        // iOS 26 HIG: Liquid Glass effect for message bubbles
        <LiquidGlassWrapper
          variant={glassVariant}
          shape="roundedRect"
          cornerRadius={getCornerRadius('message')}
          tintColor={glassTint}
          isInteractive={false}
          style={bubbleStyles}
        >
          <Pressable
            onLongPress={handleLongPress}
            style={styles.bubblePressable}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`${isUser ? 'Your' : 'Assistant'} message: ${message.content}`}
            accessibilityHint="Long press to copy message"
          >
            {bubbleContent}
          </Pressable>
        </LiquidGlassWrapper>
      ) : (
        // Android/Web: Standard bubble with semantic colors
        <Pressable
          onLongPress={handleLongPress}
          style={bubbleStyles}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${isUser ? 'Your' : 'Assistant'} message: ${message.content}`}
          accessibilityHint="Long press to copy message"
        >
          {bubbleContent}
        </Pressable>
      )}
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
  // BUGFIX: Split bubble styles to prevent shadow/glass conflicts
  // bubbleBase: Common properties for all platforms
  // bubbleShadow: Shadow properties ONLY for non-iOS (conflicts with glass on iOS)
  bubbleBase: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: getCornerRadius('message'),
    minWidth: 60,
    // backgroundColor applied inline from palette (user/assistant/error) for non-iOS
    // borderBottomLeftRadius/borderBottomRightRadius applied inline based on isUser (non-iOS only)
  },
  bubbleShadow: {
    // CRITICAL: Only applied to non-iOS platforms
    // On iOS, shadows conflict with native glass rendering causing fuzzy appearance
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleGlass: {
    // iOS 26 HIG: Glass wrapper handles background, padding moved to bubblePressable
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  bubblePressable: {
    // iOS 26 HIG: Pressable inside glass wrapper needs padding
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
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
