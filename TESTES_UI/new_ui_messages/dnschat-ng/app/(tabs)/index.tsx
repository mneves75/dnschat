import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';

import { Link, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { MessageListItem } from '@/components/messages/MessageListItem';
import { useMessageActions, useMessages } from '@/context/MessageProvider';
import { useColorScheme } from '@/components/useColorScheme';

export default function MessageListScreen() {
  const router = useRouter();
  const conversations = useMessages();
  const { refreshConversations, markConversationRead } = useMessageActions();
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const data = useMemo(() => conversations, [conversations]);

  const infoButtonColors = useMemo(
    () => ({
      background: colorScheme === 'dark' ? 'rgba(99,99,102,0.36)' : 'rgba(118,118,128,0.12)',
      text: colorScheme === 'dark' ? '#F2F2F7' : '#1C1C1E'
    }),
    [colorScheme]
  );

  const handlePress = useCallback(
    (conversationId: string) => {
      markConversationRead(conversationId);
      router.push(`/messages/${conversationId}`);
    },
    [markConversationRead, router]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshConversations();
    setRefreshing(false);
  }, [refreshConversations]);

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
            <Link href="/modal" asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.infoButton,
                  {
                    backgroundColor: infoButtonColors.background,
                    opacity: pressed ? 0.8 : 1
                  }
                ]}>
                <Text style={[styles.infoLabel, { color: infoButtonColors.text }]}>Info</Text>
              </Pressable>
            </Link>
          </View>
        }
        renderItem={({ item }) => <MessageListItem conversation={item} onPress={handlePress} />}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
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
  infoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600'
  }
});
