import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { Link, useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { DeleteConversationSheet } from '@/components/messages/DeleteConversationSheet';
import { MessageListItem } from '@/components/messages/MessageListItem';
import { useMessageActions, useMessages, useMessagesHydration } from '@/context/MessageProvider';
import { useColorScheme } from '@/components/useColorScheme';
import { useTranslation } from '@/i18n';

export default function MessageListScreen() {
  const router = useRouter();
  const conversations = useMessages();
  const { refreshConversations, markConversationRead, deleteConversation } = useMessageActions();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const isHydrated = useMessagesHydration();
  const colorScheme = useColorScheme() ?? 'light';
  const { t } = useTranslation();

  const data = useMemo(() => conversations, [conversations]);
  const pendingConversation = useMemo(
    () => data.find((item) => item.id === pendingDeleteId),
    [data, pendingDeleteId]
  );

  const actionButtonColors = useMemo(
    () => ({
      background: colorScheme === 'dark' ? 'rgba(99,99,102,0.36)' : 'rgba(118,118,128,0.12)',
      text: colorScheme === 'dark' ? '#F2F2F7' : '#1C1C1E'
    }),
    [colorScheme]
  );

  const handlePress = useCallback(
    (conversationId: string) => {
      markConversationRead(conversationId);
      router.push(`/chat/${conversationId}`);
    },
    [markConversationRead, router]
  );

  const handleLongPress = useCallback((conversationId: string) => {
    setPendingDeleteId(conversationId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDeleteId) return;
    deleteConversation(pendingDeleteId);
    setPendingDeleteId(null);
  }, [deleteConversation, pendingDeleteId]);

  const closeSheet = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshConversations();
    setRefreshing(false);
  }, [refreshConversations]);

  return (
    <>
      <View style={styles.container}>
        {!isHydrated ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" />
            <Text style={styles.loaderLabel}>{t('inbox.loading')}</Text>
          </View>
        ) : null}
        <FlashList
          pointerEvents={isHydrated ? 'auto' : 'none'}
          data={data}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('inbox.title')}</Text>
              <View style={styles.headerActions}>
                <Link href="../new-chat" asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      {
                        backgroundColor: actionButtonColors.background,
                        opacity: pressed ? 0.8 : 1
                      }
                    ]}>
                    <Text style={[styles.actionLabel, { color: actionButtonColors.text }]}>{t('inbox.newChat')}</Text>
                  </Pressable>
                </Link>
                <Link href="../modal" asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      {
                        backgroundColor: actionButtonColors.background,
                        opacity: pressed ? 0.8 : 1
                      }
                    ]}>
                    <Text style={[styles.actionLabel, { color: actionButtonColors.text }]}>{t('inbox.info')}</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <MessageListItem
              conversation={item}
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          )}
          ListEmptyComponent={
              isHydrated ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>{t('inbox.empty.title')}</Text>
                  <Text style={styles.emptySubtitle}>{t('inbox.empty.subtitle')}</Text>
                </View>
              ) : null
            }
          contentInsetAdjustmentBehavior="automatic"
          estimatedItemSize={88}
        />
      </View>
      <DeleteConversationSheet
        visible={Boolean(pendingDeleteId)}
        conversationTitle={pendingConversation?.title}
        onCancel={closeSheet}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600'
  },
  loader: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8
  },
  loaderLabel: {
    fontSize: 14,
    opacity: 0.8
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: 8
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(142,142,147,0.8)'
  }
});
