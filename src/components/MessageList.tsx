import React, { useRef, useEffect } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  useColorScheme,
  Text,
  RefreshControl,
  ListRenderItemInfo,
} from "react-native";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Message } from "../types/chat";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onRetryMessage?: (messageId: string) => void;
}

export function MessageList({
  messages,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  onRetryMessage,
}: MessageListProps) {
  const flatListRef = useRef<FlatList<Message>>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => {
    return <MessageBubble message={item} onRetry={onRetryMessage} />;
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

  const renderFooterComponent = () => {
    if (!isLoading) return null;
    return <TypingIndicator />;
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => {
        // Auto-scroll to bottom when content size changes
        if (messages.length > 0 || isLoading) {
          flatListRef.current?.scrollToEnd({ animated: false });
        }
      }}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooterComponent}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={100}
      initialNumToRender={20}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 80, // Approximate message height
        offset: 80 * index,
        index,
      })}
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
