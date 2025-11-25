import React, { useRef, useEffect, useMemo, useCallback } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  useColorScheme,
  Text,
  RefreshControl,
  ListRenderItemInfo,
  Platform,
} from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Message } from "../types/chat";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { useTypography } from "../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../ui/theme/liquidGlassSpacing";
import { LiquidGlassWrapper, useLiquidGlassCapabilities } from "./LiquidGlassWrapper";
import { useTranslation } from "../i18n";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /**
   * Additional bottom inset reserved for UI chrome (e.g., ChatInput accessory).
   * Ensures the final message never hides beneath overlays or home indicator.
   * INCLUDES keyboard height when visible (KeyboardStickyView uses transform).
   */
  bottomInset?: number;
  /** Test ID for e2e testing */
  testID?: string;
}

export function MessageList({
  messages,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  bottomInset = 0,
  testID,
}: MessageListProps) {
  const flatListRef = useRef<FlatList<Message>>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { supportsLiquidGlass } = useLiquidGlassCapabilities();

  // iOS 26 HIG: Semantic color palette that adapts to light/dark/high-contrast modes
  // Returns memoized object - only re-renders when colorScheme/accessibility settings change
  // Eliminates hardcoded colors (#007AFF, #FFFFFF, etc.) for proper theme adaptation
  const palette = useImessagePalette();

  // iOS 26 HIG: SF Pro typography system with precise letter spacing and line heights
  // Platform-adaptive: SF Pro on iOS, Roboto on Android
  // Each style (title2, subheadline, etc.) includes fontSize, fontWeight, letterSpacing
  const typography = useTypography();

  const { t } = useTranslation();

  // Track last message's content length and status to detect updates (not just additions)
  // CRITICAL: When assistant response arrives, message is UPDATED (content changes from "" to response)
  // but messages.length stays the same. We need to scroll when content updates too.
  const lastMessage = messages[messages.length - 1];
  const lastMessageKey = lastMessage
    ? `${lastMessage.id}-${lastMessage.status}-${lastMessage.content.length}`
    : "";

  // CLEAN SOLUTION: Single scroll function with guaranteed layout completion
  // Double RAF ensures FlatList has completed layout before scrolling
  // This is more reliable than setTimeout with arbitrary delays
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      // Double requestAnimationFrame guarantees FlatList layout is complete
      // First RAF: Browser schedules next paint
      // Second RAF: Layout has been calculated and committed
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
          // Optional: Add logging for debugging
          if (__DEV__) {
            console.log('[MessageList] Scrolled to bottom', {
              messageCount: messages.length,
              lastMessageKey,
              bottomInset,
            });
          }
        });
      });
    }
  }, [messages.length, lastMessageKey, bottomInset]);

  // SINGLE SOURCE OF TRUTH: Scroll on any relevant change
  // Triggers when: new messages arrive, keyboard shows/hides, input grows
  // No complex logic, no timing assumptions, no conflicts
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // iOS 26 HIG: Render individual message bubble with solid backgrounds
  // MessageBubble uses solid colors (content layer) NOT glass (control layer)
  const renderMessage = ({ item: message }: ListRenderItemInfo<Message>) => {
    return <MessageBubble message={message} />;
  };

  const keyExtractor = (item: Message) => item.id;

  const contentContainerStyle = useMemo(
    () => styles.contentContainer,
    [],
  );

  // CRITICAL FIX: FlatList.scrollToEnd() ignores contentContainerStyle.paddingBottom
  // Root cause: scrollToEnd() API scrolls to content boundary, excludes padding from calculation
  // Solution: ListFooterComponent is treated as CONTENT, so scrollToEnd naturally includes it
  // Height = LiquidGlassSpacing.xs (8px) + bottomInset (inputHeight + safeArea + spacing + keyboardHeight)
  // This ensures last message is fully visible above keyboard with iOS HIG-compliant 8px spacing
  // testID enables integration testing, accessibilityElementsHidden prevents screen reader focus on invisible spacer
  const renderFooter = useCallback(() => (
    <View
      style={{ height: LiquidGlassSpacing.xs + bottomInset }}
      testID="message-list-footer"
      accessibilityElementsHidden={true}
    />
  ), [bottomInset]);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {/* iOS 26+ HIG: Empty state in glass card when glass is available */}
      {supportsLiquidGlass ? (
        <LiquidGlassWrapper
          variant="regular"
          shape="roundedRect"
          cornerRadius={20}
          isInteractive={false}
          style={styles.emptyGlassCard}
        >
          {/* iOS 26 HIG: Empty state following Apple's design patterns
              - title2 typography (22pt, 600 weight, -0.26pt letter spacing)
              - textPrimary color (adapts to light/dark/high-contrast automatically)
              PATTERN: Style array combines static styles with dynamic theme values
              [static layout, dynamic typography, dynamic color] ensures proper override order */}
          <Text
            style={[
              styles.emptyText,
              typography.title2,
              { color: palette.textPrimary },
            ]}
          >
            {t("screen.chat.emptyState.title")}
          </Text>
          {/* subheadline typography (15pt, 400 weight, -0.5pt letter spacing)
              textSecondary provides reduced opacity for visual hierarchy
              0.8 opacity applied in static styles for additional subtlety */}
          <Text
            style={[
              styles.emptySubtext,
              typography.subheadline,
              { color: palette.textSecondary },
            ]}
          >
            {t("screen.chat.emptyState.description")}
          </Text>
        </LiquidGlassWrapper>
      ) : (
        // Android/Web: Standard view without glass
        <View style={styles.emptyNonGlassCard}>
          <Text
            style={[
              styles.emptyText,
              typography.title2,
              { color: palette.textPrimary },
            ]}
          >
            {t("screen.chat.emptyState.title")}
          </Text>
          <Text
            style={[
              styles.emptySubtext,
              typography.subheadline,
              { color: palette.textSecondary },
            ]}
          >
            {t("screen.chat.emptyState.description")}
          </Text>
        </View>
      )}
    </View>
  );

  const refreshControl = onRefresh ? (
    // iOS 26 HIG: RefreshControl tint uses accentTint (semantic blue)
    // Replaces hardcoded "#000000" / "#FFFFFF" for proper theme adaptation
    // accentTint adjusts opacity in dark mode (0.65 vs 0.55) for visibility
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      tintColor={palette.accentTint}
    />
  ) : undefined;

  return (
    <FlatList
      ref={flatListRef}
      testID={testID}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      style={styles.container}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      // REMOVED: onContentSizeChange scroll handler - conflicts with useEffect scroll
      // Our scrollToBottom with double RAF handles all scenarios reliably
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      // PERFORMANCE: FlatList optimizations for smooth 60fps scrolling
      // removeClippedSubviews: Unmounts off-screen items (iOS memory optimization)
      // maxToRenderPerBatch: Limits items per render cycle to prevent frame drops
      // windowSize: Viewport multiplier (10 = 5 viewports above + 5 below)
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={100}
      initialNumToRender={20}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // iOS 26 HIG: Transparent background to show glass effect from LiquidGlassWrapper
    // CRITICAL: Parent component wraps this in LiquidGlassWrapper (Chat.tsx)
    // Solid background (#FFFFFF/#000000) would block glass blur effect
    // This allows parent's glass effect to be visible through the message list
    backgroundColor: "transparent",
  },
  contentContainer: {
    flexGrow: 1,
    // iOS 26 HIG: LiquidGlassSpacing.xs = 8px (8px grid system)
    // Consistent vertical padding throughout app for visual rhythm
    // NOTE: paddingTop only - paddingBottom moved to ListFooterComponent for scrollToEnd compatibility
    paddingTop: LiquidGlassSpacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // iOS 26 HIG: LiquidGlassSpacing.xl = 24px
    // Large horizontal padding for empty state provides comfortable reading width
    // Prevents text from spanning full screen width on larger devices
    paddingHorizontal: LiquidGlassSpacing.xl,
  },
  // iOS 26 HIG: Glass card for empty state on iOS
  emptyGlassCard: {
    paddingHorizontal: LiquidGlassSpacing.lg,
    paddingVertical: LiquidGlassSpacing.lg,
  },
  // Android/Web: Standard card with subtle background
  emptyNonGlassCard: {
    paddingHorizontal: LiquidGlassSpacing.lg,
    paddingVertical: LiquidGlassSpacing.lg,
    backgroundColor: "rgba(242, 242, 247, 0.5)", // Subtle background
    borderRadius: 20,
  },
  emptyText: {
    // PATTERN: Static layout properties in StyleSheet, dynamic theme properties inline
    // Typography (fontSize, fontWeight, letterSpacing) applied inline from typography.title2
    // Color applied inline from palette.textPrimary
    // This separation enables theme changes without StyleSheet recreation
    // iOS 26 HIG: LiquidGlassSpacing.xs = 8px spacing between title and subtitle
    marginBottom: LiquidGlassSpacing.xs,
    textAlign: "center",
  },
  emptySubtext: {
    // Typography applied inline from typography.subheadline
    // Color applied inline from palette.textSecondary
    // Additional 0.8 opacity for subtle visual hierarchy (reduces emphasis)
    opacity: 0.8,
    textAlign: "center",
  },
});
