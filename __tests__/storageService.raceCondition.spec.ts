/**
 * StorageService Race Condition Tests
 *
 * These tests verify that the operation queue properly serializes
 * concurrent AsyncStorage operations to prevent data loss.
 *
 * Root cause being tested:
 *   Without the queue, concurrent calls to addMessage() would each
 *   loadChats() → modify → saveChats(), potentially overwriting
 *   each other's changes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { decryptIfEncrypted } from '../src/services/encryptionService';
import { StorageService } from '../src/services/storageService';
import type { Message } from '../src/types/chat';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock uuid to generate predictable IDs
jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const parseStoredChats = async (payload: string) =>
  JSON.parse(await decryptIfEncrypted(payload));

describe('StorageService Race Condition Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset internal storage state
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  describe('Operation Queue Serialization', () => {
    it('serializes concurrent addMessage calls to prevent data loss', async () => {
      // Setup: Create a chat first
      const chatId = 'chat-1';
      const initialChat = {
        id: chatId,
        title: 'Test Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      // Track all saveChats calls to verify serialization
      const saveCallOrder: string[] = [];
      let currentStorage = JSON.stringify([initialChat]);

      mockAsyncStorage.getItem.mockImplementation(async () => {
        // Simulate small delay to make race condition more likely without queue
        await new Promise((r) => setTimeout(r, 5));
        return currentStorage;
      });

      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        // Record the message IDs in this save call
        const chats = await parseStoredChats(value);
        const msgIds = chats[0]?.messages?.map((m: Message) => m.id) || [];
        saveCallOrder.push(msgIds.join(','));
        currentStorage = value;
        return undefined;
      });

      // Create messages
      const createMessage = (id: string): Message => ({
        id,
        content: `Message ${id}`,
        role: 'user',
        timestamp: new Date(),
        status: 'sent',
      });

      const msg1 = createMessage('msg-1');
      const msg2 = createMessage('msg-2');
      const msg3 = createMessage('msg-3');

      // Fire all three addMessage calls concurrently
      // Without the queue, these would race and potentially lose messages
      await Promise.all([
        StorageService.addMessage(chatId, msg1),
        StorageService.addMessage(chatId, msg2),
        StorageService.addMessage(chatId, msg3),
      ]);

      // Verify all messages were saved (serialized, so each save builds on previous)
      expect(saveCallOrder).toHaveLength(3);

      // Parse final storage state
      const finalChats = await parseStoredChats(currentStorage);
      expect(finalChats[0].messages).toHaveLength(3);

      // All three messages should be present
      const savedMsgIds = finalChats[0].messages.map((m: Message) => m.id);
      expect(savedMsgIds).toContain('msg-1');
      expect(savedMsgIds).toContain('msg-2');
      expect(savedMsgIds).toContain('msg-3');
    });

    it('serializes mixed operations (create, add, update, delete)', async () => {
      const operationOrder: string[] = [];
      let currentStorage = '[]';

      mockAsyncStorage.getItem.mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 2));
        return currentStorage;
      });

      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        const chats = await parseStoredChats(value);
        operationOrder.push(`save:${chats.length}chats`);
        currentStorage = value;
        return undefined;
      });

      mockAsyncStorage.removeItem.mockImplementation(async () => {
        operationOrder.push('clear');
        currentStorage = '[]';
        return undefined;
      });

      // Fire mixed operations concurrently
      const chat1Promise = StorageService.createChat('Chat 1');
      const chat2Promise = StorageService.createChat('Chat 2');
      const clearPromise = StorageService.clearAllChats();

      // Wait for all to complete
      const [chat1, chat2] = await Promise.all([
        chat1Promise,
        chat2Promise,
        clearPromise,
      ]);

      // Verify operations were serialized (each built on previous state)
      // Order should be: create1 -> create2 -> clear
      expect(operationOrder).toEqual([
        'save:1chats', // First create
        'save:2chats', // Second create
        'clear', // Clear all
      ]);

      // Final state should be empty (cleared)
      const finalChats = await parseStoredChats(currentStorage);
      expect(finalChats).toEqual([]);

      // But we should have gotten valid chat objects back from create
      expect(chat1).toHaveProperty('id');
      expect(chat2).toHaveProperty('id');
    });

    it('continues queue after operation throws error', async () => {
      const chatId = 'chat-1';
      const initialChat = {
        id: chatId,
        title: 'Test Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      let currentStorage = JSON.stringify([initialChat]);
      const successfulOps: string[] = [];

      mockAsyncStorage.getItem.mockImplementation(async () => currentStorage);

      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        const chats = await parseStoredChats(value);
        successfulOps.push(`save:${chats[0]?.messages?.length || 0}msgs`);
        currentStorage = value;
        return undefined;
      });

      const msg1: Message = {
        id: 'msg-1',
        content: 'First message',
        role: 'user',
        timestamp: new Date(),
        status: 'sent',
      };

      const msg2: Message = {
        id: 'msg-2',
        content: 'Second message',
        role: 'user',
        timestamp: new Date(),
        status: 'sent',
      };

      // First operation succeeds
      // Second operation fails (non-existent chat)
      // Third operation succeeds
      const results = await Promise.allSettled([
        StorageService.addMessage(chatId, msg1),
        StorageService.addMessage('non-existent-chat', msg2),
        StorageService.addMessage(chatId, msg2),
      ]);

      // First and third should succeed, second should fail
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');

      // Queue should have continued - two successful saves
      expect(successfulOps).toEqual(['save:1msgs', 'save:2msgs']);

      // Final state should have 2 messages
      const finalChats = await parseStoredChats(currentStorage);
      expect(finalChats[0].messages).toHaveLength(2);
    });
  });

  describe('Individual Operation Correctness', () => {
    it('createChat adds chat to beginning of list', async () => {
      const existingChat = {
        id: 'existing',
        title: 'Existing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([existingChat]));

      let savedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        savedData = value;
        return undefined;
      });

      const newChat = await StorageService.createChat('New Chat');

      expect(newChat.title).toBe('New Chat');
      expect(newChat.messages).toEqual([]);

      const chats = await parseStoredChats(savedData!);
      expect(chats).toHaveLength(2);
      expect(chats[0].id).toBe(newChat.id); // New chat at beginning
      expect(chats[1].id).toBe('existing');
    });

    it('updateMessage preserves other messages', async () => {
      const chatId = 'chat-1';
      const chat = {
        id: chatId,
        title: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          { id: 'msg-1', content: 'First', role: 'user', timestamp: new Date().toISOString(), status: 'sent' },
          { id: 'msg-2', content: 'Second', role: 'assistant', timestamp: new Date().toISOString(), status: 'sent' },
        ],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([chat]));

      let savedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        savedData = value;
        return undefined;
      });

      await StorageService.updateMessage(chatId, 'msg-1', { content: 'Updated First' });

      const chats = await parseStoredChats(savedData!);
      expect(chats[0].messages[0].content).toBe('Updated First');
      expect(chats[0].messages[1].content).toBe('Second'); // Unchanged
    });

    it('deleteChat removes only specified chat', async () => {
      const chats = [
        { id: 'chat-1', title: 'First', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] },
        { id: 'chat-2', title: 'Second', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] },
        { id: 'chat-3', title: 'Third', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(chats));

      let savedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        savedData = value;
        return undefined;
      });

      await StorageService.deleteChat('chat-2');

      const savedChats = await parseStoredChats(savedData!);
      expect(savedChats).toHaveLength(2);
      expect(savedChats.map((c: { id: string }) => c.id)).toEqual(['chat-1', 'chat-3']);
    });
  });

  describe('Error Handling', () => {
    it('throws error when adding message to non-existent chat', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      const msg: Message = {
        id: 'msg-1',
        content: 'Test',
        role: 'user',
        timestamp: new Date(),
        status: 'sent',
      };

      await expect(StorageService.addMessage('non-existent', msg)).rejects.toThrow(
        'Chat not found'
      );
    });

    it('throws error when updating message in non-existent chat', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      await expect(
        StorageService.updateMessage('non-existent', 'msg-1', { content: 'Updated' })
      ).rejects.toThrow('Chat not found');
    });

    it('throws error when updating non-existent message', async () => {
      const chat = {
        id: 'chat-1',
        title: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([chat]));

      await expect(
        StorageService.updateMessage('chat-1', 'non-existent', { content: 'Updated' })
      ).rejects.toThrow('Message not found');
    });
  });

  describe('Title Auto-generation', () => {
    it('generates title from first user message', async () => {
      const chat = {
        id: 'chat-1',
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([chat]));

      let savedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        savedData = value;
        return undefined;
      });

      const msg: Message = {
        id: 'msg-1',
        content: 'Hello, how can you help me with DNS queries?',
        role: 'user',
        timestamp: new Date(),
        status: 'sent',
      };

      await StorageService.addMessage('chat-1', msg);

      const chats = await parseStoredChats(savedData!);
      expect(chats[0].title).toBe('Hello, how can you help me with DNS queries?');
    });

    it('truncates long messages for title with ellipsis', async () => {
      const chat = {
        id: 'chat-1',
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([chat]));

      let savedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        savedData = value;
        return undefined;
      });

      const longContent =
        'This is a very long message that exceeds fifty characters and should be truncated';
      const msg: Message = {
        id: 'msg-1',
        content: longContent,
        role: 'user',
        timestamp: new Date(),
        status: 'sent',
      };

      await StorageService.addMessage('chat-1', msg);

      const chats = await parseStoredChats(savedData!);
      // slice(0, 50) = 50 chars, + '...' = 53 total
      expect(chats[0].title).toBe('This is a very long message that exceeds fifty cha...');
      expect(chats[0].title.length).toBe(53);
    });

    it('does not change title for assistant first message', async () => {
      const chat = {
        id: 'chat-1',
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([chat]));

      let savedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        savedData = value;
        return undefined;
      });

      const msg: Message = {
        id: 'msg-1',
        content: 'Welcome! How can I help you?',
        role: 'assistant',
        timestamp: new Date(),
        status: 'sent',
      };

      await StorageService.addMessage('chat-1', msg);

      const chats = await parseStoredChats(savedData!);
      expect(chats[0].title).toBe('New Chat'); // Unchanged
    });
  });
});
