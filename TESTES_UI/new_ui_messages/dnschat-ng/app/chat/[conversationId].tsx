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
  CURRENT_USER_ID,
  createIncomingMessage,
  type Message,
  useConversation,
  useMessageActions,
  useMessagesHydration
} from '@/context/MessageProvider';
import { useColorScheme } from '@/components/useColorScheme';
import { MAX_MESSAGE_LENGTH, validateMessageInput } from '@/utils/validation';
import { GlassContainer } from '@/components/ui/GlassContainer';
import { useTransport } from '@/context/TransportProvider';
import { useTranslation } from '@/i18n';

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { sendMessage, receiveMessage, markConversationRead } = useMessageActions();
  const { status: transportStatus, error: transportError, executeQuery, resetError } = useTransport();
  const conversation = useConversation(conversationId ?? '');
  const isHydrated = useMessagesHydration();
  const [input, setInput] = useState('');
  const [touched, setTouched] = useState(false);
  const [showScrollToEnd, setShowScrollToEnd] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);
  const inputRef = useRef<TextInput | null>(null);
  const chatViewRef = useRef<ChatViewHandle>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const { t } = useTranslation();
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

  const remoteAuthorId = useMemo(() => {
    if (!conversation) return 'dns-remote';
    const remote = conversation.participants.find((participant) => participant.id !== CURRENT_USER_ID);
    return remote?.id ?? 'dns-remote';
  }, [conversation]);

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

  const validation = useMemo(() => validateMessageInput(input), [input]);
  const showValidationError = touched && !validation.valid;
  const errorMessage = useMemo(() => {
    if (!showValidationError || validation.valid) return undefined;
    return validation.reasonCode === 'length'
      ? t('messages.error.length', { limit: MAX_MESSAGE_LENGTH })
      : t('messages.error.empty');
  }, [showValidationError, validation, t]);
  const remainingCharacters = useMemo(() => {
    const count = validation.normalized.length;
    return Math.max(0, MAX_MESSAGE_LENGTH - count);
  }, [validation.normalized.length]);
  const isSendDisabled = !validation.valid || !isHydrated || transportStatus === 'loading';

  const handleChangeText = useCallback(
    (value: string) => {
      const result = validateMessageInput(value);
      setInput(result.sanitized);
      if (!touched) {
        setTouched(true);
      }
    },
    [touched]
  );

  const resetComposer = useCallback(() => {
    setInput('');
    setTouched(false);
    setShowScrollToEnd(false);
  }, []);

  const performQuery = useCallback(
    async (outgoing: Message) => {
      setPendingMessage(outgoing);
      try {
        const result = await executeQuery({
          conversationId: outgoing.conversationId,
          message: outgoing.text
        });
        const ordered = [...result.records].sort((a, b) => {
          const aId = Number.parseInt(a.id, 10);
          const bId = Number.parseInt(b.id, 10);
          if (Number.isFinite(aId) && Number.isFinite(bId)) {
            return aId - bId;
          }
          return a.id.localeCompare(b.id);
        });
        const responseText = ordered.map((record) => record.content).join('').trim();
        const text = responseText.length > 0 ? responseText : 'No TXT records returned.';
        const incoming = createIncomingMessage(outgoing.conversationId, remoteAuthorId, text);
        receiveMessage(outgoing.conversationId, incoming);
        setPendingMessage(null);
        resetError();
        scrollToEnd();
      } catch (error) {
        if (__DEV__) {
          console.warn('[Conversation] DNS query failed', error);
        }
      }
    },
    [executeQuery, receiveMessage, remoteAuthorId, resetError, scrollToEnd]
  );

  const handleSend = useCallback(() => {
    if (!conversationId || !isHydrated) return;
    const result = validateMessageInput(input);
    if (!result.valid) {
      setTouched(true);
      return;
    }
    resetError();
    const outgoing = sendMessage(conversationId, result.normalized);
    resetComposer();
    scrollToEnd();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    if (outgoing) {
      void performQuery(outgoing);
    }
  }, [conversationId, input, isHydrated, performQuery, resetComposer, scrollToEnd, sendMessage, resetError]);

  const handleRetry = useCallback(() => {
    if (!pendingMessage) return;
    resetError();
    void performQuery(pendingMessage);
  }, [pendingMessage, performQuery, resetError]);

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
        <Text style={styles.emptyTitle}>{t('chat.notFound.title')}</Text>
        <Text style={styles.emptySubtitle}>{t('chat.notFound.subtitle')}</Text>
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
        {transportStatus === 'loading' ? (
          <View style={styles.loadingOverlay} accessibilityLiveRegion="polite">
            <ActivityIndicator color="#fff" />
            <Text style={styles.loadingLabel}>{t('chat.loading')}</Text>
          </View>
        ) : null}
        {transportError ? (
          <View style={styles.errorBanner}>
            <View style={styles.errorBannerText}>
              <Text style={styles.errorBannerTitle}>{t('chat.error.title')}</Text>
              <Text style={styles.errorBannerSubtitle} numberOfLines={2}>
                {transportError.message}
              </Text>
            </View>
            {pendingMessage ? (
              <Pressable onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryButtonLabel}>{t('chat.error.retry')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {showScrollToEnd ? (
          <Pressable style={styles.jumpButton} onPress={() => scrollToEnd()}>
            <Text style={styles.jumpText}>{t('chat.jump')}</Text>
          </Pressable>
        ) : null}
        <GlassContainer
          style={[
            styles.composer,
            {
              backgroundColor: composerColors.background,
              borderTopColor: composerColors.border
            }
          ]}
          blurIntensity={32}
          blurTint={colorScheme === 'dark' ? 'dark' : 'default'}
          fallbackColor={composerColors.background}>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: composerColors.inputBackground
              }
            ]}>
            <TextInput
              placeholder={t('chat.placeholder')}
              placeholderTextColor={composerColors.placeholder}
              style={[styles.input, { color: composerColors.inputText }]}
              value={input}
              onChangeText={handleChangeText}
              multiline
              ref={inputRef}
              onKeyPress={handleKeyPress}
              onSubmitEditing={handleSubmitEditing}
              blurOnSubmit
              returnKeyType="send"
              enablesReturnKeyAutomatically
            />
          </View>
          <View style={styles.composerMeta}>
            {showValidationError && errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
              <Text style={styles.counterText}>{remainingCharacters}</Text>
            )}
          </View>
          <Pressable
            onPress={handleSend}
            disabled={isSendDisabled}
            style={({ pressed }) => [
              styles.sendButton,
              ((isSendDisabled || pressed) && styles.sendButtonDisabled)
            ]}>
            <Text style={styles.sendLabel}>{t('chat.send')}</Text>
          </Pressable>
        </GlassContainer>
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
  composerMeta: {
    justifyContent: 'flex-end',
    paddingBottom: 4,
    paddingHorizontal: 4,
    minWidth: 48
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  loadingLabel: {
    marginTop: 12,
    color: '#fff',
    fontSize: 14,
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
  },
  errorText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '600'
  },
  counterText: {
    fontSize: 12,
    color: 'rgba(99,99,102,0.8)'
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,69,58,0.12)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12
  },
  errorBannerText: {
    flex: 1,
    gap: 4
  },
  errorBannerTitle: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: '700'
  },
  errorBannerSubtitle: {
    color: 'rgba(99,99,102,0.9)',
    fontSize: 12
  },
  retryButton: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FF453A',
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  retryButtonLabel: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '600'
  }
});
