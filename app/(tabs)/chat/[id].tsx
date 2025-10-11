/**
 * Chat Detail Screen - Dynamic Route (Expo Router)
 *
 * Displays individual chat conversation with messages and input.
 * Uses dynamic routing: /chat/[id] where [id] is the chat ID.
 *
 * CRITICAL EXPO ROUTER FEATURES:
 * - useLocalSearchParams() to get the [id] parameter
 * - Automatic navigation when user taps chat in list
 * - Back button handled automatically by native stack
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MessageList } from '../../../src/components/MessageList';
import { ChatInput } from '../../../src/components/ChatInput';
import { useChat } from '../../../src/context/ChatContext';
import {
  LiquidGlassWrapper,
  useLiquidGlassCapabilities,
} from '../../../src/components/LiquidGlassWrapper';

/**
 * Chat Detail Screen Component
 *
 * CRITICAL: This is a dynamic route - the [id] in the filename
 * becomes a route parameter accessible via useLocalSearchParams().
 *
 * FUTURE ENHANCEMENTS (Phase 4):
 * - Replace LiquidGlassWrapper with GlassView from expo-glass-effect
 * - Add GlassHeader for navigation header
 * - Optimize message list rendering with FlashList
 */
export default function ChatDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // CRITICAL: Get chat ID from route parameter
  // In Expo Router, [id].tsx creates a dynamic route where id is the parameter
  const params = useLocalSearchParams<{ id: string }>();
  const chatId = params.id;

  const {
    chats,
    currentChat,
    isLoading,
    error,
    sendMessage,
    clearError,
    setCurrentChat,
  } = useChat();

  // iOS 26 Liquid Glass capabilities
  const { isSupported: glassSupported, supportsSwiftUIGlass } =
    useLiquidGlassCapabilities();

  // CRITICAL: Load chat when chat ID changes
  // This ensures the correct chat is displayed when navigating
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find((c) => c.id === chatId);
      if (chat && chat.id !== currentChat?.id) {
        setCurrentChat(chat);
      }
    }
  }, [chatId, chats, currentChat, setCurrentChat]);

  useEffect(() => {
    // Show error alert when error occurs
    if (error) {
      Alert.alert('Error', error, [
        {
          text: 'OK',
          onPress: clearError,
        },
      ]);
    }
  }, [error, clearError]);

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (err) {
      // Error handling is done in the context
      console.error('Failed to send message:', err);
    }
  };

  // PERFORMANCE NOTE: iOS glass effects are expensive
  // We limit to 2 glass surfaces: message area + input
  return (
    <SafeAreaView
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000000' : '#FFFFFF'}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {Platform.OS === 'ios' ? (
          // iOS: Use Liquid Glass UI
          <>
            {/* iOS 26 Liquid Glass Message Area */}
            <LiquidGlassWrapper
              variant="regular"
              shape="roundedRect"
              cornerRadius={20}
              sensorAware={true}
              enableContainer={true}
              style={styles.glassMessageArea}
            >
              <MessageList
                messages={currentChat?.messages || []}
                isLoading={isLoading}
              />
            </LiquidGlassWrapper>

            {/* iOS 26 Liquid Glass Chat Input */}
            <LiquidGlassWrapper
              variant="prominent"
              shape="capsule"
              isInteractive={true}
              tintColor={isDark ? '#007AFF' : '#007AFF'}
              style={styles.glassInputArea}
            >
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask me anything..."
              />
            </LiquidGlassWrapper>
          </>
        ) : (
          // Android/Web: Standard UI
          <>
            <MessageList
              messages={currentChat?.messages || []}
              isLoading={isLoading}
            />

            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask me anything..."
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * CRITICAL: StyleSheet.create for performance
 * Never use inline styles in render
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: 'transparent', // Transparent for glass effects
  },
  darkContainer: {
    backgroundColor: 'transparent', // Transparent for glass effects
  },
  content: {
    flex: 1,
    gap: 8, // Spacing between glass elements
  },
  glassMessageArea: {
    flex: 1,
    margin: 8,
    backgroundColor: 'transparent',
  },
  glassInputArea: {
    margin: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
});
