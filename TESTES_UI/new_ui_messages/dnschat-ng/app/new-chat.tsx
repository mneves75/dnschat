import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

import { Stack, useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { useMessageActions } from '@/context/MessageProvider';
import {
  MAX_MESSAGE_LENGTH,
  stripControlCharacters,
  validateMessageInput
} from '@/utils/validation';
import { useColorScheme } from '@/components/useColorScheme';
import { useTranslation } from '@/i18n';

type TitleValidation =
  | { valid: true; sanitized: string; normalized: string }
  | { valid: false; sanitized: string; normalized: string; reason: string };

const TITLE_MAX_LENGTH = 60;

export default function NewChatScreen() {
  const router = useRouter();
  const { createConversation } = useMessageActions();
  const colorScheme = useColorScheme() ?? 'light';
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [messageTouched, setMessageTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const titleState = useMemo<TitleValidation>(() => {
    const sanitized = stripControlCharacters(title);
    const normalized = sanitized.replace(/\s+/g, ' ').trim();
    if (normalized.length === 0) {
      return { valid: false, sanitized, normalized, reason: t('newChat.error.contactRequired') };
    }
    if (normalized.length > TITLE_MAX_LENGTH) {
      return {
        valid: false,
        sanitized,
        normalized,
        reason: t('newChat.error.contactLength', { limit: TITLE_MAX_LENGTH })
      };
    }
    return { valid: true, sanitized, normalized };
  }, [t, title]);
  const messageState = useMemo(
    () => (message.length === 0 ? null : validateMessageInput(message)),
    [message]
  );
  const showTitleError = titleTouched && !titleState.valid;
  const showMessageError = messageTouched && messageState !== null && !messageState.valid;

  const canSubmit =
    titleState.valid && (messageState === null || (messageState !== null && messageState.valid));

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(stripControlCharacters(value));
      if (!titleTouched) {
        setTitleTouched(true);
      }
    },
    [titleTouched]
  );

  const handleMessageChange = useCallback(
    (value: string) => {
      setMessage(stripControlCharacters(value));
      if (!messageTouched) {
        setMessageTouched(true);
      }
    },
    [messageTouched]
  );

  const handleSubmit = useCallback(() => {
    setTitleTouched(true);
    if (message.length > 0) {
      setMessageTouched(true);
    }
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Reuse normalized payloads so persisted state stays deterministic across sessions.
      const conversationId = createConversation({
        title: titleState.normalized,
        initialMessage: messageState && messageState.valid ? messageState.normalized : undefined
      });
      router.replace(`/chat/${conversationId}`);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, createConversation, message.length, messageState, router, titleState.normalized]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const messageLength = messageState ? messageState.normalized.length : 0;
  const remainingCharacters = useMemo(
    () => Math.max(0, MAX_MESSAGE_LENGTH - messageLength),
    [messageLength]
  );

  const palette = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            cardBackground: 'rgba(28,28,30,0.95)',
            fieldBackground: 'rgba(44,44,46,0.9)',
            fieldBorder: 'rgba(235,235,245,0.2)',
            labelColor: 'rgba(235,235,245,0.7)'
          }
        : {
            cardBackground: 'rgba(249,249,249,0.9)',
            fieldBackground: 'rgba(255,255,255,0.9)',
            fieldBorder: 'rgba(142,142,147,0.2)',
            labelColor: 'rgba(60,60,67,0.8)'
          },
    [colorScheme]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t('newChat.title'),
          presentation: 'modal',
          headerRight: () => (
            <Pressable onPress={handleCancel} style={styles.headerLink}>
              <Text style={styles.headerLinkText}>{t('common.cancel')}</Text>
            </Pressable>
          )
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: palette.cardBackground }]}>
            <Text style={styles.sectionTitle}>{t('newChat.contactLabel')}</Text>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: palette.labelColor }]}>
                {t('newChat.contactLabel')}
              </Text>
              <TextInput
                value={title}
                onChangeText={handleTitleChange}
                placeholder={t('newChat.placeholder')}
                placeholderTextColor="rgba(142,142,147,0.8)"
                style={[
                  styles.input,
                  { backgroundColor: palette.fieldBackground, borderColor: palette.fieldBorder }
                ]}
                autoFocus
                maxLength={80}
                returnKeyType="next"
              />
              {showTitleError ? <Text style={styles.errorText}>{titleState.reason}</Text> : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: palette.labelColor }]}>
                {t('newChat.optionalMessage')}
              </Text>
              <TextInput
                value={message}
                onChangeText={handleMessageChange}
                placeholder={t('newChat.optionalPlaceholder')}
                placeholderTextColor="rgba(142,142,147,0.8)"
                style={[
                  styles.input,
                  styles.multilineInput,
                  { backgroundColor: palette.fieldBackground, borderColor: palette.fieldBorder }
                ]}
                multiline
                maxLength={MAX_MESSAGE_LENGTH + 40}
              />
              {showMessageError && messageState && 'reasonCode' in messageState ? (
                <Text style={styles.errorText}>
                  {messageState.reasonCode === 'length'
                    ? t('messages.error.length', { limit: MAX_MESSAGE_LENGTH })
                    : t('messages.error.empty')}
                </Text>
              ) : (
                <Text style={styles.counterText}>
                  {t('newChat.charactersRemaining', { count: remainingCharacters })}
                </Text>
              )}
            </View>
          </View>
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            style={({ pressed }) => [
              styles.primaryButton,
              (!canSubmit || submitting) && styles.primaryButtonDisabled,
              pressed && !submitting && styles.primaryButtonPressed
            ]}>
            <Text style={styles.primaryButtonLabel}>
              {submitting ? t('newChat.creating') : t('newChat.create')}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24
  },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600'
  },
  input: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top'
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF453A'
  },
  counterText: {
    fontSize: 12,
    color: 'rgba(99,99,102,0.8)',
    alignSelf: 'flex-end'
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#0A84FF',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonPressed: {
    opacity: 0.85
  },
  primaryButtonDisabled: {
    opacity: 0.5
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  headerLink: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  headerLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF'
  }
});
