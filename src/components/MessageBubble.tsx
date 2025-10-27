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
import { LiquidGlassWrapper, useLiquidGlassCapabilities } from "./LiquidGlassWrapper";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const typography = useTypography();
  const palette = useImessagePalette();
  const { supportsLiquidGlass } = useLiquidGlassCapabilities();

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
  // iOS with glass: Clean glass rendering without shadows (shadows conflict with native glass)
  // iOS without glass OR non-iOS: Standard styling with shadows and background colors
  const useGlassRendering = Platform.OS === "ios" && supportsLiquidGlass;

  // BUGFIX: Separate glass and non-glass styles completely
  // Glass: Only container layout (minWidth), no padding/borderRadius (handled by wrapper/pressable)
  // Non-glass: Full styles with padding, borderRadius, shadows, background
  const bubbleStyles = useGlassRendering
    ? [styles.bubbleGlassContainer]
    : [
        styles.bubbleBase,
        styles.bubbleShadow,
        {
          backgroundColor: hasError
            ? palette.destructive
            : isUser
              ? palette.accentTint
              : palette.surface,
        },
        // Tail customization only for non-glass rendering
        // Glass uses uniform corner radius to avoid shape mismatch
        {
          borderBottomRightRadius: isUser ? 6 : getCornerRadius('message'),
          borderBottomLeftRadius: isUser ? getCornerRadius('message') : 6,
        },
      ];

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
      {useGlassRendering ? (
        // iOS 26+ with Liquid Glass available: Native glass effect for message bubbles
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
        // iOS < 26, reduced transparency, Android, or Web: Standard bubble with shadows and colors
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
  // BUGFIX: Completely separate glass and non-glass bubble styles
  // bubbleBase: Non-glass platforms get padding, borderRadius, full styling
  bubbleBase: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: getCornerRadius('message'),
    minWidth: 60,
    // backgroundColor applied inline from palette (user/assistant/error) for non-glass
    // borderBottomLeftRadius/borderBottomRightRadius applied inline based on isUser (non-glass only)
  },
  bubbleShadow: {
    // CRITICAL: Only applied to non-glass platforms
    // On iOS with glass, shadows conflict with native glass rendering causing fuzzy appearance
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  // BUGFIX: Glass container gets ONLY layout properties, NO appearance properties
  // LiquidGlassWrapper handles: background, borderRadius via cornerRadius prop
  // bubblePressable handles: padding (content spacing)
  bubbleGlassContainer: {
    minWidth: 60,
    // NO padding - handled by bubblePressable
    // NO borderRadius - handled by LiquidGlassWrapper cornerRadius prop
    // NO backgroundColor - handled by LiquidGlassWrapper/GlassView
  },
  bubblePressable: {
    // iOS 26 HIG: Pressable inside glass wrapper provides content padding
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
