/**
 * GlassChatList - Enhanced Chat List with Glass UI
 *
 * Reimplemented chat list using Evan Bacon's glass UI components,
 * providing a more sophisticated and visually appealing interface.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support + Evan Bacon Glass UI)
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
import { useTranslation } from "../../i18n";
import { useImessagePalette } from "../../ui/theme/imessagePalette";

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
}

// ==================================================================================
// GLASS CHAT ITEM COMPONENT
// ==================================================================================

const GlassChatItem: React.FC<ChatItemProps> = ({
  chat,
  onPress,
  onDelete,
  onShare,
}) => {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const palette = useImessagePalette();
  const actionSheet = useGlassBottomSheet();
  const [isPressed, setIsPressed] = React.useState(false);

  const isDark = colorScheme === "dark";
  const lastMessage = chat.messages[chat.messages.length - 1];
  const messageCount = chat.messages.length;
  const timeAgo = formatDistanceToNow(chat.createdAt, { addSuffix: true });
  const messageBadgeLabel =
    messageCount === 1
      ? t("screen.glassChatList.badges.messageSingular", {
          count: messageCount,
        })
      : t("screen.glassChatList.badges.messagePlural", {
          count: messageCount,
        });

  const handleLongPress = React.useCallback(() => {
    // Haptic feedback
    if (Platform.OS === "ios") {
      console.log("🔸 Haptic: Chat long press feedback");
    }
    actionSheet.show();
  }, [actionSheet]);

  // iOS 26 HIG: Chat list items are CONTENT, not controls
  // Use solid backgrounds (standard materials), NOT Liquid Glass
  // Real iMessage uses solid backgrounds for chat list items
  const ChatContent = (
    <View
      style={[
        styles.chatItemContainer,
        { backgroundColor: palette.surface },
        isPressed && { backgroundColor: palette.highlighted },
      ]}
    >
      <View style={styles.chatItemContent}>
        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <Text
            style={[
              styles.chatTitle,
              { color: palette.textPrimary },
            ]}
          >
            {chat.title}
          </Text>

          {lastMessage && (
            <Text
              style={[
                styles.chatPreview,
                { color: palette.textSecondary },
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
                { color: palette.textTertiary },
              ]}
            >
              {timeAgo}
            </Text>

            <View style={styles.chatBadges}>
              {messageCount > 0 && (
                <View
                  style={[
                    styles.messageBadge,
                    { backgroundColor: "rgba(0, 122, 255, 0.15)" },
                  ]}
                >
                  <Text style={[styles.messageBadgeText, { color: "#007AFF" }]}>
                    {messageBadgeLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.chatActions}>
          <Text
            style={[styles.chevron, { color: palette.textTertiary }]}
          >
            ›
          </Text>
        </View>
      </View>
    </View>
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
      >
        {ChatContent}
      </TouchableOpacity>

      {/* Chat Action Sheet */}
      <GlassActionSheet
        visible={actionSheet.visible}
        onClose={actionSheet.hide}
        title={chat.title}
        message={t("screen.glassChatList.actionSheet.message")}
        actions={[
          {
            title: t("screen.glassChatList.actionSheet.openChat"),
            onPress: onPress,
            icon: <Text>💬</Text>,
          },
          ...(onShare
            ? [
                {
                  title: t("screen.glassChatList.actionSheet.shareChat"),
                  onPress: onShare,
                  icon: <Text>📤</Text>,
                },
              ]
            : []),
          {
            title: t("screen.glassChatList.actionSheet.deleteChat"),
            onPress: onDelete,
            style: "destructive" as const,
            icon: <TrashIcon size={20} color="#FF453A" />,
          },
          {
            title: t("screen.glassChatList.actionSheet.cancel"),
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
  const palette = useImessagePalette();
  const {
    chats,
    createChat,
    deleteChat,
    setCurrentChat,
    loadChats,
    isLoading,
  } = useChat();
  const { t } = useTranslation();

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
        t("screen.glassChatList.alerts.deleteTitle"),
        t("screen.glassChatList.alerts.deleteMessage", { title: chatTitle }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("screen.glassChatList.actionSheet.deleteChat"),
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
    [deleteChat, t],
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

  const recentFooter = chats.length === 1
    ? t("screen.glassChatList.recent.footerSingle", { count: chats.length })
    : t("screen.glassChatList.recent.footerMultiple", { count: chats.length });

  return (
    <Form.List
      navigationTitle={t("screen.glassChatList.navigationTitle")}
      style={styles.container}
    >
      {/* New Chat Section */}
      <Form.Section
        title={t("screen.glassChatList.newConversation.title")}
      >
        <Form.Item
          title={t("screen.glassChatList.newConversation.button")}
          subtitle={t("screen.glassChatList.newConversation.description")}
          rightContent={
            <LiquidGlassWrapper
              variant="interactive"
              shape="capsule"
              style={styles.newChatBadge}
              accessibilityLabel={t(
                "screen.glassChatList.newConversation.button",
              )}
              accessibilityRole="button"
              accessibilityHint={t(
                "screen.glassChatList.newConversation.description",
              )}
            >
              <PlusIcon size={20} />
            </LiquidGlassWrapper>
          }
          onPress={handleNewChat}
          showChevron
        />
      </Form.Section>

      {/* Recent Chats Section */}
      {chats.length > 0 ? (
        <Form.Section
          title={t("screen.glassChatList.recent.title")}
          footer={recentFooter}
        >
          <View style={styles.chatsList}>
            {chats.map((chat) => (
              <GlassChatItem
                key={chat.id}
                chat={chat}
                onPress={() => handleChatPress(chat)}
                onDelete={() => handleDeleteChat(chat.id, chat.title)}
                onShare={() => handleShareChat(chat)}
              />
            ))}
          </View>
        </Form.Section>
      ) : (
        <Form.Section>
          {/* iOS 26 HIG: Empty state is CONTENT, not a control
              Use solid background, NOT Liquid Glass */}
          <View
            style={[
              styles.emptyStateContainer,
              { backgroundColor: palette.surface },
            ]}
          >
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: palette.textPrimary },
                ]}
              >
                {t("screen.glassChatList.empty.title")}
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: palette.textSecondary },
                ]}
              >
                {t("screen.glassChatList.empty.subtitle")}
              </Text>
            </View>
          </View>
        </Form.Section>
      )}

      {/* Statistics Section */}
      {chats.length > 0 && (
        <Form.Section title={t("screen.glassChatList.stats.title")}>
          <Form.Item
            title={t("screen.glassChatList.stats.totalMessagesTitle")}
            subtitle={t("screen.glassChatList.stats.totalMessagesSubtitle")}
            rightContent={
              <Text style={[styles.statValue, { color: palette.accentPrimary }]}>
                {chats.reduce((total, chat) => total + chat.messages.length, 0)}
              </Text>
            }
          />
          <Form.Item
            title={t("screen.glassChatList.stats.averageTitle")}
            subtitle={t("screen.glassChatList.stats.averageSubtitle")}
            rightContent={
              <Text style={[styles.statValue, { color: palette.accentPrimary }]}>
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
    // iOS 26 HIG: Minimum 44pt touch target
    // 20px icon + 12px padding all sides = 44×44px total
    padding: 12,
    // No backgroundColor - LiquidGlassWrapper provides glass effect
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
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    // iOS 26 HIG: Use iOS standard materials (shadows) for depth, not glass
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Android: Material Design elevation
    elevation: 2,
  },
  chatItemPressed: {
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
    borderRadius: 999, // Fully rounded capsule
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
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 12,
    // iOS shadows for depth
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
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
    // Color will be applied inline using palette.accentPrimary
  },
});
