import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Text,
  Platform,
} from "react-native";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textInputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      // Refocus the input after sending on iOS
      if (Platform.OS === "ios") {
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const canSend = message.trim().length > 0 && !isLoading;

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            isDark ? styles.darkTextInput : styles.lightTextInput,
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#8E8E93" : "#8E8E93"}
          multiline={true}
          maxLength={1000}
          editable={!isLoading}
          returnKeyType="send"
          enablesReturnKeyAutomatically={true}
          blurOnSubmit={true}
          textAlignVertical="top"
          keyboardType="default"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          contextMenuHidden={true}
          keyboardAppearance={isDark ? "dark" : "light"}
          onSubmitEditing={handleSend}
          testID="chat-input"
          accessibilityLabel="Chat message input"
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonInactive,
            isDark ? styles.darkSendButton : styles.lightSendButton,
          ]}
          onPress={handleSend}
          disabled={!canSend}
          testID="chat-send"
          accessibilityLabel="Send message"
        >
          <Text
            style={[
              styles.sendButtonText,
              canSend
                ? styles.sendButtonTextActive
                : styles.sendButtonTextInactive,
              isDark ? styles.darkSendButtonText : styles.lightSendButtonText,
            ]}
          >
            {isLoading ? "..." : "→"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Remove borders and backgrounds for glass compatibility
  },
  lightContainer: {
    backgroundColor: "transparent", // Glass wrapper handles background
  },
  darkContainer: {
    backgroundColor: "transparent", // Glass wrapper handles background
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    fontSize: 16,
    lineHeight: 20,
    borderWidth: 1,
  },
  lightTextInput: {
    backgroundColor: "rgba(242, 242, 247, 0.8)", // Semi-transparent for glass effect
    borderColor: "rgba(229, 229, 234, 0.6)",
    color: "#000000",
  },
  darkTextInput: {
    backgroundColor: "rgba(28, 28, 30, 0.8)", // Semi-transparent for glass effect
    borderColor: "rgba(56, 56, 58, 0.6)",
    color: "#FFFFFF",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },
  sendButtonInactive: {
    backgroundColor: "#E5E5EA",
  },
  darkSendButton: {
    // Dark mode colors handled by active/inactive states
  },
  lightSendButton: {
    // Light mode colors handled by active/inactive states
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sendButtonTextActive: {
    color: "#FFFFFF",
  },
  sendButtonTextInactive: {
    color: "#8E8E93",
  },
  darkSendButtonText: {
    // Dark mode text colors handled by active/inactive states
  },
  lightSendButtonText: {
    // Light mode text colors handled by active/inactive states
  },
});
