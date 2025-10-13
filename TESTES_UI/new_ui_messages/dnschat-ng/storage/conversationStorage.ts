import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Conversation } from '@/context/MessageProvider';

const STORAGE_KEY = 'dnschat-ng/conversations/v1';

export async function loadConversations(): Promise<Conversation[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Conversation[];
  } catch (error) {
    console.warn('[ConversationStorage] Failed to load conversations', error);
    return null;
  }
}

export async function saveConversations(conversations: Conversation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
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
