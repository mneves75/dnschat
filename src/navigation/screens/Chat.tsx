import React, { useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  View,
} from "react-native";
import { MessageList } from "../../components/MessageList";
import { ChatInput } from "../../components/ChatInput";
import { useChat } from "../../context/ChatContext";
import {
  LiquidGlassWrapper,
  useLiquidGlassCapabilities,
} from "../../components/LiquidGlassWrapper";

export function Chat() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { currentChat, isLoading, error, sendMessage, clearError, createChat } =
    useChat();

  // iOS 26 Liquid Glass capabilities
  const { isSupported: glassSupported, supportsSwiftUIGlass } =
    useLiquidGlassCapabilities();

  useEffect(() => {
    // Create a new chat if none exists
    if (!currentChat) {
      createChat();
    }
  }, [currentChat]);

  useEffect(() => {
    // Show error alert when error occurs
    if (error) {
      Alert.alert("Error", error, [
        {
          text: "OK",
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
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#FFFFFF"}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {Platform.OS === "ios" ? ( // Always use glass UI on iOS
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
              tintColor={isDark ? "#007AFF" : "#007AFF"} // iOS system blue
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
          // Fallback for non-iOS or older iOS versions
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "transparent", // Transparent for glass effects
  },
  darkContainer: {
    backgroundColor: "transparent", // Transparent for glass effects
  },
  content: {
    flex: 1,
    gap: 8, // Spacing between glass elements
  },
  glassMessageArea: {
    flex: 1,
    margin: 8,
    backgroundColor: "transparent",
  },
  glassInputArea: {
    margin: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
});
