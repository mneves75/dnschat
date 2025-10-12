import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  Text,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { MessageBubble } from "./MessageBubble";
import { Message } from "../types/chat";

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
  const flatListRef = useRef<FlashList<Message>>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  // Ensure the list never collides with the input surface once keyboard/tab bar offsets are applied.
  const contentBottomPadding = insets.bottom + 16;

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => {
    return <MessageBubble message={item} />;
  };

  const keyExtractor = (item: Message) => item.id;

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          isDark ? styles.darkEmptyText : styles.lightEmptyText,
        ]}
      >
        Start a conversation!
      </Text>
      <Text
        style={[
          styles.emptySubtext,
          isDark ? styles.darkEmptySubtext : styles.lightEmptySubtext,
        ]}
      >
        Send a message to begin chatting with the AI assistant.
      </Text>
    </View>
  );

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      tintColor={isDark ? "#FFFFFF" : "#000000"}
    />
  ) : undefined;

  return (
    <FlashList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      estimatedItemSize={80}
      contentInsetAdjustmentBehavior="automatic"
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: contentBottomPadding },
      ]}
      showsVerticalScrollIndicator={false}
      onLoad={({ elapsedTimeInMs }) => {
        if (__DEV__) {
          console.log(`[MessageList] FlashList initial load ${elapsedTimeInMs}ms`);
        }
      }}
      onContentSizeChange={() => {
        // Auto-scroll to bottom when content size changes
        if (messages.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: false });
        }
      }}
      ListEmptyComponent={renderEmptyComponent}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  lightEmptyText: {
    color: "#000000",
  },
  darkEmptyText: {
    color: "#FFFFFF",
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 22,
  },
  lightEmptySubtext: {
    color: "#8E8E93",
  },
  darkEmptySubtext: {
    color: "#8E8E93",
  },
});
