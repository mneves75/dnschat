import React from "react";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Share, Alert } from "react-native";
import { Chat } from "../../src/navigation/screens/Chat";
import { useChat } from "../../src/context/ChatContext";
import { useTranslation } from "../../src/i18n";
import { resolveRouteChat } from "../../src/utils/chatRoute";
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
    deleteChat,
  } = useChat();
  const normalizedThreadId = normalizeRouteParam(threadId);
  const [isResolving, setIsResolving] = React.useState(false);
  const lastAttemptedRef = React.useRef<string | null>(null);
  const routeChat = React.useMemo(
    () => resolveRouteChat(chats, currentChat, normalizedThreadId),
    [chats, currentChat, normalizedThreadId],
  );

  // Effect: load chats lazily when a thread route is hit without cached data.
  React.useEffect(() => {
    if (!normalizedThreadId || isLoading || chats.length > 0) {
      return;
    }

    loadChats().catch((error) => {
      devWarn("[ChatRoute] Failed to load chats", error);
    });
  }, [chats.length, isLoading, loadChats, normalizedThreadId]);

  // Effect: resolve the route thread id into a chat or create one and redirect.
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

  const handleShare = async () => {
    if (!routeChat) return;
    const messages = routeChat.messages
      .map((m) => `${m.role === "user" ? "You" : "AI"}: ${m.content}`)
      .join("\n\n");
    await Share.share({ message: messages, title: routeChat.title });
  };

  const handleClearChat = () => {
    if (!routeChat) return;
    Alert.alert(
      t("common.clear"),
      t("screen.glassChatList.alerts.deleteMessage", { title: routeChat.title }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.clear"),
          style: "destructive",
          onPress: () => deleteChat(routeChat.id),
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen.Title>{routeChat?.title ?? ""}</Stack.Screen.Title>
      {routeChat ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu icon="ellipsis.circle">
            <Stack.Toolbar.MenuAction icon="square.and.arrow.up" onPress={handleShare}>
              {t("screen.chat.messageActions.share")}
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction icon="trash" destructive onPress={handleClearChat}>
              {t("common.clear")}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      ) : null}
      <Link.AppleZoomTarget>
        <Chat />
      </Link.AppleZoomTarget>
    </>
  );
}
