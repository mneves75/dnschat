/**
 * GlassChatList - Modernized Chat List with FlashList + Liquid Glass
 *
 * Phase 1 rebuild featuring:
 * - FlashList for high-performance virtualized rendering
 * - useGlassTheme() for unified material parameters
 * - Skeleton loading states with glass placeholders
 * - FPS and memory instrumentation
 *
 * @author DNSChat Team
 * @since 2.1.0 (Phase 1 - Liquid Glass UI Redesign)
 */

import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  Animated,
  Pressable,
  Share,
} from "react-native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useRouter, useFocusEffect } from "expo-router";
import { useChat } from "../context/ChatContext";
import { useGlassTheme } from "../hooks/useGlassTheme";
import {
  GlassActionSheet,
  useGlassBottomSheet,
} from "../components/glass";
import { TrashIcon } from "../components/icons/TrashIcon";
import { PlusIcon } from "../components/icons/PlusIcon";
import { formatDistanceToNow } from "date-fns";
import { Chat } from "../types/chat";

// ==================================================================================
// TYPES
// ==================================================================================

interface ChatItemProps {
  chat: Chat;
  onPress: () => void;
  onDelete: () => void;
  onShare?: () => Promise<void> | void;
}

// ==================================================================================
// SKELETON LOADING STATE
// ==================================================================================

const GlassSkeletonCard: React.FC = () => {
  const { getGlassStyle, colors } = useGlassTheme();
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeAnim]);

  return (
    <View style={[getGlassStyle("card", "regular", "roundedRect"), styles.skeletonCard]}>
      <Animated.View style={[styles.skeletonContent, { opacity: fadeAnim }]}>
        {/* Title skeleton */}
        <View
          style={[
            styles.skeletonLine,
            styles.skeletonTitle,
            { backgroundColor: colors.muted },
          ]}
        />
        {/* Preview skeleton */}
        <View
          style={[
            styles.skeletonLine,
            styles.skeletonPreview,
            { backgroundColor: colors.muted },
          ]}
        />
        {/* Metadata skeleton */}
        <View style={styles.skeletonMeta}>
          <View
            style={[
              styles.skeletonLine,
              styles.skeletonTime,
              { backgroundColor: colors.muted },
            ]}
          />
          <View
            style={[
              styles.skeletonLine,
              styles.skeletonBadge,
              { backgroundColor: colors.muted },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

// ==================================================================================
// GLASS CHAT ITEM COMPONENT
// ==================================================================================

const GlassChatItem: React.FC<ChatItemProps> = React.memo(({
  chat,
  onPress,
  onDelete,
  onShare,
}) => {
  const { getGlassStyle, colors } = useGlassTheme();
  const actionSheet = useGlassBottomSheet();
  const [isPressed, setIsPressed] = useState(false);

  const lastMessage = chat.messages[chat.messages.length - 1];
  const messageCount = chat.messages.length;
  const timeAgo = formatDistanceToNow(chat.createdAt, { addSuffix: true });

  const handleLongPress = useCallback(() => {
    if (Platform.OS === "ios" && __DEV__) {
      console.log("🔸 Haptic: Chat long press feedback");
    }
    actionSheet.show();
  }, [actionSheet]);

  const handleSharePress = useCallback(async () => {
    if (onShare) {
      await onShare();
    }
    actionSheet.hide();
  }, [actionSheet, onShare]);

  const handleDeletePress = useCallback(() => {
    onDelete();
    actionSheet.hide();
  }, [actionSheet, onDelete]);

  const cardStyle = getGlassStyle(
    "card",
    isPressed ? "interactive" : "regular",
    "roundedRect",
  );

  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={handleLongPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        accessibilityRole="button"
        android_ripple={{ color: colors.accent + "33" }}
        style={({ pressed }) => [
          styles.chatItemWrapper,
          pressed && styles.chatItemWrapperPressed,
        ]}
      >
        <View style={[cardStyle, styles.chatItemContainer]}>
          <View style={styles.chatItemContent}>
            {/* Chat Info */}
            <View style={styles.chatInfo}>
              <Text style={[styles.chatTitle, { color: colors.text }]}>
                {chat.title}
              </Text>

              {lastMessage && (
                <Text style={[styles.chatPreview, { color: colors.muted }]}>
                  {lastMessage.content.length > 60
                    ? `${lastMessage.content.substring(0, 60)}...`
                    : lastMessage.content}
                </Text>
              )}

              <View style={styles.chatMeta}>
                <Text style={[styles.chatTime, { color: colors.muted }]}>
                  {timeAgo}
                </Text>

                <View style={styles.chatBadges}>
                  {messageCount > 0 && (
                    <View
                      style={[
                        getGlassStyle("button", "interactive", "capsule"),
                        styles.messageBadge,
                      ]}
                    >
                      <Text style={[styles.messageBadgeText, { color: colors.accent }]}>
                        {messageCount} msg{messageCount === 1 ? "" : "s"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.chatActions}>
              <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
            </View>
          </View>
        </View>
      </Pressable>

      {/* Chat Action Sheet */}
      <GlassActionSheet
        visible={actionSheet.visible}
        onClose={actionSheet.hide}
        title={chat.title}
        message="Choose an action for this conversation"
        actions={[
          {
            title: "Open Chat",
            onPress: onPress,
            icon: <Text>💬</Text>,
          },
          ...(onShare
            ? [
                {
                  title: "Share Chat",
                  onPress: handleSharePress,
                  icon: <Text>📤</Text>,
                },
              ]
            : []),
          {
            title: "Delete Chat",
            onPress: handleDeletePress,
            style: "destructive" as const,
            icon: <TrashIcon size={20} color="#FF453A" />,
          },
          {
            title: "Cancel",
            onPress: actionSheet.hide,
            style: "cancel" as const,
          },
        ]}
      />
    </>
  );
});

GlassChatItem.displayName = "GlassChatItem";

// ==================================================================================
// EMPTY STATE COMPONENT
// ==================================================================================

const EmptyState: React.FC = () => {
  const { getGlassStyle, colors } = useGlassTheme();

  return (
    <View style={[getGlassStyle("card", "regular", "roundedRect"), styles.emptyStateContainer]}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Conversations Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
          Start your first conversation by tapping "New Chat" above. Your chats
          will appear here.
        </Text>
      </View>
    </View>
  );
};

// ==================================================================================
// HEADER COMPONENT (NEW CHAT BUTTON)
// ==================================================================================

const ChatListHeader: React.FC<{ onNewChat: () => void }> = ({ onNewChat }) => {
  const { getGlassStyle, colors } = useGlassTheme();

  return (
    <View style={styles.headerContainer}>
      <Pressable
        onPress={onNewChat}
        accessibilityRole="button"
        android_ripple={{ color: colors.accent + "33" }}
        style={({ pressed }) => [
          getGlassStyle("button", "interactive", "roundedRect"),
          styles.newChatButton,
          pressed && styles.newChatButtonPressed,
        ]}
      >
        <PlusIcon size={20} color="#FFFFFF" circleColor={colors.accent} />
        <Text style={[styles.newChatText, { color: colors.text }]}>New Chat</Text>
      </Pressable>
    </View>
  );
};

// ==================================================================================
// FOOTER COMPONENT (STATISTICS)
// ==================================================================================

const ChatListFooter: React.FC<{ chats: Chat[] }> = ({ chats }) => {
  const { getGlassStyle, colors } = useGlassTheme();

  if (chats.length === 0) return null;

  const totalMessages = chats.reduce((total, chat) => total + chat.messages.length, 0);
  const averageMessages = Math.round(totalMessages / chats.length);

  return (
    <View style={styles.footerContainer}>
      <View style={[getGlassStyle("card", "prominent", "roundedRect"), styles.statsCard]}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Total Messages</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>{totalMessages}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Avg per Chat</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>{averageMessages}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ==================================================================================
// MAIN GLASS CHAT LIST COMPONENT
// ==================================================================================

export function GlassChatList() {
  const router = useRouter();
  const { colors } = useGlassTheme();
  const {
    chats,
    createChat,
    deleteChat,
    setCurrentChat,
    loadChats,
    isLoading,
  } = useChat();

  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  renderCountRef.current += 1;
  const now = Date.now();
  const lastRenderDuration = now - lastRenderTimeRef.current;
  lastRenderTimeRef.current = now;

  // Load chats when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats]),
  );

  const [refreshing, setRefreshing] = useState(false);

  const handleNewChat = useCallback(async () => {
    const newChat = await createChat();
    setCurrentChat(newChat);
    router.push("/(app)/chat");

    if (Platform.OS === "ios" && __DEV__) {
      console.log("🔸 Haptic: New chat created");
    }
  }, [createChat, setCurrentChat, router]);

  const handleChatPress = useCallback(
    (chat: Chat) => {
      setCurrentChat(chat);
      router.push("/(app)/chat");
    },
    [setCurrentChat, router],
  );

  const handleDeleteChat = useCallback(
    (chatId: string, chatTitle: string) => {
      Alert.alert(
        "Delete Chat",
        `Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteChat(chatId);
              if (Platform.OS === "ios" && __DEV__) {
                console.log("🔸 Haptic: Chat deleted");
              }
            },
          },
        ],
      );
    },
    [deleteChat],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadChats();
    } finally {
      setRefreshing(false);
    }
  }, [loadChats]);

  const handleShareChat = useCallback(async (chat: Chat) => {
    try {
      await Share.share({
        message: `DNSChat conversation: ${chat.title}`,
      });
    } catch (error) {
      console.warn("Failed to share chat", error);
    }
  }, []);

  const renderChatItem: ListRenderItem<Chat> = useCallback(
    ({ item }) => (
      <GlassChatItem
        chat={item}
        onPress={() => handleChatPress(item)}
        onDelete={() => handleDeleteChat(item.id, item.title)}
        onShare={() => handleShareChat(item)}
      />
    ),
    [handleChatPress, handleDeleteChat, handleShareChat],
  );

  const renderEmptyComponent = useCallback(() => <EmptyState />, []);

  const renderHeaderComponent = useCallback(
    () => <ChatListHeader onNewChat={handleNewChat} />,
    [handleNewChat],
  );

  const renderFooterComponent = useCallback(
    () => <ChatListFooter chats={chats} />,
    [chats],
  );

  // Show skeleton loading state
  if (isLoading && chats.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ChatListHeader onNewChat={handleNewChat} />
        <View style={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <GlassSkeletonCard key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {__DEV__ && (
        <View style={styles.debugBar}>
          <Text style={[styles.debugText, { color: colors.muted }]}>
            Renders: {renderCountRef.current} | Last: {lastRenderDuration}ms | Chats: {chats.length}
          </Text>
        </View>
      )}

      <FlashList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeaderComponent}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooterComponent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={Platform.OS === "android"}
      />
    </View>
  );
}

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  debugText: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  newChatButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  newChatText: {
    fontSize: 17,
    fontWeight: "600",
  },
  chatItemWrapper: {
    marginBottom: 12,
  },
  chatItemWrapperPressed: {
    transform: [{ scale: 0.98 }],
  },
  chatItemContainer: {
    padding: 16,
  },
  chatItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 8,
    lineHeight: 20,
  },
  chatMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatTime: {
    fontSize: 13,
    fontWeight: "400",
  },
  chatBadges: {
    flexDirection: "row",
    gap: 6,
  },
  messageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  messageBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  chatActions: {
    marginLeft: 12,
  },
  chevron: {
    fontSize: 24,
    fontWeight: "300",
    opacity: 0.5,
  },
  emptyStateContainer: {
    marginHorizontal: 16,
    marginVertical: 32,
    padding: 32,
  },
  emptyState: {
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
  },
  footerContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  statsCard: {
    padding: 20,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  skeletonCard: {
    padding: 16,
    marginBottom: 12,
  },
  skeletonContent: {
    gap: 10,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
  },
  skeletonTitle: {
    width: "60%",
    height: 18,
  },
  skeletonPreview: {
    width: "100%",
  },
  skeletonMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  skeletonTime: {
    width: "30%",
    height: 12,
  },
  skeletonBadge: {
    width: "20%",
    height: 12,
  },
});
