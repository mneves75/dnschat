/**
 * GlassChatList - Enhanced Chat List with Glass UI
 *
 * Reimplemented chat list using Evan Bacon's glass UI components,
 * providing a more sophisticated and visually appealing interface.
 *
 * Features:
 * - Skeleton loading states
 * - Screen entrance animations
 * - Staggered list item animations
 * - Proper empty state with EmptyState component
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support + Evan Bacon Glass UI)
 * @see IOS-GUIDELINES.md - iOS 26 Liquid Glass patterns
 * @see DESIGN-UI-UX-GUIDELINES.md - Loading and empty states
 */

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  useColorScheme,
  Platform,
  TouchableOpacity,
} from "react-native";
import Animated from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
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
import { devLog } from "../../utils/devLog";
import { useScreenEntrance } from "../../ui/hooks/useScreenEntrance";
import { useStaggeredListValues, AnimatedListItem } from "../../ui/hooks/useStaggeredList";
import { ChatListSkeleton } from "../../components/skeletons";
import { EmptyState } from "../../components/EmptyState";
import type { Chat } from "../../types/chat";

// ==================================================================================
// TYPES
// ==================================================================================

interface ChatItemProps {
  chat: Chat;
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

  const handleLongPress = () => {
    // Haptic feedback
    if (Platform.OS === "ios") {
    }
    actionSheet.show();
  };

  // iOS 26 HIG: Chat list items are CONTENT, not controls
  // Use solid backgrounds (standard materials), NOT Liquid Glass
  // Real iMessage uses solid backgrounds for chat list items
  // Android: Use solid color (palette.solid) since rgba appears gray without blur
  const itemBackgroundColor = Platform.OS === "android" ? palette.solid : palette.surface;
  const ChatContent = (
    <View
      style={[
        styles.chatItemContainer,
        { backgroundColor: itemBackgroundColor },
        isPressed && { backgroundColor: palette.highlight },
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
                    { backgroundColor: `${palette.userBubble}26` }, // 15% opacity
                  ]}
                >
                  <Text style={[styles.messageBadgeText, { color: palette.userBubble }]}>
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
          },
          ...(onShare
            ? [
                {
                  title: t("screen.glassChatList.actionSheet.shareChat"),
                  onPress: onShare,
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
  const router = useRouter();
  const colorScheme = useColorScheme();
  const palette = useImessagePalette();
  const {
    chats,
    createChat,
    deleteChat,
    setCurrentChat,
    loadChats,
    isLoading,
    error,
    clearError,
  } = useChat();
  const { t } = useTranslation();
  const { animatedStyle } = useScreenEntrance();
  const { opacities, translates } = useStaggeredListValues(chats.length);
  const isFocused = useIsFocused();

  // Track initial load for skeleton display
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);

  // Load chats when screen is focused (CRITICAL FIX)
  // Effect: refresh chat list on focus and mark first load.
  React.useEffect(() => {
    if (!isFocused) return;
    loadChats().then(() => {
      if (!hasLoadedOnce) {
        setHasLoadedOnce(true);
      }
    });
  }, [hasLoadedOnce, isFocused]);

  // Effect: surface chat load errors via alert.
  React.useEffect(() => {
    if (!error) return;
    Alert.alert(t("screen.chat.errorAlertTitle"), error, [
      {
        text: t("screen.chat.errorAlertDismiss"),
        onPress: clearError,
      },
    ]);
  }, [error, t]);

  const isDark = colorScheme === "dark";
  const [refreshing, setRefreshing] = React.useState(false);
  const showSkeleton = isLoading && !hasLoadedOnce && chats.length === 0;

  const handleNewChat = async () => {
    const newChat = await createChat();
    setCurrentChat(newChat);
    router.push({
      pathname: "/chat/[threadId]",
      params: { threadId: newChat.id },
    });

    // Haptic feedback
    if (Platform.OS === "ios") {
    }
  };

  const handleChatPress = (chat: Chat) => {
    setCurrentChat(chat);
    router.push({
      pathname: "/chat/[threadId]",
      params: { threadId: chat.id },
    });
  };

  const handleDeleteChat = (chatId: string, chatTitle: string) => {
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
            // Intentionally no-op here: haptics are handled at the component level.
          },
        },
      ],
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadChats();
    } finally {
      setRefreshing(false);
    }
  };

  const handleShareChat = (chat: Chat) => {
    // Share functionality would go here
    devLog("Sharing chat", { chatId: chat?.id });
  };

  const recentFooter = chats.length === 1
    ? t("screen.glassChatList.recent.footerSingle", { count: chats.length })
    : t("screen.glassChatList.recent.footerMultiple", { count: chats.length });

  return (
    <Form.List
      testID="chat-list"
      navigationTitle={t("screen.glassChatList.navigationTitle")}
      style={styles.container}
    >
      <Animated.View style={animatedStyle}>
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

        {/* Loading Skeleton */}
        {showSkeleton && (
          <Form.Section
            title={t("screen.glassChatList.recent.title")}
          >
            <ChatListSkeleton count={5} />
          </Form.Section>
        )}

        {/* Recent Chats Section */}
        {!showSkeleton && chats.length > 0 ? (
          <Form.Section
            title={t("screen.glassChatList.recent.title")}
            footer={recentFooter}
          >
            <View style={styles.chatsList}>
              {chats.map((chat, index) => (
                <AnimatedListItem
                  key={chat.id}
                  opacity={opacities[index] ?? { value: 1 }}
                  translateX={translates[index] ?? { value: 0 }}
                >
                  <GlassChatItem
                    chat={chat}
                    onPress={() => handleChatPress(chat)}
                    onDelete={() => handleDeleteChat(chat.id, chat.title)}
                    onShare={() => handleShareChat(chat)}
                  />
                </AnimatedListItem>
              ))}
            </View>
          </Form.Section>
        ) : !showSkeleton && chats.length === 0 ? (
          <Form.Section>
            <EmptyState
              title={t("screen.glassChatList.empty.title")}
              description={t("screen.glassChatList.empty.subtitle")}
              iconType="chat"
              actionLabel={t("screen.glassChatList.newConversation.button")}
              onAction={handleNewChat}
              testID="chat-list-empty-state"
            />
          </Form.Section>
        ) : null}

        {/* Statistics Section */}
        {chats.length > 0 && (
          <Form.Section title={t("screen.glassChatList.stats.title")}>
            <Form.Item
              title={t("screen.glassChatList.stats.totalMessagesTitle")}
              subtitle={t("screen.glassChatList.stats.totalMessagesSubtitle")}
              rightContent={
                <Text style={[styles.statValue, { color: palette.userBubble }]}>
                  {chats.reduce((total, chat) => total + chat.messages.length, 0)}
                </Text>
              }
            />
            <Form.Item
              title={t("screen.glassChatList.stats.averageTitle")}
              subtitle={t("screen.glassChatList.stats.averageSubtitle")}
              rightContent={
                <Text style={[styles.statValue, { color: palette.userBubble }]}>
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
      </Animated.View>
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
  statValue: {
    fontSize: 17,
    fontWeight: "600",
    // Color will be applied inline using palette.accentPrimary
  },
});
