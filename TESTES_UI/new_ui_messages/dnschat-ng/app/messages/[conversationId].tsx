import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  TextInputSubmitEditingEventData,
  View
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Themed';
import { ChatView, ChatViewHandle, ChatViewMessage } from '@/components/chat/ChatView';
import {
  useConversation,
  useMessageActions,
  useMessagesHydration
} from '@/context/MessageProvider';
import { useColorScheme } from '@/components/useColorScheme';

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { sendMessage, markConversationRead } = useMessageActions();
  const conversation = useConversation(conversationId ?? '');
  const isHydrated = useMessagesHydration();
  const [input, setInput] = useState('');
  const [showScrollToEnd, setShowScrollToEnd] = useState(false);
  const inputRef = useRef<TextInput | null>(null);
  const chatViewRef = useRef<ChatViewHandle>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const composerColors = useMemo(
    () => ({
      background: colorScheme === 'dark' ? 'rgba(28,28,30,0.88)' : 'rgba(249,249,249,0.9)',
      border: colorScheme === 'dark' ? 'rgba(84,84,88,0.65)' : 'rgba(142,142,147,0.2)',
      inputBackground: colorScheme === 'dark' ? 'rgba(118,118,128,0.24)' : 'rgba(118,118,128,0.12)',
      inputText: colorScheme === 'dark' ? '#F2F2F7' : '#1C1C1E',
      placeholder: colorScheme === 'dark' ? 'rgba(235,235,245,0.45)' : 'rgba(142,142,147,0.8)'
    }),
    [colorScheme]
  );

  const messages = useMemo<ChatViewMessage[]>(() => {
    if (!conversation) return [];
    return conversation.messages.map((message) => ({
      id: message.id,
      text: message.text,
      authorId: message.authorId,
      createdAt: message.createdAt,
      status: message.status
    }));
  }, [conversation]);

  const scrollToEnd = useCallback(
    (animated = true) => {
      requestAnimationFrame(() => {
        chatViewRef.current?.scrollToEnd(animated);
      });
    },
    []
  );

  useEffect(() => {
    if (!conversation) return;
    navigation.setOptions({
      title: conversation.title,
      headerBackTitle: 'Inbox',
      headerBackTitleVisible: false
    });
    scrollToEnd(false);
  }, [conversation, navigation, scrollToEnd]);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, scrollToEnd]);

  const handleSend = useCallback(() => {
    if (!conversationId || !input.trim() || !isHydrated) return;
    sendMessage(conversationId, input.trim());
    setInput('');
    setShowScrollToEnd(false);
    scrollToEnd();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [conversationId, input, sendMessage, scrollToEnd]);

  const handleKeyPress = useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (event.nativeEvent.key !== 'Enter') return;
      const shiftKeyPressed =
        'shiftKey' in event.nativeEvent
          ? Boolean((event.nativeEvent as unknown as { shiftKey?: boolean }).shiftKey)
          : false;
      if (shiftKeyPressed) return;
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      handleSend();
    },
    [handleSend]
  );

  const handleSubmitEditing = useCallback(
    (_event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      handleSend();
    },
    [handleSend]
  );

  useFocusEffect(
    useCallback(() => {
      if (conversationId) markConversationRead(conversationId);
    }, [conversationId, markConversationRead])
  );

  if (!isHydrated) {
    return (
      <View style={[styles.center, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!conversation) {
    return (
      <View style={[styles.center, { paddingBottom: insets.bottom }]}>
        <Text style={styles.emptyTitle}>Conversation not found</Text>
        <Text style={styles.emptySubtitle}>Return to the inbox and try again.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 88, android: 0 })}>
      <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
        <ChatView
          ref={chatViewRef}
          messages={messages}
          contentBottomInset={(insets.bottom || 12) + 88}
          onNearTop={() => {
            if (__DEV__) {
              console.log('[ChatView] Near top reached for', conversationId);
            }
          }}
          onVisibleIdsChange={(ids) => {
            const lastId = messages[messages.length - 1]?.id;
            if (!lastId) return;
            setShowScrollToEnd(!ids.includes(lastId));
          }}
        />
        {showScrollToEnd ? (
          <Pressable style={styles.jumpButton} onPress={() => scrollToEnd()}>
            <Text style={styles.jumpText}>Jump to latest</Text>
          </Pressable>
        ) : null}
        <View
          style={[
            styles.composer,
            {
              backgroundColor: composerColors.background,
              borderTopColor: composerColors.border
            }
          ]}>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: composerColors.inputBackground
              }
            ]}>
            <TextInput
              placeholder="iMessage"
              placeholderTextColor={composerColors.placeholder}
              style={[styles.input, { color: composerColors.inputText }]}
              value={input}
              onChangeText={setInput}
              multiline
              ref={inputRef}
              onKeyPress={handleKeyPress}
              onSubmitEditing={handleSubmitEditing}
              blurOnSubmit
              returnKeyType="send"
              enablesReturnKeyAutomatically
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || !isHydrated}
            style={({ pressed }) => [
              styles.sendButton,
              ((!input.trim() || !isHydrated || pressed) && styles.sendButtonDisabled)
            ]}>
            <Text style={styles.sendLabel}>Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 120
  },
  input: {
    fontSize: 16,
    minHeight: 24
  },
  sendButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    opacity: 0.5
  },
  sendLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  jumpButton: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16
  },
  jumpText: {
    color: '#fff',
    fontWeight: '600'
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(99,99,102,1)'
  }
});
