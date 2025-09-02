import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { DNSService } from "../../../services/dnsService";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
}

export function FirstChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI assistant. Try sending me a message to see how DNS magic works! 🌟",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriedChat, setHasTriedChat] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isUser: false,
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputText("");
    setIsLoading(true);
    setHasTriedChat(true);

    try {
      // For onboarding, we use real DNS methods only (enableMockDNS = false)
      // This ensures users see real DNS behavior, not mock responses
      const response = await DNSService.queryLLM(
        inputText.trim(),
        undefined,
        undefined,
        undefined,
        false,
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, text: response, status: "sent" }
            : msg,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                text: "Great! You've successfully sent your first DNS message. In a real scenario, this would return an AI response via DNS TXT records. The magic is that your message traveled through the DNS infrastructure! 🎉",
                status: "sent",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedMessages = [
    "What is DNS?",
    "How does this app work?",
    "Tell me something interesting!",
    "What can you help me with?",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.icon}>💬</Text>

          <Text
            style={[
              styles.title,
              isDark ? styles.darkTitle : styles.lightTitle,
            ]}
          >
            Try Your First Chat
          </Text>

          <Text
            style={[
              styles.subtitle,
              isDark ? styles.darkSubtitle : styles.lightSubtitle,
            ]}
          >
            Send a message and watch it travel through DNS
          </Text>
        </View>

        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isDark={isDark} />
          ))}

          {!hasTriedChat && (
            <View style={styles.suggestionsContainer}>
              <Text
                style={[
                  styles.suggestionsTitle,
                  isDark
                    ? styles.darkSuggestionsTitle
                    : styles.lightSuggestionsTitle,
                ]}
              >
                Try one of these:
              </Text>
              {suggestedMessages.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionButton,
                    isDark
                      ? styles.darkSuggestionButton
                      : styles.lightSuggestionButton,
                  ]}
                  onPress={() => setInputText(suggestion)}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      isDark
                        ? styles.darkSuggestionText
                        : styles.lightSuggestionText,
                    ]}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.inputContainer,
            isDark ? styles.darkInputContainer : styles.lightInputContainer,
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              isDark ? styles.darkTextInput : styles.lightTextInput,
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={isDark ? "#666666" : "#999999"}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              isDark ? styles.darkSendButton : styles.lightSendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>{isLoading ? "⏳" : "🚀"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <OnboardingNavigation
        nextButtonText={hasTriedChat ? "Amazing! Continue" : "Skip Tutorial"}
      />
    </KeyboardAvoidingView>
  );
}

interface MessageBubbleProps {
  message: Message;
  isDark: boolean;
}

function MessageBubble({ message, isDark }: MessageBubbleProps) {
  return (
    <View
      style={[
        styles.messageContainer,
        message.isUser
          ? styles.userMessageContainer
          : styles.assistantMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser
            ? isDark
              ? styles.darkUserBubble
              : styles.lightUserBubble
            : isDark
              ? styles.darkAssistantBubble
              : styles.lightAssistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser
              ? styles.userMessageText
              : isDark
                ? styles.darkAssistantMessageText
                : styles.lightAssistantMessageText,
          ]}
        >
          {message.text}
        </Text>

        {message.status === "sending" && (
          <Text style={styles.statusText}>Sending via DNS...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  icon: {
    fontSize: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  lightTitle: {
    color: "#000000",
  },
  darkTitle: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  lightSubtitle: {
    color: "#666666",
  },
  darkSubtitle: {
    color: "#999999",
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  lightUserBubble: {
    backgroundColor: "#007AFF",
  },
  darkUserBubble: {
    backgroundColor: "#0A84FF",
  },
  lightAssistantBubble: {
    backgroundColor: "#F2F2F7",
  },
  darkAssistantBubble: {
    backgroundColor: "#2C2C2E",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  lightAssistantMessageText: {
    color: "#000000",
  },
  darkAssistantMessageText: {
    color: "#FFFFFF",
  },
  statusText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    fontStyle: "italic",
    color: "#666666",
  },
  suggestionsContainer: {
    marginTop: 20,
    gap: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  lightSuggestionsTitle: {
    color: "#666666",
  },
  darkSuggestionsTitle: {
    color: "#999999",
  },
  suggestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  lightSuggestionButton: {
    backgroundColor: "#F9F9F9",
    borderColor: "#E5E5EA",
  },
  darkSuggestionButton: {
    backgroundColor: "#2C2C2E",
    borderColor: "#48484A",
  },
  suggestionText: {
    fontSize: 14,
  },
  lightSuggestionText: {
    color: "#007AFF",
  },
  darkSuggestionText: {
    color: "#0A84FF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 16,
  },
  lightInputContainer: {
    backgroundColor: "#F2F2F7",
  },
  darkInputContainer: {
    backgroundColor: "#2C2C2E",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  lightTextInput: {
    color: "#000000",
  },
  darkTextInput: {
    color: "#FFFFFF",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  lightSendButton: {
    backgroundColor: "#007AFF",
  },
  darkSendButton: {
    backgroundColor: "#0A84FF",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 18,
  },
});
