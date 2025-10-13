import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { Conversation } from '@/context/MessageProvider';

type Props = {
  conversation: Conversation;
  onPress: (conversationId: string) => void;
};

const formatTimestamp = (value: number) => {
  const diff = Date.now() - value;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const date = new Date(value);
  return date.toLocaleDateString();
};

function MessageListItemComponent({ conversation, onPress }: Props) {
  const initials = useMemo(() => {
    const parts = conversation.title.split(' ');
    return parts.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  }, [conversation.title]);

  return (
    <Pressable onPress={() => onPress(conversation.id)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLabel}>{initials}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {conversation.title}
          </Text>
          <Text style={styles.timestamp}>{formatTimestamp(conversation.lastMessageAt)}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.preview} numberOfLines={1}>
            {conversation.lastMessagePreview}
          </Text>
          {conversation.unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const MessageListItem = memo(MessageListItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(142, 142, 147, 0.2)',
    backgroundColor: 'transparent'
  },
  rowPressed: {
    opacity: 0.5
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    marginRight: 16
  },
  avatarLabel: {
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600'
  },
  timestamp: {
    marginLeft: 8,
    fontSize: 12,
    color: 'rgba(142, 142, 147, 1)'
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  preview: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(99, 99, 102, 1)'
  },
  badge: {
    marginLeft: 12,
    minWidth: 22,
    paddingHorizontal: 6,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});
