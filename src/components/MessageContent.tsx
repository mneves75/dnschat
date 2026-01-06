import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { format } from "date-fns";
import Markdown from "react-native-markdown-display";
import type { MarkdownProps } from "react-native-markdown-display";
import type { Message } from "../types/chat";
import type { IMessagePalette } from "../ui/theme/imessagePalette";
import type { TypographyScale } from "../ui/theme/liquidGlassTypography";
import { LiquidGlassSpacing } from "../ui/theme/liquidGlassSpacing";

interface MessageContentProps {
  message: Message;
  textColor: string;
  textStyles: StyleProp<TextStyle>;
  markdownStyles: MarkdownProps["style"];
  palette: IMessagePalette;
  typography: TypographyScale;
}

/**
 * MessageContent Component
 *
 * Extracted from MessageBubble to eliminate code duplication.
 * Renders the message content including:
 * - User text or Markdown content (for assistant)
 * - Loading indicator (for sending messages)
 * - Timestamp and error indicator
 *
 * IMPORTANT: This component is pure presentation - no side effects or state.
 * Parent (MessageBubble) handles context menu and interactions.
 */
export function MessageContent({
  message,
  textColor,
  textStyles,
  markdownStyles,
  palette,
  typography,
}: MessageContentProps) {
  const isUser = message.role === "user";
  const isLoading = message.status === "sending";
  const hasError = message.status === "error";

  return (
    <>
      {/* Message text content */}
      {isUser ? (
        <Text style={[textStyles, typography.body]} selectable={false}>{message.content}</Text>
      ) : (
        <Markdown style={markdownStyles}>{message.content}</Markdown>
      )}

      {/* Loading indicator for sending messages */}
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <Text
            style={[
              styles.loadingText,
              typography.body,
              { color: textColor },
            ]}
            selectable={false}
          >
            ●●●
          </Text>
        </View>
      )}

      {/* Timestamp and error indicator */}
      <View style={styles.messageInfo}>
        <Text
          style={[
            styles.timestamp,
            typography.caption1,
            { color: textColor, opacity: 0.6 },
          ]}
          selectable={false}
        >
          {format(message.timestamp, "HH:mm")}
        </Text>

        {hasError && (
          <Text
            style={[styles.errorIndicator, { backgroundColor: palette.destructive, color: palette.bubbleTextOnBlue }]}
            accessible={true}
            accessibilityLabel="Message failed to send"
            selectable={false}
          >
            !
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loadingIndicator: {
    marginTop: LiquidGlassSpacing.xxs,
  },
  loadingText: {
    opacity: 0.6,
    textAlign: "center",
    // Color applied inline from palette
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
});
