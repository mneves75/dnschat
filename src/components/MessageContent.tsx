import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { format } from "date-fns";
import type { Message } from "../types/chat";
import type { IMessagePalette } from "../ui/theme/imessagePalette";
import type { TypographyScale } from "../ui/theme/liquidGlassTypography";
import { LiquidGlassSpacing } from "../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../i18n";
import { SafeMarkdown } from "./SafeMarkdown";
import type { SafeMarkdownStyle } from "./SafeMarkdown";

interface MessageContentProps {
  message: Message;
  textColor: string;
  textStyles: StyleProp<TextStyle>;
  markdownStyles: SafeMarkdownStyle;
  palette: IMessagePalette;
  typography: TypographyScale;
}

const FIXED_GLYPH_MAX_FONT_SCALE = 1.2;

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
  const { t } = useTranslation();
  const isUser = message.role === "user";
  const isLoading = message.status === "sending";
  const hasError = message.status === "error";
  const displayContent = hasError
    ? t("screen.chat.errorMessage")
    : message.content;
  return (
    <>
      {/* Message text content */}
      {isUser || hasError ? (
        <Text style={[textStyles, typography.body]} selectable={false}>
          {displayContent}
        </Text>
      ) : (
        <SafeMarkdown style={markdownStyles}>{displayContent}</SafeMarkdown>
      )}

      {/* Loading indicator for sending messages */}
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <Text
            style={[styles.loadingText, typography.body, { color: textColor }]}
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
            style={[
              styles.errorIndicator,
              {
                backgroundColor: palette.destructive,
                color: palette.textOnChroma,
              },
            ]}
            accessible={true}
            accessibilityLabel={t("screen.chat.accessibility.errorIndicator")}
            selectable={false}
            maxFontSizeMultiplier={FIXED_GLYPH_MAX_FONT_SCALE}
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
    // Tabular figures align the HH:mm digits vertically across stacked bubbles.
    fontVariant: ["tabular-nums"],
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
