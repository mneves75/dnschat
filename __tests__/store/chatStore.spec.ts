import { useChatStore } from '../../src/store/useChatStore';

const resetStore = () => {
  const { setState } = useChatStore;
  setState({ chats: [], currentChatId: null, isLoading: false, error: null });
};

describe('useChatStore chat deletion fallback', () => {
  beforeEach(() => {
    resetStore();
  });

  it('selects the next available chat when the current chat is deleted', async () => {
    const store = useChatStore.getState();

    const firstChat = await store.createChat('First Chat');
    const secondChat = await store.createChat('Second Chat');

    store.setCurrentChatId(secondChat.id);

    await store.deleteChat(secondChat.id);

    const { currentChatId, chats } = useChatStore.getState();

    expect(chats).toHaveLength(1);
    expect(chats[0].id).toBe(firstChat.id);
    expect(currentChatId).toBe(firstChat.id);
  });

  it('falls back to the next most recent chat when more than two exist', async () => {
    const store = useChatStore.getState();

    const firstChat = await store.createChat('First Chat');
    const secondChat = await store.createChat('Second Chat');
    const thirdChat = await store.createChat('Third Chat');

    store.setCurrentChatId(secondChat.id);

    await store.deleteChat(secondChat.id);

    const { currentChatId, chats } = useChatStore.getState();

    expect(chats).toHaveLength(2);
    // Chats are stored newest first; after deleting the middle chat we expect
    // the most recent (thirdChat) to remain selected.
    expect(chats[0].id).toBe(thirdChat.id);
    expect(chats[1].id).toBe(firstChat.id);
    expect(currentChatId).toBe(thirdChat.id);
  });

  it('clears the active chat when the last conversation is deleted', async () => {
    const store = useChatStore.getState();

    const onlyChat = await store.createChat('Solo Chat');
    store.setCurrentChatId(onlyChat.id);

    await store.deleteChat(onlyChat.id);

    const { currentChatId, chats } = useChatStore.getState();

    expect(chats).toHaveLength(0);
    expect(currentChatId).toBeNull();
  });
});
