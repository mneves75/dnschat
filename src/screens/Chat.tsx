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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
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
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    // Create a new chat if none exists
    if (!currentChat) {
      createChat();
    }
  }, [currentChat, createChat]);

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
      edges={["bottom", "left", "right"]}
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#FFFFFF" },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? Math.max(headerHeight, 0) + insets.top
            : 0
        }
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
  content: {
    flex: 1,
    gap: 8, // Spacing between glass elements
    paddingBottom: Platform.OS === "android" ? 16 : 0,
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
