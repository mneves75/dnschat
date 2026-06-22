import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { useTypography } from "../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../i18n";
import { PressableRipple } from "./PressableRipple";

interface MessageListErrorFallbackProps {
  /** Clears the boundary error and re-mounts the message list. */
  onRetry: () => void;
  testID?: string;
}

/**
 * Contained fallback shown when the message list subtree throws. Keeps the rest
 * of the chat screen (input, navigation) interactive instead of escalating to the
 * app-level boundary and blanking the whole UI.
 */
export function MessageListErrorFallback({
  onRetry,
  testID = "message-list-error",
}: MessageListErrorFallbackProps) {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID={testID}>
      <Text
        style={[styles.title, typography.title3, { color: palette.textPrimary }]}
        accessibilityRole="header"
      >
        {t("screen.chat.listError.title")}
      </Text>
      <Text
        style={[styles.description, typography.subheadline, { color: palette.textSecondary }]}
      >
        {t("screen.chat.listError.description")}
      </Text>
      <PressableRipple
        style={[styles.retryButton, { backgroundColor: palette.userBubble }]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t("screen.chat.listError.retry")}
        variant="primary"
      >
        <Text style={[styles.retryText, { color: palette.bubbleTextOnBlue }]}>
          {t("screen.chat.listError.retry")}
        </Text>
      </PressableRipple>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: LiquidGlassSpacing.xl,
  },
  title: {
    marginBottom: LiquidGlassSpacing.xs,
    textAlign: "center",
  },
  description: {
    marginBottom: LiquidGlassSpacing.lg,
    textAlign: "center",
    opacity: 0.8,
  },
  retryButton: {
    paddingHorizontal: LiquidGlassSpacing.xl,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: LiquidGlassSpacing.xl,
    minHeight: 44,
    justifyContent: "center",
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MessageListErrorFallback;
