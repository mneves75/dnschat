import React, { useEffect, useLayoutEffect } from "react";
import {
  StyleSheet,
  useColorScheme,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MessageList } from "../../components/MessageList";
import { ChatInput } from "../../components/ChatInput";
import { useChat } from "../../context/ChatContext";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { LiquidGlassSpacing } from "../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../i18n";

export function Chat() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = useImessagePalette();
  const { currentChat, isLoading, error, sendMessage, clearError, createChat } =
    useChat();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  useLayoutEffect(() => {
    navigation.setOptions({ title: t("screen.chat.navigationTitle") });
  }, [navigation, t]);

  // Log when currentChat changes
  // IMPORTANT: Use optional chaining on messages to prevent crash when currentChat exists but messages is undefined
  useEffect(() => {
    console.log('🔄 [Chat] currentChat changed:', {
      chatId: currentChat?.id,
      messageCount: currentChat?.messages?.length ?? 0,
      lastMessage: currentChat?.messages?.[currentChat?.messages?.length - 1]?.content?.substring(0, 50),
    });
  }, [currentChat]);

  // Log messages array being passed to MessageList
  useEffect(() => {
    const messages = currentChat?.messages || [];
    console.log('📊 [Chat] Rendering MessageList with messages:', {
      messageCount: messages.length,
      messageIds: messages.map(m => m.id),
    });
  }, [currentChat?.messages]);

  useEffect(() => {
    // Create a new chat if none exists
    if (!currentChat) {
      console.log('📝 [Chat] No current chat, creating new chat...');
      createChat();
    }
  }, [currentChat]);

  useEffect(() => {
    // Show error alert when error occurs
    if (error) {
      console.error('❌ [Chat] Error occurred:', error);
      Alert.alert(t("screen.chat.errorAlertTitle"), error, [
        {
          text: t("screen.chat.errorAlertDismiss"),
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
      console.error("Failed to send message:", err);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: palette.background },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={palette.background}
      />

      <KeyboardAvoidingView
        style={[styles.content, { paddingHorizontal: LiquidGlassSpacing.xs }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <MessageList
          messages={currentChat?.messages || []}
          isLoading={isLoading}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={t("screen.chat.placeholder")}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: LiquidGlassSpacing.xs, // Spacing between message list and input
  },
});
