import React, { useRef, useEffect, useMemo } from "react";
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

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MessageList({
  messages,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
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

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    // TRICKY: setTimeout(100ms) ensures FlatList layout has completed before scrolling
    // Without delay, scrollToEnd() can execute before new items are rendered,
    // causing scroll position to be incorrect (off by one message)
    // This is a known FlatList behavior when data changes trigger immediate scroll
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // iOS 26 HIG: Render individual message bubble with solid backgrounds
  // MessageBubble uses solid colors (content layer) NOT glass (control layer)
  const renderMessage = ({ item: message }: ListRenderItemInfo<Message>) => {
    return <MessageBubble message={message} />;
  };

  const keyExtractor = (item: Message) => item.id;

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
            Start a conversation!
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
            Send a message to begin chatting with the AI assistant.
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
            Start a conversation!
          </Text>
          <Text
            style={[
              styles.emptySubtext,
              typography.subheadline,
              { color: palette.textSecondary },
            ]}
          >
            Send a message to begin chatting with the AI assistant.
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
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => {
        // TRICKY: onContentSizeChange handles layout changes (e.g., message bubble height changes)
        // Uses animated: false to avoid jarring animation when text reflows
        // Complements useEffect auto-scroll (which uses animated: true for new messages)
        if (messages.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: false });
        }
      }}
      ListEmptyComponent={renderEmptyComponent}
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
    paddingVertical: LiquidGlassSpacing.xs,
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
