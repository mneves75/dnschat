/**
 * GlassChatList - Enhanced Chat List with Glass UI
 *
 * Reimplemented chat list using Evan Bacon's glass UI components,
 * providing a more sophisticated and visually appealing interface.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 17 Liquid Glass Support + Evan Bacon Glass UI)
 */

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  RefreshControl,
  useColorScheme,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useChat } from "../../context/ChatContext";
import {
  Form,
  GlassActionSheet,
  useGlassBottomSheet,
  LiquidGlassWrapper,
} from "../../components/glass";
import { TrashIcon } from "../../components/icons/TrashIcon";
import { PlusIcon } from "../../components/icons/PlusIcon";
import { formatDistanceToNow } from "date-fns";

// ==================================================================================
// TYPES
// ==================================================================================

interface ChatItemProps {
  chat: {
    id: string;
    title: string;
    createdAt: Date;
    messages: any[];
  };
  onPress: () => void;
  onDelete: () => void;
  onShare?: () => void;
  testID?: string;
}

// ==================================================================================
// GLASS CHAT ITEM COMPONENT
// ==================================================================================

const GlassChatItem: React.FC<ChatItemProps> = ({
  chat,
  onPress,
  onDelete,
  onShare,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const actionSheet = useGlassBottomSheet();
  const [isPressed, setIsPressed] = React.useState(false);

  const isDark = colorScheme === "dark";
  const lastMessage = chat.messages[chat.messages.length - 1];
  const messageCount = chat.messages.length;
  const timeAgo = formatDistanceToNow(chat.createdAt, { addSuffix: true });

  const handleLongPress = React.useCallback(() => {
    // Haptic feedback
    if (Platform.OS === "ios") {
      console.log("🔸 Haptic: Chat long press feedback");
    }
    actionSheet.show();
  }, [actionSheet]);

  const ChatContent = (
    <LiquidGlassWrapper
      variant={isPressed ? "interactive" : "regular"}
      shape="roundedRect"
      cornerRadius={12}
      isInteractive={true}
      style={[styles.chatItemContainer, isPressed && styles.chatItemPressed]}
    >
      <View style={styles.chatItemContent}>
        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <Text
            style={[
              styles.chatTitle,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            {chat.title}
          </Text>

          {lastMessage && (
            <Text
              style={[
                styles.chatPreview,
                { color: isDark ? "#AEAEB2" : "#6D6D70" },
              ]}
            >
              {lastMessage.content.length > 60
                ? `${lastMessage.content.substring(0, 60)}...`
                : lastMessage.content}
            </Text>
          )}

          <View style={styles.chatMeta}>
            <Text
              style={[
                styles.chatTime,
                { color: isDark ? "#8E8E93" : "#8E8E93" },
              ]}
            >
              {timeAgo}
            </Text>

            <View style={styles.chatBadges}>
              {messageCount > 0 && (
                <LiquidGlassWrapper
                  variant="interactive"
                  shape="capsule"
                  style={[
                    styles.messageBadge,
                    { backgroundColor: "rgba(0, 122, 255, 0.15)" },
                  ]}
                >
                  <Text style={[styles.messageBadgeText, { color: "#007AFF" }]}>
                    {messageCount} {messageCount === 1 ? "message" : "messages"}
                  </Text>
                </LiquidGlassWrapper>
              )}
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.chatActions}>
          <Text
            style={[styles.chevron, { color: isDark ? "#8E8E93" : "#8E8E93" }]}
          >
            ›
          </Text>
        </View>
      </View>
    </LiquidGlassWrapper>
  );

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={handleLongPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.chatItemWrapper}
        activeOpacity={0.95}
        testID={testID}
      >
        {ChatContent}
      </TouchableOpacity>

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
                  onPress: onShare,
                  icon: <Text>📤</Text>,
                },
              ]
            : []),
          {
            title: "Delete Chat",
            onPress: onDelete,
            style: "destructive" as const,
            icon: <TrashIcon size={20} color="#FF453A" />,
          },
          {
            title: "Cancel",
            onPress: () => {},
            style: "cancel" as const,
          },
        ]}
      />
    </>
  );
};

// ==================================================================================
// MAIN GLASS CHAT LIST COMPONENT
// ==================================================================================

export function GlassChatList() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const {
    chats,
    createChat,
    deleteChat,
    setCurrentChat,
    loadChats,
    isLoading,
  } = useChat();

  // Load chats when screen is focused (CRITICAL FIX)
  useFocusEffect(
    React.useCallback(() => {
      loadChats();
    }, [loadChats]),
  );

  const isDark = colorScheme === "dark";
  const [refreshing, setRefreshing] = React.useState(false);

  const handleNewChat = React.useCallback(() => {
    const newChat = createChat();
    setCurrentChat(newChat);
    navigation.navigate("Chat" as never);

    // Haptic feedback
    if (Platform.OS === "ios") {
      console.log("🔸 Haptic: New chat created");
    }
  }, [createChat, setCurrentChat, navigation]);

  const handleChatPress = React.useCallback(
    (chat: any) => {
      setCurrentChat(chat);
      navigation.navigate("Chat" as never);
    },
    [setCurrentChat, navigation],
  );

  const handleDeleteChat = React.useCallback(
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
              // Haptic feedback
              if (Platform.OS === "ios") {
                console.log("🔸 Haptic: Chat deleted");
              }
            },
          },
        ],
      );
    },
    [deleteChat],
  );

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadChats();
    } finally {
      setRefreshing(false);
    }
  }, [loadChats]);

  const handleShareChat = React.useCallback((chat: any) => {
    // Share functionality would go here
    console.log("Sharing chat:", chat.title);
  }, []);

  return (
    <Form.List navigationTitle="DNS Chat" style={styles.container}>
      {/* New Chat Section */}
      <Form.Section title="Start New Conversation">
        <Form.Item
          title="New Chat"
          subtitle="Start a new conversation with DNS AI"
          rightContent={
            <LiquidGlassWrapper
              variant="interactive"
              shape="capsule"
              style={styles.newChatBadge}
            >
              <PlusIcon size={20} color="#FFFFFF" circleColor="#007AFF" />
            </LiquidGlassWrapper>
          }
          onPress={handleNewChat}
          showChevron
          testID="chat-new"
        />
      </Form.Section>

      {/* Recent Chats Section */}
      {chats.length > 0 ? (
        <Form.Section
          title="Recent Conversations"
          footer={`${chats.length} conversation${chats.length === 1 ? "" : "s"} total`}
        >
          <View style={styles.chatsList}>
            {chats.map((chat) => (
              <GlassChatItem
                key={chat.id}
                chat={chat}
                onPress={() => handleChatPress(chat)}
                onDelete={() => handleDeleteChat(chat.id, chat.title)}
                onShare={() => handleShareChat(chat)}
                testID={`chat-item-${chat.id}`}
              />
            ))}
          </View>
        </Form.Section>
      ) : (
        <Form.Section>
          <LiquidGlassWrapper
            variant="regular"
            shape="roundedRect"
            cornerRadius={12}
            style={styles.emptyStateContainer}
          >
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: isDark ? "#FFFFFF" : "#000000" },
                ]}
              >
                No Conversations Yet
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: isDark ? "#AEAEB2" : "#6D6D70" },
                ]}
              >
                Start your first conversation by tapping "New Chat" above. Your
                chats will appear here.
              </Text>
            </View>
          </LiquidGlassWrapper>
        </Form.Section>
      )}

      {/* Statistics Section */}
      {chats.length > 0 && (
        <Form.Section title="Statistics">
          <Form.Item
            title="Total Messages"
            subtitle={`${chats.reduce((total, chat) => total + chat.messages.length, 0)} messages sent`}
            rightContent={
              <Text style={styles.statValue}>
                {chats.reduce((total, chat) => total + chat.messages.length, 0)}
              </Text>
            }
          />
          <Form.Item
            title="Average per Chat"
            subtitle="Messages per conversation"
            rightContent={
              <Text style={styles.statValue}>
                {Math.round(
                  chats.reduce(
                    (total, chat) => total + chat.messages.length,
                    0,
                  ) / chats.length,
                )}
              </Text>
            }
          />
        </Form.Section>
      )}
    </Form.List>
  );
}

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newChatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 193, 7, 0.15)",
  },
  newChatIcon: {
    fontSize: 16,
  },
  chatsList: {
    gap: 8,
  },
  chatItemWrapper: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  chatItemContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    marginHorizontal: 20,
  },
  chatItemPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ scale: 0.98 }],
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
    paddingVertical: 2,
  },
  messageBadgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  chatActions: {
    marginLeft: 12,
  },
  chevron: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyStateContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 20,
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
  statValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FF6B35", // Notion orange
  },
});
