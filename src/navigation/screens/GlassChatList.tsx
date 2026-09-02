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
import { StyleSheet, Text, View, Platform } from "react-native";
import type { AccessibilityActionEvent } from "react-native";
import Animated from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useChat } from "../../context/ChatContext";
import { Form } from "../../components/glass/GlassForm";
import {
  GlassActionSheet,
  useGlassBottomSheet,
} from "../../components/glass/GlassBottomSheet";
import { PressableRipple } from "../../components/PressableRipple";
import { TrashIcon } from "../../components/icons/TrashIcon";
import { PlusIcon } from "../../components/icons/PlusIcon";
import { ChevronIcon } from "../../components/icons/ChevronIcon";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "../../i18n";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useTypography } from "../../ui/hooks/useTypography";
import { HapticFeedback } from "../../utils/haptics";
import { devWarn } from "../../utils/devLog";
import { getDateFnsLocale } from "../../utils/dateLocale";
import { useScreenEntrance } from "../../ui/hooks/useScreenEntrance";
import {
  useStaggeredListValues,
  AnimatedListItem,
} from "../../ui/hooks/useStaggeredList";
import { ChatListSkeleton } from "../../components/skeletons";
import { EmptyState } from "../../components/EmptyState";
import { ShareService } from "../../services/ShareService";
import { useSettings } from "../../context/SettingsContext";
import type { Chat } from "../../types/chat";
import { Toast } from "../../components/ui/Toast";
import { appAlert } from "../../utils/appAlert";

// ==================================================================================
// CONSTANTS
// ==================================================================================

/**
 * Title persisted for a chat the user has not named. StorageService and the
 * auto-title logic both match on this exact English string, so it is a storage
 * sentinel rather than display copy — it must be translated at render time.
 */
const UNTITLED_CHAT_SENTINEL = "New Chat";

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
  const { t } = useTranslation();
  const palette = useImessagePalette();
  const typography = useTypography();
  const { locale } = useSettings();

  const lastMessage = chat.messages[chat.messages.length - 1];
  const messageCount = chat.messages.length;
  // Untitled chats are persisted with the English sentinel "New Chat" (storage
  // and title-generation both match on it), so translate at render time rather
  // than showing a pt-BR user an English title.
  const displayTitle =
    chat.title === UNTITLED_CHAT_SENTINEL
      ? t("screen.glassChatList.untitledChat")
      : chat.title;
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
      title: displayTitle,
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
      ? [
          {
            name: "share",
            label: t("screen.glassChatList.actionSheet.shareChat"),
          },
        ]
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
  const itemBackgroundColor = palette.backgroundSecondary;
  const renderChatContent = (pressed: boolean) => (
    <View
      style={[
        styles.chatItemContainer,
        { backgroundColor: itemBackgroundColor },
        pressed &&
          Platform.OS === "ios" && { backgroundColor: palette.highlight },
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
            {displayTitle}
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
                { color: palette.textSecondary },
              ]}
            >
              {timeAgo}
            </Text>

            <View style={styles.chatBadges}>
              {messageCount > 0 && (
                <View
                  style={[
                    styles.messageBadge,
                    { backgroundColor: palette.assistantBubble },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageBadgeText,
                      { color: palette.textPrimary },
                    ]}
                  >
                    {messageBadgeLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Disclosure indicator */}
        <View style={styles.chatActions}>
          <ChevronIcon size={16} color={palette.textTertiary} />
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
      accessibilityRole="button"
      accessibilityLabel={itemAccessibilityLabel}
      accessibilityHint={t("screen.glassChatList.itemAccessibilityHint")}
      accessibilityActions={chatAccessibilityActions}
      onAccessibilityAction={handleAccessibilityAction}
    >
      {({ pressed }) => renderChatContent(pressed)}
    </PressableRipple>
  );
};

function NewConversationSection({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const palette = useImessagePalette();
  const typography = useTypography();

  return (
    <View style={styles.signalHero}>
      <View
        style={styles.signalPath}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View
          style={[styles.signalNode, { backgroundColor: palette.userBubble }]}
        />
        <View
          style={[styles.signalLine, { backgroundColor: palette.border }]}
        />
        <View
          style={[
            styles.signalNode,
            styles.signalNodeOutline,
            { borderColor: palette.userBubble },
          ]}
        />
        <View
          style={[styles.signalLine, { backgroundColor: palette.border }]}
        />
        <View
          style={[styles.signalNode, { backgroundColor: palette.success }]}
        />
      </View>
      <Text
        style={[
          typography.title2,
          styles.signalTitle,
          { color: palette.textPrimary },
        ]}
      >
        {t("screen.glassChatList.newConversation.title")}
      </Text>
      <Text
        style={[
          styles.signalDescription,
          typography.subheadline,
          { color: palette.textSecondary },
        ]}
      >
        {t("screen.glassChatList.newConversation.description")}
      </Text>
      <Text
        style={[
          styles.observableNotice,
          typography.footnote,
          { color: palette.textPrimary },
        ]}
      >
        {t("screen.glassChatList.newConversation.observableNotice")}
      </Text>
      <View style={styles.primaryComposeButton}>
        <PressableRipple
          testID="chat-list-new-chat"
          variant="primary"
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={t("screen.glassChatList.newConversation.button")}
          accessibilityHint={t(
            "screen.glassChatList.newConversation.description",
          )}
        >
          <View
            style={[
              styles.primaryComposeContent,
              { backgroundColor: palette.userBubble },
            ]}
          >
            <PlusIcon size={18} color={palette.textOnChroma} />
            <Text
              style={[
                styles.primaryComposeLabel,
                { color: palette.textOnChroma },
              ]}
            >
              {t("screen.glassChatList.newConversation.button")}
            </Text>
          </View>
        </PressableRipple>
      </View>
    </View>
  );
}

interface RecentChatsSectionProps {
  chats: Chat[];
  showSkeleton: boolean;
  opacities: SharedValue<number>[];
  translates: SharedValue<number>[];
  onPress: (chat: Chat) => void;
  onDelete: (chat: Chat) => void;
  onShare: (chat: Chat) => void;
  onShowActions: (chat: Chat) => void;
}

function RecentChatsSection({
  chats,
  showSkeleton,
  opacities,
  translates,
  onPress,
  onDelete,
  onShare,
  onShowActions,
}: RecentChatsSectionProps) {
  const { t } = useTranslation();
  const palette = useImessagePalette();
  const recentFooter =
    chats.length === 1
      ? t("screen.glassChatList.recent.footerSingle", { count: chats.length })
      : t("screen.glassChatList.recent.footerMultiple", {
          count: chats.length,
        });

  if (showSkeleton) {
    return (
      <Form.Section title={t("screen.glassChatList.recent.title")}>
        <ChatListSkeleton count={5} />
      </Form.Section>
    );
  }

  if (chats.length === 0) {
    return (
      <Form.Section>
        <EmptyState
          title={t("screen.glassChatList.empty.title")}
          description={t("screen.glassChatList.empty.subtitle")}
          iconType="chat"
          testID="chat-list-empty-state"
        />
      </Form.Section>
    );
  }

  return (
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
            style={{
              borderBottomWidth:
                index < chats.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: palette.separator,
            }}
          >
            <GlassChatItem
              chat={chat}
              onPress={() => onPress(chat)}
              onDelete={() => onDelete(chat)}
              onShare={() => onShare(chat)}
              onShowActions={() => onShowActions(chat)}
            />
          </AnimatedListItem>
        ))}
      </View>
    </Form.Section>
  );
}

// ==================================================================================
// MAIN GLASS CHAT LIST COMPONENT
// ==================================================================================

export function GlassChatList() {
  const { push } = useRouter();
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
  const [dismissedError, setDismissedError] = React.useState<string | null>(
    null,
  );
  const visibleError = error && error !== dismissedError ? error : null;

  // Guards against a double-fired "New chat" (the toolbar button and the empty
  // state both call handleNewChat). A ref, not state: it never affects render.
  const isCreatingChatRef = React.useRef(false);

  // Effect: load chat list on first mount and mark first load completion.
  // loadChats surfaces its own failures through the context error (visibleError
  // toast); the .finally still marks hasLoadedOnce so the skeleton always yields
  // to the empty/error state even if loadChats ever begins to reject.
  /* oxlint-disable react-hooks/exhaustive-deps -- Intentional mount-only load; ChatContext functions change identity as provider state changes. */
  React.useEffect(() => {
    let isMounted = true;
    loadChats()
      .catch((loadError) => {
        devWarn("[GlassChatList] Failed to load chats", loadError);
      })
      .finally(() => {
        if (isMounted && !hasLoadedOnce) {
          setHasLoadedOnce(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);
  /* oxlint-enable react-hooks/exhaustive-deps */

  const handleDismissError = () => {
    setDismissedError(error);
    clearError();
  };

  const [refreshing, setRefreshing] = React.useState(false);
  const showSkeleton = isLoading && !hasLoadedOnce && chats.length === 0;

  const handleNewChat = async () => {
    if (isCreatingChatRef.current) {
      return;
    }
    isCreatingChatRef.current = true;
    // Re-arm the toast so a recurring identical error re-notifies after dismissal.
    setDismissedError(null);
    try {
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
    } catch (err) {
      // createChat already sets the context error, which surfaces through the
      // dismissable toast (visibleError). Swallow the rethrow here so it does
      // not become an unhandled rejection.
      devWarn("[GlassChatList] Failed to create chat", err);
    }
    isCreatingChatRef.current = false;
  };

  const handleChatPress = (chat: Chat) => {
    setCurrentChat(chat);
    push({
      pathname: "/chat/[threadId]",
      params: { threadId: chat.id },
    });
  };

  const handleDeleteChat = (chatId: string, chatTitle: string) => {
    appAlert(
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
    // Re-arm the toast so a recurring identical error re-notifies after dismissal.
    setDismissedError(null);
    await loadChats()
      .catch((refreshError) => {
        devWarn("[GlassChatList] Failed to refresh chats", refreshError);
      })
      .finally(() => setRefreshing(false));
  };

  const handleShareChat = async (chat: Chat) => {
    await ShareService.shareConversation(
      chat.messages.map((message) => message.content),
      locale,
    );
  };

  return (
    <>
      <Form.List
        testID="chat-list"
        navigationTitle={t("screen.glassChatList.navigationTitle")}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <Animated.View style={animatedStyle}>
          <NewConversationSection onPress={handleNewChat} />
          <RecentChatsSection
            chats={chats}
            showSkeleton={showSkeleton}
            opacities={opacities}
            translates={translates}
            onPress={handleChatPress}
            onDelete={(chat) => handleDeleteChat(chat.id, chat.title)}
            onShare={handleShareChat}
            onShowActions={handleShowChatActions}
          />
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
  signalHero: {
    marginHorizontal: 20,
    marginBottom: 28,
    paddingTop: 8,
  },
  signalPath: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    marginBottom: 18,
  },
  signalNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  signalNodeOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  signalLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  signalTitle: {
    fontWeight: "600",
  },
  signalDescription: {
    marginTop: 6,
    maxWidth: 440,
  },
  observableNotice: {
    marginTop: 8,
    maxWidth: 440,
  },
  primaryComposeButton: {
    marginTop: 18,
    borderRadius: 14,
    overflow: "hidden",
  },
  primaryComposeContent: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryComposeLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
  newChatIcon: {
    fontSize: 16,
  },
  chatsList: {
    gap: 0,
  },
  chatItemWrapper: {
    paddingHorizontal: 0,
  },
  chatItemContainer: {
    padding: 16,
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
});
