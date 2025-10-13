import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Conversation, Message } from '@/context/MessageProvider';

const STORAGE_KEY = 'dnschat-ng/conversations/v2';

type PersistedMessage = Omit<Message, 'createdAt'> & { createdAt: string };
type PersistedConversation = Omit<Conversation, 'lastMessageAt' | 'messages'> & {
  lastMessageAt: string;
  messages: PersistedMessage[];
};

const asIsoString = (value: number) => new Date(value).toISOString();

const serializeConversation = (conversation: Conversation): PersistedConversation => ({
  ...conversation,
  lastMessageAt: asIsoString(conversation.lastMessageAt),
  messages: conversation.messages.map((message) => ({
    ...message,
    createdAt: asIsoString(message.createdAt)
  }))
});

const parseIso = (value: string, fallback: number) => {
  const result = Date.parse(value);
  return Number.isFinite(result) ? result : fallback;
};

const deserializeConversation = (conversation: PersistedConversation): Conversation => {
  const fallback = Date.now();
  return {
    ...conversation,
    lastMessageAt: parseIso(conversation.lastMessageAt, fallback),
    messages: conversation.messages.map((message) => ({
      ...message,
      createdAt: parseIso(message.createdAt, fallback)
    }))
  };
};

export async function loadConversations(): Promise<Conversation[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(deserializeConversation);
  } catch (error) {
    console.warn('[ConversationStorage] Failed to load conversations', error);
    return [];
  }
}

export async function saveConversations(conversations: Conversation[]): Promise<void> {
  try {
    const serialized = conversations.map(serializeConversation);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.warn('[ConversationStorage] Failed to persist conversations', error);
  }
}

export async function clearConversations(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[ConversationStorage] Failed to clear conversations', error);
  }
}
