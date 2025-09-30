import React, { useEffect } from "react";
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
import { MessageList } from "../components/MessageList";
import { ChatInput } from "../components/ChatInput";
import { useChat } from "../context/ChatContext";
import { UniversalGlassView } from "../components/glass/UniversalGlassView";
import { useLiquidGlassAvailability } from "../components/glass/GlassCapabilityBridge";

export function Chat() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { currentChat, isLoading, error, sendMessage, clearError, createChat } =
    useChat();

  // Liquid Glass capabilities
  const { available: glassAvailable } = useLiquidGlassAvailability();

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
        {Platform.OS === "ios" && glassAvailable ? ( // Use glass UI when available
          <>
            {/* Liquid Glass Message Area */}
            <UniversalGlassView
              variant="regular"
              shape="roundedRect"
              cornerRadius={20}
              style={styles.glassMessageArea}
            >
              <MessageList
                messages={currentChat?.messages || []}
                isLoading={isLoading}
              />
            </UniversalGlassView>

            {/* Liquid Glass Chat Input */}
            <UniversalGlassView
              variant="prominent"
              shape="capsule"
              style={styles.glassInputArea}
            >
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask me anything..."
              />
            </UniversalGlassView>
          </>
        ) : (
          // Fallback for non-iOS or when glass unavailable
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
