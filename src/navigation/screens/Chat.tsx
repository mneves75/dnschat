import React, { useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  View,
} from 'react-native';
import { MessageList } from '../../components/MessageList';
import { ChatInput } from '../../components/ChatInput';
import { useChat } from '../../context/ChatContext';

export function Chat() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { 
    currentChat, 
    isLoading, 
    error, 
    sendMessage, 
    clearError,
    createChat 
  } = useChat();

  useEffect(() => {
    // Create a new chat if none exists
    if (!currentChat) {
      createChat();
    }
  }, [currentChat]);

  useEffect(() => {
    // Show error alert when error occurs
    if (error) {
      Alert.alert(
        'Error',
        error,
        [
          {
            text: 'OK',
            onPress: clearError,
          },
        ]
      );
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

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000000' : '#FFFFFF'}
      />
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <MessageList
          messages={currentChat?.messages || []}
          isLoading={isLoading}
        />
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask me anything..."
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
});