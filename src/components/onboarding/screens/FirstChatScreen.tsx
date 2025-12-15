import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { DNSService } from "../../../services/dnsService";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../../i18n";
import { SendIcon } from "../../icons/SendIcon";
import { devWarn } from "../../../utils/devLog";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
}

export function FirstChatScreen() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { t } = useTranslation();
  const isMountedRef = useRef(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: t("screen.onboarding.firstChat.welcomeMessage"),
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriedChat, setHasTriedChat] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
      const response = await DNSService.queryLLM(
        inputText.trim(),
        undefined,
        false,
        true,
      );

      if (!isMountedRef.current) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, text: response, status: "sent" }
            : msg,
        ),
      );
    } catch (error) {
      devWarn("[FirstChatScreen] DNS query failed", error);

      if (!isMountedRef.current) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                text: t("screen.onboarding.firstChat.successMessage"),
                status: "sent",
              }
            : msg,
        ),
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const suggestedMessages = [
    t("screen.onboarding.firstChat.suggestions.option1"),
    t("screen.onboarding.firstChat.suggestions.option2"),
    t("screen.onboarding.firstChat.suggestions.option3"),
    t("screen.onboarding.firstChat.suggestions.option4"),
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={[typography.displayMedium, { color: palette.accentTint }]}>
            {t("screen.onboarding.firstChat.label")}
          </Text>

          <Text
            style={[
              typography.title1,
              styles.title,
              { color: palette.textPrimary },
            ]}
          >
            {t("screen.onboarding.firstChat.title")}
          </Text>

          <Text
            style={[
              typography.callout,
              styles.subtitle,
              { color: palette.textSecondary },
            ]}
          >
            {t("screen.onboarding.firstChat.subtitle")}
          </Text>
        </View>

        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              palette={palette}
              typography={typography}
            />
          ))}

          {/* iOS HIG: Show message suggestions before first chat attempt */}
          {!hasTriedChat && (
            <View style={styles.suggestionsContainer}>
              <Text
                style={[
                  typography.footnote,
                  styles.suggestionsTitle,
                  { color: palette.textSecondary, fontWeight: "600" },
                ]}
              >
                {t("screen.onboarding.firstChat.suggestions.title")}
              </Text>
              {suggestedMessages.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionButton,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                  ]}
                  onPress={() => setInputText(suggestion)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Suggestion: ${suggestion}`}
                  accessibilityHint="Fills the message input with this suggested question"
                >
                  <Text
                    style={[
                      typography.callout,
                      styles.suggestionText,
                      { color: palette.accentTint },
                    ]}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* iOS HIG: Message input with send button */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <TextInput
            style={[
              typography.callout,
              styles.textInput,
              { color: palette.textPrimary },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t("screen.onboarding.firstChat.input.placeholder")}
            placeholderTextColor={palette.textTertiary}
            multiline
            maxLength={200}
            accessibilityLabel="Message input"
            accessibilityHint="Type your message to send via DNS. Maximum 200 characters."
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  !inputText.trim() || isLoading
                    ? palette.textTertiary
                    : palette.accentTint,
              },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? "Sending message" : "Send message"}
            accessibilityHint="Sends your message through DNS TXT query"
            accessibilityState={{
              disabled: !inputText.trim() || isLoading,
              busy: isLoading,
            }}
          >
            {isLoading ? (
              <Text style={[typography.headline, { color: palette.solid }]}>...</Text>
            ) : (
              <SendIcon size={20} isActive={!!inputText.trim()} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <OnboardingNavigation
        nextButtonText={hasTriedChat ? t("screen.onboarding.firstChat.navigation.continue") : t("screen.onboarding.firstChat.navigation.skip")}
      />
    </KeyboardAvoidingView>
  );
}

interface MessageBubbleProps {
  message: Message;
  palette: ReturnType<typeof useImessagePalette>;
  typography: ReturnType<typeof useTypography>;
}

function MessageBubble({ message, palette, typography }: MessageBubbleProps) {
  const { t } = useTranslation();

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
          {
            backgroundColor: message.isUser
              ? palette.accentTint
              : palette.surface,
            borderColor: message.isUser ? palette.transparent : palette.border,
          },
        ]}
      >
        <Text
          style={[
            typography.callout,
            styles.messageText,
            {
              color: message.isUser ? palette.solid : palette.textPrimary,
            },
          ]}
        >
          {message.text}
        </Text>

        {message.status === "sending" && (
          <Text
            style={[
              typography.caption1,
              styles.statusText,
              { color: palette.textTertiary },
            ]}
          >
            {t("screen.onboarding.firstChat.input.sendingVia")}
          </Text>
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
    paddingHorizontal: LiquidGlassSpacing.md,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: LiquidGlassSpacing.lg,
    paddingBottom: LiquidGlassSpacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: LiquidGlassSpacing.xs,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: LiquidGlassSpacing.md,
  },
  messageContainer: {
    marginVertical: LiquidGlassSpacing.xxs,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: 18,
    borderWidth: 1,
  },
  messageText: {
    lineHeight: 20,
  },
  statusText: {
    marginTop: LiquidGlassSpacing.xxs,
    fontStyle: "italic",
  },
  suggestionsContainer: {
    marginTop: LiquidGlassSpacing.lg,
    gap: LiquidGlassSpacing.xs,
  },
  suggestionsTitle: {
    marginBottom: LiquidGlassSpacing.xs,
  },
  suggestionButton: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: LiquidGlassSpacing.lg,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  suggestionText: {
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: LiquidGlassSpacing.sm,
    paddingVertical: LiquidGlassSpacing.xs,
    borderRadius: LiquidGlassSpacing.xl,
    marginBottom: LiquidGlassSpacing.md,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: LiquidGlassSpacing.xs,
  },
});
