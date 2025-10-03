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

        {/* ✅ Character counter when approaching limit */}
        {message.length > 800 && (
          <Text
            style={[
              styles.characterCounter,
              isDark ? styles.darkCharacterCounter : styles.lightCharacterCounter,
              message.length >= 1000 && styles.characterCounterLimit,
            ]}
          >
            {message.length}/1000
          </Text>
        )}

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
            {isLoading ? "●●●" : "↑"} {/* ✅ iOS Messages standard (upward arrow) */}
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
    backgroundColor: "#F2F2F7", // ✅ Solid background for clarity (was 0.8 opacity)
    borderColor: "#D1D1D6", // Solid border
    color: "#000000",
  },
  darkTextInput: {
    backgroundColor: "#1C1C1E", // ✅ Solid background for clarity (was 0.8 opacity)
    borderColor: "#3A3A3C", // Solid border
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
  characterCounter: {
    position: "absolute",
    top: -20,
    right: 48,
    fontSize: 11,
    fontWeight: "500",
  },
  lightCharacterCounter: {
    color: "#6D6D70",
  },
  darkCharacterCounter: {
    color: "#AEAEB2",
  },
  characterCounterLimit: {
    color: "#FF3B30", // Red when at limit
    fontWeight: "600",
  },
});
