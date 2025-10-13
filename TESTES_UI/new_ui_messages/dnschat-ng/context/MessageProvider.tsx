import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react';

import { loadConversations, saveConversations } from '@/storage/conversationStorage';

type Participant = {
  id: string;
  name: string;
};

export type Message = {
  id: string;
  conversationId: string;
  authorId: string;
  text: string;
  createdAt: number;
  status: 'sent' | 'received';
};

export type Conversation = {
  id: string;
  title: string;
  participants: Participant[];
  messages: Message[];
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageAt: number;
};

type MessageState = {
  conversations: Conversation[];
};

type Action =
  | { type: 'SEND_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'RECEIVE_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'MARK_READ'; payload: { conversationId: string } }
  | { type: 'REFRESH' }
  | { type: 'HYDRATE'; payload: { conversations: Conversation[] } };

type MessageContextValue = {
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  markConversationRead: (conversationId: string) => void;
  refreshConversations: () => Promise<void>;
  getConversation: (conversationId: string) => Conversation | undefined;
  isHydrated: boolean;
};

const MessageContext = createContext<MessageContextValue | undefined>(undefined);

const SELF_ID = 'me';

const replyPool = [
  'Sounds good! I can circle back this afternoon.',
  'Let me check on that and get back to you.',
  'Perfect, thanks for the update.',
  '😂 love it. Sending it your way now.',
  'Can we ship this by tomorrow?',
  'Copy that. Ping me if you need anything else.',
  'On a call atm, I will reply in 10.',
  'That screenshot looks great!'
];

const seedParticipants: Record<string, Participant> = {
  me: { id: SELF_ID, name: 'You' },
  ana: { id: 'ana', name: 'Ana Bridges' },
  devon: { id: 'devon', name: 'Devon Carter' },
  priya: { id: 'priya', name: 'Priya Patel' },
  max: { id: 'max', name: 'Max Ortega' },
  june: { id: 'june', name: 'June Park' }
};

const seedConversations: Conversation[] = [
  {
    id: 'thread-ana',
    title: 'Ana Bridges',
    participants: [seedParticipants.me, seedParticipants.ana],
    lastMessagePreview: 'See you at studio around 5?',
    lastMessageAt: Date.now() - 1000 * 60 * 12,
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        conversationId: 'thread-ana',
        authorId: 'ana',
        text: 'See you at studio around 5?',
        createdAt: Date.now() - 1000 * 60 * 12,
        status: 'received'
      },
      {
        id: 'm2',
        conversationId: 'thread-ana',
        authorId: SELF_ID,
        text: 'Locked in. I will bring the new DNS logs.',
        createdAt: Date.now() - 1000 * 60 * 15,
        status: 'sent'
      }
    ]
  },
  {
    id: 'thread-devon',
    title: 'Devon Carter',
    participants: [seedParticipants.me, seedParticipants.devon],
    lastMessagePreview: 'Just pushed the Liquid Glass experiment. Thoughts?',
    lastMessageAt: Date.now() - 1000 * 60 * 45,
    unreadCount: 2,
    messages: [
      {
        id: 'm3',
        conversationId: 'thread-devon',
        authorId: 'devon',
        text: 'Just pushed the Liquid Glass experiment. Thoughts?',
        createdAt: Date.now() - 1000 * 60 * 45,
        status: 'received'
      },
      {
        id: 'm4',
        conversationId: 'thread-devon',
        authorId: SELF_ID,
        text: 'Reviewing now!',
        createdAt: Date.now() - 1000 * 60 * 50,
        status: 'sent'
      }
    ]
  },
  {
    id: 'thread-priya',
    title: 'Priya Patel',
    participants: [seedParticipants.me, seedParticipants.priya],
    lastMessagePreview: 'Need any logs before standup?',
    lastMessageAt: Date.now() - 1000 * 60 * 90,
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        conversationId: 'thread-priya',
        authorId: 'priya',
        text: 'Need any logs before standup?',
        createdAt: Date.now() - 1000 * 60 * 90,
        status: 'received'
      },
      {
        id: 'm6',
        conversationId: 'thread-priya',
        authorId: SELF_ID,
        text: 'All good, thanks!',
        createdAt: Date.now() - 1000 * 60 * 95,
        status: 'sent'
      }
    ]
  },
  {
    id: 'thread-max',
    title: 'Max Ortega',
    participants: [seedParticipants.me, seedParticipants.max],
    lastMessagePreview: 'The DNS tests passed on Android too.',
    lastMessageAt: Date.now() - 1000 * 60 * 135,
    unreadCount: 1,
    messages: [
      {
        id: 'm7',
        conversationId: 'thread-max',
        authorId: 'max',
        text: 'The DNS tests passed on Android too.',
        createdAt: Date.now() - 1000 * 60 * 135,
        status: 'received'
      }
    ]
  },
  {
    id: 'thread-june',
    title: 'June Park',
    participants: [seedParticipants.me, seedParticipants.june],
    lastMessagePreview: 'Prototype is ready for review.',
    lastMessageAt: Date.now() - 1000 * 60 * 200,
    unreadCount: 0,
    messages: [
      {
        id: 'm8',
        conversationId: 'thread-june',
        authorId: 'june',
        text: 'Prototype is ready for review.',
        createdAt: Date.now() - 1000 * 60 * 200,
        status: 'received'
      }
    ]
  }
];

const initialState: MessageState = {
  conversations: []
};

function messageReducer(state: MessageState, action: Action): MessageState {
  switch (action.type) {
    case 'HYDRATE': {
      return {
        conversations: action.payload.conversations
          .slice()
          .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      };
    }
    case 'SEND_MESSAGE': {
      const { conversationId, message } = action.payload;
      return {
        conversations: state.conversations
          .map((conversation) => {
            if (conversation.id !== conversationId) return conversation;
            const messages = [...conversation.messages, message];
            return {
              ...conversation,
              messages,
              lastMessagePreview: message.text,
              lastMessageAt: message.createdAt,
              unreadCount: conversation.unreadCount
            };
          })
          .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      };
    }
    case 'RECEIVE_MESSAGE': {
      const { conversationId, message } = action.payload;
      return {
        conversations: state.conversations
          .map((conversation) => {
            if (conversation.id !== conversationId) return conversation;
            const messages = [...conversation.messages, message];
            return {
              ...conversation,
              messages,
              lastMessagePreview: message.text,
              lastMessageAt: message.createdAt,
              unreadCount: conversation.unreadCount + 1
            };
          })
          .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      };
    }
    case 'MARK_READ': {
      return {
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.payload.conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )
      };
    }
    case 'REFRESH': {
      return state;
    }
    default:
      return state;
  }
}

const buildId = () => {
  const random = globalThis.crypto?.randomUUID?.();
  if (random) return random;
  return `msg_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
};

export function MessageProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const [isHydrated, setHydrated] = useState(false);
  const replyTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadConversations();
      const conversations = stored && stored.length > 0 ? stored : seedConversations;
      if (!mounted) return;
      dispatch({ type: 'HYDRATE', payload: { conversations } });
      setHydrated(true);
      if (!stored || stored.length === 0) {
        await saveConversations(conversations);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void saveConversations(state.conversations);
  }, [isHydrated, state.conversations]);

  const getConversation = useCallback(
    (conversationId: string) => state.conversations.find((c) => c.id === conversationId),
    [state.conversations]
  );

  const markConversationRead = useCallback((conversationId: string) => {
    dispatch({ type: 'MARK_READ', payload: { conversationId } });
  }, []);

  const refreshConversations = useCallback(async () => {
    const stored = await loadConversations();
    if (stored) {
      dispatch({ type: 'HYDRATE', payload: { conversations: stored } });
    }
  }, []);

  const scheduleReply = useCallback(
    (conversationId: string) => {
      if (replyTimeouts.current[conversationId]) return;

      const existingConversation = getConversation(conversationId);
      if (!existingConversation) return;

      const others = existingConversation.participants.filter((p) => p.id !== SELF_ID);
      const author = others[Math.floor(Math.random() * others.length)] ?? seedParticipants.devon;
      const replyText = replyPool[Math.floor(Math.random() * replyPool.length)];
      const delay = 600 + Math.floor(Math.random() * 900);

      replyTimeouts.current[conversationId] = setTimeout(() => {
        const replyMessage: Message = {
          id: buildId(),
          conversationId,
          authorId: author.id,
          text: replyText,
          createdAt: Date.now(),
          status: 'received'
        };
        dispatch({ type: 'RECEIVE_MESSAGE', payload: { conversationId, message: replyMessage } });
        delete replyTimeouts.current[conversationId];
      }, delay);
    },
    [getConversation]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      if (!isHydrated) return;
      if (!text.trim()) return;
      const message: Message = {
        id: buildId(),
        conversationId,
        authorId: SELF_ID,
        text: text.trim(),
        createdAt: Date.now(),
        status: 'sent'
      };
      dispatch({ type: 'SEND_MESSAGE', payload: { conversationId, message } });
      scheduleReply(conversationId);
    },
    [isHydrated, scheduleReply]
  );

  const value = useMemo<MessageContextValue>(
    () => ({
      conversations: state.conversations,
      sendMessage,
      markConversationRead,
      refreshConversations,
      getConversation,
      isHydrated
    }),
    [
      state.conversations,
      sendMessage,
      markConversationRead,
      refreshConversations,
      getConversation,
      isHydrated
    ]
  );

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useMessages must be used within MessageProvider');
  return context.conversations;
}

export function useConversation(conversationId: string) {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useConversation must be used within MessageProvider');
  return context.getConversation(conversationId);
}

export function useMessageActions() {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useMessageActions must be used within MessageProvider');
  return {
    sendMessage: context.sendMessage,
    refreshConversations: context.refreshConversations,
    markConversationRead: context.markConversationRead
  };
}

export function useMessagesHydration() {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useMessagesHydration must be used within MessageProvider');
  return context.isHydrated;
}
