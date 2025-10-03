import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  Alert,
} from "react-native";
import { format } from "date-fns";
import Markdown from "react-native-markdown-display";
import { Message } from "../types/chat";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const isUser = message.role === "user";
  const isLoading = message.status === "sending";
  const hasError = message.status === "error";

  const handleLongPress = () => {
    Alert.alert("Copy Message", "Do you want to copy this message?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Copy",
        onPress: () => {
          // In a real app, you'd use Clipboard from '@react-native-clipboard/clipboard'
          // Copy functionality would be implemented here
        },
      },
    ]);
  };

  const bubbleStyles = [
    styles.bubble,
    isUser ? styles.userBubble : styles.assistantBubble,
    isDark ? styles.darkBubble : styles.lightBubble,
    isUser && isDark ? styles.darkUserBubble : {},
    !isUser && isDark ? styles.darkAssistantBubble : {},
    hasError ? styles.errorBubble : {},
  ];

  const textStyles = [
    styles.text,
    isUser ? styles.userText : styles.assistantText,
    isDark ? styles.darkText : styles.lightText,
    hasError ? styles.errorText : {},
  ];

  const markdownStyles = {
    body: {
      color: isDark
        ? isUser
          ? "#FFFFFF"
          : "#E5E5E7"
        : isUser
          ? "#FFFFFF"
          : "#000000",
      fontSize: 16,
      lineHeight: 20,
    },
    code_inline: {
      backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
      color: isDark ? "#FF9500" : "#AF52DE",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
    },
    code_block: {
      backgroundColor: isDark ? "#0D0D0F" : "#E5E5EA", // ✅ Darker in dark mode for distinction
      borderWidth: 1,
      borderColor: isDark ? "#3A3A3C" : "#D1D1D6", // ✅ Add border for definition
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    fence: {
      backgroundColor: isDark ? "#0D0D0F" : "#E5E5EA", // ✅ Darker in dark mode
      borderWidth: 1,
      borderColor: isDark ? "#3A3A3C" : "#D1D1D6", // ✅ Add border
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <Pressable onLongPress={handleLongPress} style={bubbleStyles}>
        {isUser ? (
          <Text style={textStyles}>{message.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        )}

        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Text
              style={[
                styles.loadingText,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              ●●●
            </Text>
          </View>
        )}

        <View style={styles.messageInfo}>
          <Text
            style={[
              styles.timestamp,
              isDark ? styles.darkTimestamp : styles.lightTimestamp,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}
          >
            {format(message.timestamp, "HH:mm")}
          </Text>

          {hasError && <Text style={styles.errorIndicator}>!</Text>}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2, // Tighter vertical spacing like iMessage
    marginHorizontal: 16,
    maxWidth: "75%", // Slightly smaller max width
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingHorizontal: 16, // More horizontal padding
    paddingVertical: 10, // Less vertical padding
    borderRadius: 20, // More rounded like iMessage
    minWidth: 60,
    // iMessage-style shadow
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Android shadow
  },
  userBubble: {
    backgroundColor: "#007AFF", // Keep iMessage blue
    // User bubbles have slightly different shape
    borderBottomRightRadius: 4, // ✅ More pronounced iMessage tail (was 6px)
  },
  assistantBubble: {
    backgroundColor: "#F0F0F0", // Lighter gray like iMessage
    // Assistant bubbles have tail on the left
    borderBottomLeftRadius: 4, // ✅ More pronounced iMessage tail (was 6px)
  },
  darkBubble: {
    // Base dark styling handled by specific bubble types
  },
  lightBubble: {
    // Base light styling handled by specific bubble types
  },
  darkUserBubble: {
    backgroundColor: "#007AFF", // Keep same blue in dark mode
    borderBottomRightRadius: 4, // ✅ More pronounced iMessage tail (was 6px)
  },
  darkAssistantBubble: {
    backgroundColor: "#2C2C2E", // Darker gray for dark mode
    borderBottomLeftRadius: 4, // ✅ More pronounced iMessage tail (was 6px)
  },
  errorBubble: {
    backgroundColor: "#FF3B30",
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#000000",
  },
  darkText: {
    color: "#FFFFFF",
  },
  lightText: {
    color: "#000000",
  },
  errorText: {
    color: "#FFFFFF",
  },
  messageInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11, // Slightly smaller like iMessage
    opacity: 0.7, // ✅ Higher opacity for better readability (WCAG compliance)
    marginTop: 2, // Small margin from bubble
  },
  darkTimestamp: {
    color: "#FFFFFF",
  },
  lightTimestamp: {
    color: "#000000",
  },
  userTimestamp: {
    color: "#FFFFFF",
  },
  assistantTimestamp: {
    // Uses dark/light color
  },
  errorIndicator: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#FF3B30",
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  loadingIndicator: {
    marginTop: 4,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
  },
});
