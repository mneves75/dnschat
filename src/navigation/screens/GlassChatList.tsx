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
} from "react-native";
import type { AccessibilityActionEvent } from "react-native";
import Animated from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useChat } from "../../context/ChatContext";
import { Form } from "../../components/glass/GlassForm";
import { GlassActionSheet, useGlassBottomSheet } from "../../components/glass/GlassBottomSheet";
import { LiquidGlassWrapper } from "../../components/LiquidGlassWrapper";
import { PressableRipple } from "../../components/PressableRipple";
import { TrashIcon } from "../../components/icons/TrashIcon";
import { PlusIcon } from "../../components/icons/PlusIcon";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "../../i18n";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useTypography } from "../../ui/hooks/useTypography";
import { HapticFeedback } from "../../utils/haptics";
import { getDateFnsLocale } from "../../utils/dateLocale";
import { useScreenEntrance } from "../../ui/hooks/useScreenEntrance";
import { useStaggeredListValues, AnimatedListItem } from "../../ui/hooks/useStaggeredList";
import { ChatListSkeleton } from "../../components/skeletons";
import { EmptyState } from "../../components/EmptyState";
import { ShareService } from "../../services/ShareService";
import { useSettings } from "../../context/SettingsContext";
import type { Chat } from "../../types/chat";
import { Toast } from "../../components/ui/Toast";

// ==================================================================================
// TYPES
// ==================================================================================

interface ChatItemProps {
  chat: Chat;
  onPress: () => void;
  onDelete: () => void;
  onShare?: () => void;
  /**
   * Opens the screen-level shared action sheet for this chat. Rows do NOT
   * mount their own GlassActionSheet: one hidden Modal per row (plus its
   * Animated.Values) multiplies startup surface — see the build-47 note in
   * GlassBottomSheet.tsx.
   */
  onShowActions: () => void;
}

// ==================================================================================
// GLASS CHAT ITEM COMPONENT
// ==================================================================================

const GlassChatItem: React.FC<ChatItemProps> = ({
  chat,
  onPress,
  onDelete,
  onShare,
  onShowActions,
}) => {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const palette = useImessagePalette();
  const typography = useTypography();
  const { locale } = useSettings();

  const isDark = colorScheme === "dark";
  const lastMessage = chat.messages[chat.messages.length - 1];
  const messageCount = chat.messages.length;
  const timeAgo = formatDistanceToNow(chat.createdAt, {
    addSuffix: true,
    locale: getDateFnsLocale(locale),
  });
  const messageBadgeLabel =
    messageCount === 1
      ? t("screen.glassChatList.badges.messageSingular", {
          count: messageCount,
        })
      : t("screen.glassChatList.badges.messagePlural", {
          count: messageCount,
        });
  const itemAccessibilityLabel = t(
    "screen.glassChatList.itemAccessibilityLabel",
    {
      title: chat.title,
      count: messageCount,
      time: timeAgo,
    },
  );

  const handleLongPress = () => {
    // Haptic feedback
    if (Platform.OS === "ios") {
      HapticFeedback.medium();
    }
    onShowActions();
  };
  const chatAccessibilityActions = [
    { name: "activate", label: t("screen.glassChatList.actionSheet.openChat") },
    ...(onShare
      ? [{ name: "share", label: t("screen.glassChatList.actionSheet.shareChat") }]
      : []),
    { name: "delete", label: t("screen.glassChatList.actionSheet.deleteChat") },
  ];
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    switch (event.nativeEvent.actionName) {
      case "activate":
        onPress();
        break;
      case "share":
        onShare?.();
        break;
      case "delete":
        onDelete();
        break;
      default:
        handleLongPress();
        break;
    }
  };

  // iOS 26 HIG: Chat list items are CONTENT, not controls
  // Use solid backgrounds (standard materials), NOT Liquid Glass
  // Real iMessage uses solid backgrounds for chat list items
  // Android: Use solid color (palette.solid) since rgba appears gray without blur
  const itemBackgroundColor = Platform.OS === "android" ? palette.solid : palette.surface;
  const renderChatContent = (pressed: boolean) => (
    <View
      style={[
        styles.chatItemContainer,
        { backgroundColor: itemBackgroundColor },
        pressed && Platform.OS === "ios" && { backgroundColor: palette.highlight },
      ]}
    >
      <View style={styles.chatItemContent}>
        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <Text
            style={[
              styles.chatTitle,
              typography.headline,
              { color: palette.textPrimary },
            ]}
          >
            {chat.title}
          </Text>

          {lastMessage && (
            <Text
              style={[
                styles.chatPreview,
                typography.subheadline,
                { color: palette.textSecondary },
              ]}
            >
              {lastMessage.content.length > 60
                ? `${lastMessage.content.substring(0, 60)}…`
                : lastMessage.content}
            </Text>
          )}

          <View style={styles.chatMeta}>
            <Text
              style={[
                styles.chatTime,
                typography.caption1,
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
    <PressableRipple
      testID={`chat-list-item-${chat.id}`}
      onPress={onPress}
      onLongPress={handleLongPress}
      variant="surface"
      rippleColor={palette.highlight}
      pressedOpacity={0.95}
      style={styles.chatItemWrapper}
      accessible
      accessibilityRole="link"
      accessibilityLabel={itemAccessibilityLabel}
      accessibilityHint={t("screen.glassChatList.itemAccessibilityHint")}
      accessibilityActions={chatAccessibilityActions}
      onAccessibilityAction={handleAccessibilityAction}
    >
      {({ pressed }) => renderChatContent(pressed)}
    </PressableRipple>
  );
};

// ==================================================================================
// MAIN GLASS CHAT LIST COMPONENT
// ==================================================================================

export function GlassChatList() {
  const { push } = useRouter();
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
  const { locale } = useSettings();
  const { animatedStyle } = useScreenEntrance();
  const { opacities, translates } = useStaggeredListValues(chats.length);

  // Track initial load for skeleton display
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);

  // ONE shared action sheet for the whole list, keyed by the selected chat.
  // Per-row GlassActionSheet instances each mount a hidden <Modal> plus three
  // Animated.Values (50 chats -> 50 hidden Modals) and were implicated in the
  // build-47 startup crash surface (see GlassBottomSheet.tsx header).
  // `selectedChat` is kept after hide so the title stays rendered during the
  // close animation.
  const chatActionSheet = useGlassBottomSheet();
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);

  const handleShowChatActions = (chat: Chat) => {
    setSelectedChat(chat);
    chatActionSheet.show();
  };

  // Surface the latest context error as a dismissable toast. Derived purely from
  // state (no effect, no setState-in-render): once dismissed, the same error stays
  // hidden until a different one arrives.
  const [dismissedError, setDismissedError] = React.useState<string | null>(null);
  const visibleError = error && error !== dismissedError ? error : null;

  // Effect: load chat list on first mount and mark first load completion.
  React.useEffect(() => {
    let isMounted = true;
    loadChats().then(() => {
      if (isMounted && !hasLoadedOnce) {
        setHasLoadedOnce(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDismissError = () => {
    setDismissedError(error);
    clearError();
  };

  const isDark = colorScheme === "dark";
  const [refreshing, setRefreshing] = React.useState(false);
  const showSkeleton = isLoading && !hasLoadedOnce && chats.length === 0;

  const handleNewChat = async () => {
    const newChat = await createChat();
    setCurrentChat(newChat);
    push({
      pathname: "/chat/[threadId]",
      params: { threadId: newChat.id },
    });

    // Haptic feedback
    if (Platform.OS === "ios") {
      HapticFeedback.medium();
    }
  };

  const handleChatPress = (chat: Chat) => {
    setCurrentChat(chat);
    push({
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
    await loadChats().finally(() => setRefreshing(false));
  };

  const handleShareChat = async (chat: Chat) => {
    await ShareService.shareConversation(
      chat.messages.map((message) => message.content),
      locale,
    );
  };

  const recentFooter = chats.length === 1
    ? t("screen.glassChatList.recent.footerSingle", { count: chats.length })
    : t("screen.glassChatList.recent.footerMultiple", { count: chats.length });

  return (
    <>
      <Form.List
        testID="chat-list"
        navigationTitle={t("screen.glassChatList.navigationTitle")}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
      <Animated.View style={animatedStyle}>
        {/* New Chat Section */}
        <Form.Section
          title={t("screen.glassChatList.newConversation.title")}
        >
          <Form.Item
            testID="chat-list-new-chat"
            title={t("screen.glassChatList.newConversation.button")}
            subtitle={t("screen.glassChatList.newConversation.description")}
            accessibilityLabel={t("screen.glassChatList.newConversation.button")}
            accessibilityHint={t("screen.glassChatList.newConversation.description")}
            rightContent={
              <LiquidGlassWrapper
                variant="interactive"
                shape="capsule"
                style={styles.newChatBadge}
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
                  opacity={opacities[index]}
                  translateX={translates[index]}
                >
                  <GlassChatItem
                    chat={chat}
                    onPress={() => handleChatPress(chat)}
                    onDelete={() => handleDeleteChat(chat.id, chat.title)}
                    onShare={() => handleShareChat(chat)}
                    onShowActions={() => handleShowChatActions(chat)}
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
              testID="chat-list-total-messages"
              title={t("screen.glassChatList.stats.totalMessagesTitle")}
              subtitle={t("screen.glassChatList.stats.totalMessagesSubtitle")}
              rightContent={
                <Text style={[styles.statValue, { color: palette.userBubble }]}>
                  {chats.reduce((total, chat) => total + chat.messages.length, 0)}
                </Text>
              }
            />
            <Form.Item
              testID="chat-list-average-messages"
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
      {/* Shared Chat Action Sheet (one instance for every row) */}
      <GlassActionSheet
        visible={chatActionSheet.visible}
        onClose={chatActionSheet.hide}
        title={selectedChat?.title ?? ""}
        message={t("screen.glassChatList.actionSheet.message")}
        actions={
          selectedChat
            ? [
                {
                  title: t("screen.glassChatList.actionSheet.openChat"),
                  onPress: () => handleChatPress(selectedChat),
                },
                {
                  title: t("screen.glassChatList.actionSheet.shareChat"),
                  onPress: () => handleShareChat(selectedChat),
                },
                {
                  title: t("screen.glassChatList.actionSheet.deleteChat"),
                  onPress: () =>
                    handleDeleteChat(selectedChat.id, selectedChat.title),
                  style: "destructive" as const,
                  icon: <TrashIcon size={20} color="#FF453A" />,
                },
                {
                  title: t("screen.glassChatList.actionSheet.cancel"),
                  onPress: () => {},
                  style: "cancel" as const,
                },
              ]
            : []
        }
      />
      <Toast
        visible={Boolean(visibleError)}
        variant="error"
        title={t("screen.chat.errorAlertTitle")}
        message={visibleError ?? ""}
        duration={6000}
        onDismiss={handleDismissError}
        testID="chat-list-error-toast"
      />
    </>
  );
}

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
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
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.08)" }
      : {
          shadowColor: "#111827",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 2,
        }),
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
    marginBottom: 4,
    // fontSize/fontWeight applied inline via typography.headline
  },
  chatPreview: {
    marginBottom: 8,
    // fontSize/fontWeight/lineHeight applied inline via typography.subheadline
  },
  chatMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatTime: {
    // fontSize/fontWeight applied inline via typography.caption1
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
