/**
 * Chat List Screen - Main Tab (Expo Router)
 *
 * This is the main chat list screen, reimagined for Expo Router.
 * It uses the existing GlassChatList implementation but adapted for file-based routing.
 *
 * CRITICAL CHANGES FROM OLD NAVIGATION:
 * - Uses `router` from expo-router instead of `navigation` from @react-navigation
 * - Dynamic routes use file-system paths: `/chat/${id}` instead of navigate("Chat")
 * - useFocusEffect still works (re-exported by expo-router)
 *
 * FUTURE ENHANCEMENTS (Phase 4):
 * - Replace LiquidGlassWrapper with GlassView from expo-glass-effect
 * - Replace custom Form components with new glass design system
 * - Add performance optimizations (limit glass effects to 8 max)
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  useColorScheme,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useChat } from '../../src/context/ChatContext';
import {
  Form,
  GlassActionSheet,
  useGlassBottomSheet,
} from '../../src/components/glass';
import { GlassCard } from '../../src/design-system/glass';
import { useTranslation } from '../../src/i18n';
import { TrashIcon } from '../../src/components/icons/TrashIcon';
import { PlusIcon } from '../../src/components/icons/PlusIcon';
import { formatDistanceToNow } from 'date-fns';

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

/**
 * Individual Chat Item with Glass Effect
 *
 * Uses expo-glass-effect via GlassCard for iOS 26+ liquid glass.
 * PERFORMANCE NOTE: Auto-registered with GlassProvider for element counting.
 */
const GlassChatItem: React.FC<ChatItemProps> = ({
  chat,
  onPress,
  onDelete,
  onShare,
}) => {
  const colorScheme = useColorScheme();
  const actionSheet = useGlassBottomSheet();
  const [isPressed, setIsPressed] = React.useState(false);
  const { t } = useTranslation();

  const isDark = colorScheme === 'dark';
  const lastMessage = chat.messages[chat.messages.length - 1];
  const messageCount = chat.messages.length;
  const timeAgo = formatDistanceToNow(chat.createdAt, { addSuffix: true });

  const handleLongPress = React.useCallback(() => {
    // FUTURE: Add haptic feedback using expo-haptics
    actionSheet.show();
  }, [actionSheet]);

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={handleLongPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.chatItemWrapper}
        activeOpacity={0.95}
        accessibilityRole="button"
        accessibilityLabel={`Chat: ${chat.title}. ${messageCount} messages. Created ${timeAgo}`}
      >
        <GlassCard
          variant={isPressed ? 'interactive' : 'regular'}
          style={[styles.chatItemContainer, isPressed && styles.chatItemPressed]}
        >
          <View style={styles.chatItemContent}>
            <View style={styles.chatInfo}>
              <Text
                style={[
                  styles.chatTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                {chat.title}
              </Text>

              {lastMessage && (
                <Text
                  style={[
                    styles.chatPreview,
                    { color: isDark ? '#AEAEB2' : '#6D6D70' },
                  ]}
                  numberOfLines={2}
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
                    { color: isDark ? '#8E8E93' : '#8E8E93' },
                  ]}
                >
                  {timeAgo}
                </Text>

                <View style={styles.chatBadges}>
                  {messageCount > 0 && (
                    <GlassCard
                      variant="interactive"
                      style={[
                        styles.messageBadge,
                        { backgroundColor: 'rgba(0, 122, 255, 0.15)' },
                      ]}
                    >
                      <Text style={[styles.messageBadgeText, { color: '#007AFF' }]}>
                        {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                      </Text>
                    </GlassCard>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.chatActions}>
              <Text
                style={[styles.chevron, { color: isDark ? '#8E8E93' : '#8E8E93' }]}
              >
                ›
              </Text>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>

      {/* Chat Action Sheet */}
      <GlassActionSheet
        visible={actionSheet.visible}
        onClose={actionSheet.hide}
        title={chat.title}
        message={t('chat.deleteChat')}
        actions={[
          {
            title: t('common.ok'),
            onPress: onPress,
            icon: <Text>💬</Text>,
          },
          ...(onShare
            ? [
                {
                  title: 'Share Chat',
                  onPress: onShare,
                  icon: <Text>📤</Text>,
                },
              ]
            : []),
          {
            title: t('common.delete'),
            onPress: onDelete,
            style: 'destructive' as const,
            icon: <TrashIcon size={20} color="#FF453A" />,
          },
          {
            title: t('common.cancel'),
            onPress: () => {},
            style: 'cancel' as const,
          },
        ]}
      />
    </>
  );
};

// ==================================================================================
// MAIN CHAT LIST SCREEN (DEFAULT EXPORT FOR EXPO ROUTER)
// ==================================================================================

/**
 * Chat List Screen Component
 *
 * CRITICAL: Must be default export for Expo Router file-based routing.
 * This screen is the index route for the (tabs) group: /
 */
export default function ChatListScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const {
    chats,
    createChat,
    deleteChat,
    setCurrentChat,
    loadChats,
    isLoading,
  } = useChat();

  // CRITICAL: Load chats when screen is focused
  // useFocusEffect is re-exported by expo-router for compatibility
  useFocusEffect(
    React.useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  const isDark = colorScheme === 'dark';

  /**
   * Handle New Chat Creation
   *
   * EXPO ROUTER CHANGE: Uses router.push() instead of navigation.navigate()
   * Dynamic routes are file-system paths: /chat/[id]
   */
  const handleNewChat = React.useCallback(async () => {
    try {
      const newChat = await createChat();
      setCurrentChat(newChat);

      // CRITICAL: Expo Router navigation uses file-system paths
      // /chat/[id] maps to app/(tabs)/chat/[id].tsx
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create new chat');
    }
  }, [createChat, setCurrentChat]);

  /**
   * Handle Chat Selection
   *
   * EXPO ROUTER CHANGE: Dynamic route navigation
   */
  const handleChatPress = React.useCallback(
    (chat: any) => {
      setCurrentChat(chat);
      router.push(`/chat/${chat.id}`);
    },
    [setCurrentChat]
  );

  /**
   * Handle Chat Deletion with Confirmation
   */
  const handleDeleteChat = React.useCallback(
    (chatId: string, chatTitle: string) => {
      Alert.alert(
        'Delete Chat',
        `Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteChat(chatId);
            },
          },
        ]
      );
    },
    [deleteChat]
  );

  const handleShareChat = React.useCallback((chat: any) => {
    // FUTURE: Implement share functionality using expo-sharing
    console.log('Sharing chat:', chat.title);
  }, []);

  return (
    <Form.List navigationTitle={t('screens.chatList')} style={styles.container}>
      {/* New Chat Section */}
      <Form.Section title="Start New Conversation">
        <Form.Item
          title={t('chat.newChat')}
          subtitle="Start a new conversation with DNS AI"
          rightContent={
            <GlassCard
              variant="interactive"
              style={styles.newChatBadge}
            >
              <PlusIcon size={20} color="#FFFFFF" circleColor="#007AFF" />
            </GlassCard>
          }
          onPress={handleNewChat}
          showChevron
        />
      </Form.Section>

      {/* Recent Chats Section */}
      {chats.length > 0 ? (
        <Form.Section
          title="Recent Conversations"
          footer={`${chats.length} conversation${chats.length === 1 ? '' : 's'} total`}
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
          <GlassCard
            variant="regular"
            style={styles.emptyStateContainer}
          >
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                {t('chat.emptyState')}
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: isDark ? '#AEAEB2' : '#6D6D70' },
                ]}
              >
                Start your first conversation by tapping "New Chat" above. Your
                chats will appear here.
              </Text>
            </View>
          </GlassCard>
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
                  chats.reduce((total, chat) => total + chat.messages.length, 0) /
                    chats.length
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

/**
 * CRITICAL: Always use StyleSheet.create (never inline objects)
 * This ensures styles are optimized and don't recreate on every render
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newChatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
  },
  chatsList: {
    gap: 8,
  },
  chatItemWrapper: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  chatItemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginHorizontal: 20,
  },
  chatItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ scale: 0.98 }],
  },
  chatItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 8,
    lineHeight: 20,
  },
  chatMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTime: {
    fontSize: 13,
    fontWeight: '400',
  },
  chatBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  messageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  messageBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  chatActions: {
    marginLeft: 12,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF6B35',
  },
});
