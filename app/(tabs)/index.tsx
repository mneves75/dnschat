import { Stack, useRouter } from "expo-router";
import { useChat } from "../../src/context/ChatContext";
import { GlassChatList } from "../../src/navigation/screens/GlassChatList";

export default function ChatListRoute() {
  const router = useRouter();
  const { createChat, setCurrentChat } = useChat();

  const handleNewChat = async () => {
    const newChat = await createChat();
    setCurrentChat(newChat);
    router.push({
      pathname: "/chat/[threadId]",
      params: { threadId: newChat.id },
    });
  };

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="square.and.pencil" onPress={handleNewChat} />
      </Stack.Toolbar>
      <GlassChatList />
    </>
  );
}
