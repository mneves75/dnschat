import React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Chat } from "../../src/navigation/screens/Chat";
import { useChat } from "../../src/context/ChatContext";
import { useTranslation } from "../../src/i18n";
import { normalizeRouteParam } from "../../src/utils/routeParams";
import { devWarn } from "../../src/utils/devLog";

export default function ChatRoute() {
  const { threadId } = useLocalSearchParams<{
    threadId?: string | string[];
  }>();
  const router = useRouter();
  const { t } = useTranslation();
  const {
    chats,
    currentChat,
    isLoading,
    loadChats,
    setCurrentChat,
    createChat,
  } = useChat();
  const normalizedThreadId = normalizeRouteParam(threadId);
  const [isResolving, setIsResolving] = React.useState(false);
  const lastAttemptedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!normalizedThreadId || isLoading || chats.length > 0) {
      return;
    }

    loadChats().catch((error) => {
      devWarn("[ChatRoute] Failed to load chats", error);
    });
  }, [chats.length, isLoading, loadChats, normalizedThreadId]);

  React.useEffect(() => {
    if (isLoading || isResolving) {
      return;
    }

    const targetId = normalizedThreadId;

    if (!targetId) {
      if (!currentChat) {
        if (lastAttemptedRef.current === "new") {
          return;
        }
        lastAttemptedRef.current = "new";
        setIsResolving(true);
        createChat()
          .then((chat) => {
            setCurrentChat(chat);
            router.replace({
              pathname: "/chat/[threadId]",
              params: { threadId: chat.id },
            });
          })
          .catch((error) => {
            devWarn("[ChatRoute] Failed to create chat", error);
          })
          .finally(() => setIsResolving(false));
      }
      return;
    }

    const matching = chats.find((chat) => chat.id === targetId);
    if (matching) {
      if (currentChat?.id !== matching.id) {
        setCurrentChat(matching);
      }
      return;
    }

    if (lastAttemptedRef.current === targetId) {
      return;
    }
    lastAttemptedRef.current = targetId;
    setIsResolving(true);
    createChat()
      .then((chat) => {
        setCurrentChat(chat);
        router.replace({
          pathname: "/chat/[threadId]",
          params: { threadId: chat.id },
        });
      })
      .catch((error) => {
        devWarn("[ChatRoute] Failed to recover chat", error);
      })
      .finally(() => setIsResolving(false));
  }, [
    chats,
    createChat,
    currentChat,
    isLoading,
    isResolving,
    normalizedThreadId,
    router,
    setCurrentChat,
  ]);

  return (
    <>
      <Stack.Screen options={{ title: t("screen.chat.navigationTitle") }} />
      <Chat />
    </>
  );
}
