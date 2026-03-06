import React from "react";
import { Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useChat } from "../../src/context/ChatContext";
import { useTranslation } from "../../src/i18n";
import { GlassChatList } from "../../src/navigation/screens/GlassChatList";

export default function ChatListRoute() {
  const router = useRouter();
  const { createChat, setCurrentChat } = useChat();
  const { t } = useTranslation();
  const [isCreatingChat, setIsCreatingChat] = React.useState(false);

  const handleNewChat = async () => {
    if (isCreatingChat) {
      return;
    }

    setIsCreatingChat(true);
    try {
      const newChat = await createChat();
      setCurrentChat(newChat);
      router.push({
        pathname: "/chat/[threadId]",
        params: { threadId: newChat.id },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create chat";
      Alert.alert("Unable to create chat", message);
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="square.and.pencil"
          onPress={handleNewChat}
          disabled={isCreatingChat}
          accessibilityLabel={t("navigation.toolbar.newChat")}
        />
      </Stack.Toolbar>
      <GlassChatList />
    </>
  );
}
