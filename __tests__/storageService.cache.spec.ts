/**
 * StorageService In-Memory Cache Tests
 *
 * Every chat mutation used to do a full AsyncStorage read → decrypt →
 * JSON.parse → validate pass. The cache (private to the operation queue)
 * makes the first mutation load + cache, and subsequent mutations reuse the
 * cached array — so a warm mutation must not re-read AsyncStorage.
 *
 * Invariants under test:
 * - warm cache: second mutation performs no AsyncStorage.getItem
 * - cache reflects mutations (no stale data between mutations)
 * - save failure invalidates the cache (next mutation re-reads storage)
 * - clearAllChats invalidates the cache
 * - load failure (corrupt payload) does not poison the cache
 * - public loadChats() never serves from the cache
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../src/services/storageService';
import type { Message } from '../src/types/chat';
import { makeChat, makeMessage, parseStoredChats } from './utils/storageTestUtils';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('StorageService in-memory chats cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    StorageService.invalidateChatCache();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  it('does not re-read AsyncStorage when the cache is warm', async () => {
    let currentStorage = JSON.stringify([makeChat('chat-1')]);
    mockAsyncStorage.getItem.mockImplementation(async () => currentStorage);
    mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
      currentStorage = value;
      return undefined;
    });

    await StorageService.addMessage('chat-1', makeMessage('msg-1'));
    expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);

    // Warm cache: the next two mutations must not hit AsyncStorage.getItem.
    await StorageService.addMessage('chat-1', makeMessage('msg-2'));
    await StorageService.updateMessage('chat-1', 'msg-1', { content: 'edited' });
    expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);

    // And the persisted state must still reflect all mutations.
    const finalChats = await parseStoredChats(currentStorage);
    expect(finalChats[0].messages.map((m: Message) => m.id)).toEqual([
      'msg-1',
      'msg-2',
    ]);
    expect(finalChats[0].messages[0].content).toBe('edited');
  });

  it('invalidates the cache when a save fails, forcing a fresh read', async () => {
    let currentStorage = JSON.stringify([makeChat('chat-1')]);
    mockAsyncStorage.getItem.mockImplementation(async () => currentStorage);
    mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
      currentStorage = value;
      return undefined;
    });

    // Warm the cache.
    await StorageService.addMessage('chat-1', makeMessage('msg-1'));
    expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);

    // Failed save: the cached array was mutated in place before the write,
    // so the cache can no longer be trusted.
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('disk full'));
    await expect(
      StorageService.addMessage('chat-1', makeMessage('msg-lost')),
    ).rejects.toThrow('disk full');

    // Next mutation must re-read storage (cache was dropped) and must not
    // resurrect the message from the failed save.
    await StorageService.addMessage('chat-1', makeMessage('msg-2'));
    expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(2);

    const finalChats = await parseStoredChats(currentStorage);
    const ids = finalChats[0].messages.map((m: Message) => m.id);
    expect(ids).toEqual(['msg-1', 'msg-2']);
    expect(ids).not.toContain('msg-lost');
  });

  it('invalidates the cache on clearAllChats', async () => {
    let currentStorage: string | null = JSON.stringify([makeChat('chat-1')]);
    mockAsyncStorage.getItem.mockImplementation(async () => currentStorage);
    mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
      currentStorage = value;
      return undefined;
    });
    mockAsyncStorage.removeItem.mockImplementation(async () => {
      currentStorage = null;
      return undefined;
    });

    await StorageService.addMessage('chat-1', makeMessage('msg-1'));
    expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);

    await StorageService.clearAllChats();

    // After a clear, the cache must not serve the deleted chat.
    await expect(
      StorageService.addMessage('chat-1', makeMessage('msg-2')),
    ).rejects.toThrow('Chat not found');
    expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(2);
  });

  it('does not cache when the load fails (corrupt payload is not poisoned in)', async () => {
    // Corrupt payload: mutation-level loads recover to [] (backup + clear),
    // so addMessage fails with Chat not found — and nothing may be cached
    // from the failed/recovered load.
    mockAsyncStorage.getItem.mockResolvedValue('not valid json {{{');

    await expect(
      StorageService.addMessage('chat-1', makeMessage('msg-1')),
    ).rejects.toThrow('Chat not found');

    // Storage now "repaired" externally: the next mutation must read the
    // fresh payload instead of any cached remnant of the corrupt load.
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([makeChat('chat-1')]),
    );
    let savedPayload: string | null = null;
    mockAsyncStorage.setItem.mockImplementation(async (key, value) => {
      if (key === '@chat_dns_chats') savedPayload = value;
      return undefined;
    });

    await StorageService.addMessage('chat-1', makeMessage('msg-1'));
    const chats = await parseStoredChats(savedPayload!);
    expect(chats[0].messages.map((m: Message) => m.id)).toEqual(['msg-1']);
  });

  it('public loadChats() always reads storage, even when the cache is warm', async () => {
    let currentStorage = JSON.stringify([makeChat('chat-1')]);
    mockAsyncStorage.getItem.mockImplementation(async () => currentStorage);
    mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
      currentStorage = value;
      return undefined;
    });

    await StorageService.addMessage('chat-1', makeMessage('msg-1'));
    const getItemCallsAfterMutation =
      mockAsyncStorage.getItem.mock.calls.length;

    // loadChats() runs outside the operation queue and must stay a direct
    // storage read (populating/reading the cache there could race a queued
    // mutation).
    const loaded = await StorageService.loadChats();
    expect(mockAsyncStorage.getItem.mock.calls.length).toBeGreaterThan(
      getItemCallsAfterMutation,
    );
    expect(loaded[0]?.messages.map((m) => m.id)).toEqual(['msg-1']);
  });
});
