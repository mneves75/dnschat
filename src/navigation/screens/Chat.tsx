import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  useColorScheme,
  Alert,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { MessageList } from "../../components/MessageList";
import { ChatInput } from "../../components/ChatInput";
import { useChat } from "../../context/ChatContext";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import {
  LiquidGlassSpacing,
  getMinimumTouchTarget,
} from "../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../i18n";
import { useTypography } from "../../ui/hooks/useTypography";

export function Chat() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = useImessagePalette();
  const typography = useTypography();
  const { currentChat, isLoading, error, sendMessage, clearError, createChat } = useChat();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const minimumTouchTarget = useMemo(() => getMinimumTouchTarget(), []);
  const bodyLineHeight = typography.body.lineHeight ?? 22;
  const minimumInputHeight = useMemo(
    () => Math.max(bodyLineHeight + LiquidGlassSpacing.sm * 2, minimumTouchTarget),
    [bodyLineHeight, minimumTouchTarget],
  );
  const [inputHeight, setInputHeight] = useState(minimumInputHeight);
  const handleInputHeightChange = useCallback((height: number) => {
    setInputHeight((previous) =>
      Math.abs(previous - height) < 1 ? previous : height,
    );
  }, []);
  const messageListBottomInset = useMemo(
    () => inputHeight + insets.bottom + LiquidGlassSpacing.xs,
    [inputHeight, insets.bottom],
  );
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
      edges={['left', 'right', 'top']}  // bottom handled by KeyboardStickyView to avoid double insets
      style={[
        styles.container,
        { backgroundColor: palette.background },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={palette.background}
      />

      <View
        style={[
          styles.content,
          { paddingHorizontal: LiquidGlassSpacing.xs },
        ]}
      >
        <MessageList
          messages={currentChat?.messages || []}
          isLoading={isLoading}
          bottomInset={messageListBottomInset}
        />
      </View>

      <KeyboardStickyView
        style={[
          styles.keyboardAccessory,
          {
            paddingBottom: insets.bottom + LiquidGlassSpacing.xs,
            backgroundColor: palette.background,
          },
        ]}
      >
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={t("screen.chat.placeholder")}
          onHeightChange={handleInputHeightChange}
        />
      </KeyboardStickyView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: LiquidGlassSpacing.xs, // aligns with LiquidGlassSpacing grid for top gap
  },
  keyboardAccessory: {
    paddingHorizontal: LiquidGlassSpacing.xs,
    paddingTop: LiquidGlassSpacing.xs,
  },
});
