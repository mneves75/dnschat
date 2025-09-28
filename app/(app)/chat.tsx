import { Stack } from 'expo-router';

import { Chat } from '../../src/screens/Chat';

export default function ChatScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Chat' }} />
      <Chat />
    </>
  );
}
