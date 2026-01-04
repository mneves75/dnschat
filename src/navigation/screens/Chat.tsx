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
import { KeyboardStickyView, useKeyboardState } from "react-native-keyboard-controller";
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
import { devLog, devWarn } from "../../utils/devLog";

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
  const bodyLineHeight = typography["body"]?.lineHeight ?? 22;
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

  // Track keyboard height for proper message list layout
  // CRITICAL: KeyboardStickyView uses transform (not layout positioning), so keyboard
  // height MUST be included in bottomInset to prevent messages hiding behind keyboard
  // BUG FIX: Use primitive selector, not object (prevents infinite re-renders)
  const keyboardHeight = useKeyboardState((state) => state.height);

  // Calculate bottom inset for MessageList to reserve space for:
  // 1. ChatInput component height (inputHeight)
  // 2. Safe area bottom inset (home indicator on iOS)
  // 3. Spacing between input and last message (LiquidGlassSpacing.xs = 8px)
  // 4. Keyboard height when visible (KeyboardStickyView uses transform, keyboard covers screen)
  const messageListBottomInset = useMemo(
    () => inputHeight + insets.bottom + LiquidGlassSpacing.xs + keyboardHeight,
    [inputHeight, insets.bottom, keyboardHeight],
  );
  useLayoutEffect(() => {
    navigation.setOptions({ title: t("screen.chat.navigationTitle") });
  }, [navigation, t]);

  // Log when currentChat changes
  // IMPORTANT: Use optional chaining on messages to prevent crash when currentChat exists but messages is undefined
  useEffect(() => {
    devLog("[Chat] currentChat changed", {
      chatId: currentChat?.id,
      messageCount: currentChat?.messages?.length ?? 0,
    });
  }, [currentChat]);

  // Log messages array being passed to MessageList
  useEffect(() => {
    const messages = currentChat?.messages || [];
    devLog("[Chat] Rendering MessageList", {
      messageCount: messages.length,
    });
  }, [currentChat?.messages]);

  useEffect(() => {
    // Create a new chat if none exists
    if (!currentChat) {
      devLog("[Chat] No current chat, creating new chat");
      createChat();
    }
  }, [currentChat]);

  useEffect(() => {
    // Show error alert when error occurs
    if (error) {
      devWarn("[Chat] Error occurred", error);
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
      devWarn("[Chat] Failed to send message", err);
    }
  };

  return (
    <SafeAreaView
      testID="chat-screen"
      edges={['left', 'right']}  // top handled by navigation header, bottom by KeyboardStickyView
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
          testID="message-list"
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
          testID="chat-input"
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
    // paddingTop removed: MessageList.contentContainerStyle already provides 8px top padding
    // Eliminates double padding (16px gap) between navigation header and first message
  },
  keyboardAccessory: {
    paddingHorizontal: LiquidGlassSpacing.xs,
    paddingTop: LiquidGlassSpacing.xs,
  },
});
