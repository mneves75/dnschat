import type { JSX } from 'react';
import {
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react';
import {
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  ViewToken,
  findNodeHandle
} from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { ExpoChatViewModule, NativeChatView, type NativeChatViewProps } from 'expo-chatview';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useResolvedLocale } from '@/hooks/useResolvedLocale';
import { formatMessageTimestamp } from '@/utils/datetime';

export type ChatViewMessage = {
  id: string;
  text: string;
  authorId: string;
  createdAt: number;
  status: 'sent' | 'received';
};

export type ChatViewEventHandlers = {
  onNearTop?: () => void;
  onVisibleIdsChange?: (ids: string[]) => void;
  onPressMessage?: (message: ChatViewMessage) => void;
};

export type ChatViewProps = ChatViewEventHandlers & {
  messages: ChatViewMessage[];
  style?: StyleProp<ViewStyle>;
  contentBottomInset?: number;
};

export type ChatViewHandle = {
  scrollToEnd: (animated?: boolean) => void;
};

const ChatBubble = memo(function ChatBubble({
  message,
  onPress
}: {
  message: ChatViewMessage;
  onPress?: (message: ChatViewMessage) => void;
}) {
  const isSent = message.status === 'sent';
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const locale = useResolvedLocale();
  const timestamp = useMemo(() => formatMessageTimestamp(message.createdAt, locale), [
    message.createdAt,
    locale
  ]);
  return (
    <View style={[styles.bubbleRow, isSent ? styles.alignEnd : styles.alignStart]}>
      <Pressable
        onPress={onPress ? () => onPress(message) : undefined}
        style={({ pressed }) => [
          styles.bubble,
          isSent
            ? isDark
              ? styles.bubbleSentDark
              : styles.bubbleSentLight
            : isDark
              ? styles.bubbleReceivedDark
              : styles.bubbleReceivedLight,
          pressed && styles.bubblePressed
        ]}>
        <Text
          lightColor={isSent ? '#fff' : '#1C1C1E'}
          darkColor={isSent ? '#fff' : '#F2F2F7'}
          style={styles.bubbleText}>
          {message.text}
        </Text>
        <Text
          lightColor={isSent ? 'rgba(255,255,255,0.8)' : 'rgba(60,60,67,0.7)'}
          darkColor={isSent ? 'rgba(255,255,255,0.8)' : 'rgba(235,235,245,0.65)'}
          style={styles.timestamp}>
          {timestamp}
        </Text>
      </Pressable>
    </View>
  );
});

function NativeWrapper(props: ChatViewProps, ref: ForwardedRef<ChatViewHandle>): JSX.Element | null {
  if (!NativeChatView) {
    return <FallbackChatView {...props} ref={ref} />;
  }

  const { onNearTop, onPressMessage, onVisibleIdsChange, ...rest } = props;
  const nativeRef = useRef<any>(null);

  useImperativeHandle(
    ref,
    () => ({
      scrollToEnd(animated = true) {
        const viewTag = findNodeHandle(nativeRef.current);
        if (viewTag && ExpoChatViewModule?.scrollToEnd) {
          ExpoChatViewModule.scrollToEnd(viewTag, animated);
        }
      }
    }),
    []
  );

  const nativeOnNearTop: NativeChatViewProps['onNearTop'] | undefined = onNearTop
    ? (event) => {
        void event;
        onNearTop();
      }
    : undefined;

  const nativeOnVisibleIdsChange: NativeChatViewProps['onVisibleIdsChange'] | undefined = onVisibleIdsChange
    ? (event) => onVisibleIdsChange(event.nativeEvent.ids)
    : undefined;

  const nativeOnPressMessage: NativeChatViewProps['onPressMessage'] | undefined = onPressMessage
    ? (event) => {
        const message = props.messages.find((item) => item.id === event.nativeEvent.id);
        if (message) onPressMessage(message);
      }
    : undefined;

  return (
    <NativeChatView
      {...rest}
      onNearTop={nativeOnNearTop}
      onVisibleIdsChange={nativeOnVisibleIdsChange}
      onPressMessage={nativeOnPressMessage}
      ref={nativeRef}
    />
  );
}

const FallbackChatView = forwardRef<ChatViewHandle, ChatViewProps>(function FallbackChatView(
  { messages, onNearTop, onPressMessage, onVisibleIdsChange, style, contentBottomInset = 0 },
  ref
) {
  const listRef = useRef<FlashList<ChatViewMessage>>(null);
  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.createdAt - b.createdAt),
    [messages]
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToEnd(animated = true) {
        requestAnimationFrame(() => {
          const lastIndex = sortedMessages.length - 1;
          if (lastIndex < 0) return;
          listRef.current?.scrollToIndex({ index: lastIndex, animated, viewPosition: 1 });
        });
      }
    }),
    [sortedMessages]
  );

  const renderItem = useCallback<ListRenderItem<ChatViewMessage>>(
    ({ item }) => <ChatBubble message={item} onPress={onPressMessage} />,
    [onPressMessage]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!onNearTop) return;
      const { layoutMeasurement, contentOffset } = event.nativeEvent;
      if (contentOffset.y < layoutMeasurement.height * 0.1) {
        onNearTop();
      }
    },
    [onNearTop]
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!onVisibleIdsChange) return;
      const ids = viewableItems
        .map((viewable) => (viewable.item as ChatViewMessage | undefined)?.id)
        .filter((id): id is string => Boolean(id));
      onVisibleIdsChange(ids);
    },
    [onVisibleIdsChange]
  );

  return (
    <FlashList
      ref={listRef}
      data={sortedMessages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={style}
      contentContainerStyle={[styles.listContent, { paddingBottom: contentBottomInset }]}
      onScroll={onNearTop ? handleScroll : undefined}
      scrollEventThrottle={16}
      onViewableItemsChanged={onVisibleIdsChange ? handleViewableItemsChanged : undefined}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 40
      }}
      estimatedItemSize={72}
    />
  );
});

export const ChatView = forwardRef<ChatViewHandle, ChatViewProps>(NativeWrapper);

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 12
  },
  bubbleRow: {
    marginVertical: 6,
    flexDirection: 'row'
  },
  alignEnd: {
    justifyContent: 'flex-end'
  },
  alignStart: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6
  },
  bubbleSentLight: {
    backgroundColor: '#0A84FF'
  },
  bubbleSentDark: {
    backgroundColor: '#0A84FF'
  },
  bubbleReceivedLight: {
    backgroundColor: 'rgba(118,118,128,0.12)'
  },
  bubbleReceivedDark: {
    backgroundColor: 'rgba(118,118,128,0.32)'
  },
  bubblePressed: {
    opacity: 0.8
  },
  bubbleText: {
    fontSize: 16
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end'
  }
});
