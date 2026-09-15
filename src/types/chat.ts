export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "error";
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

/**
 * What went wrong, not how to phrase it: screens map the kind to localized
 * copy, so raw service diagnostics never reach the UI.
 */
export type ChatErrorKind =
  | "dns"
  | "validation"
  | "busy"
  | "noChat"
  | "storage"
  | "storageRecovered"
  | "storageReset";

export interface ChatError {
  kind: ChatErrorKind;
  /** Assistant message whose DNS request failed; the only prompt Retry may resend. */
  failedMessageId?: string;
}

/**
 * `rejected`: nothing was sent or stored, so the composer keeps the text.
 * `failed`: the message is in the history with an error reply.
 */
export type SendMessageResult = "sent" | "rejected" | "failed";

export interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: ChatError | null;
  createChat: (title?: string) => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<void>;
  clearAllChats: () => Promise<void>;
  sendMessage: (content: string) => Promise<SendMessageResult>;
  loadChats: () => Promise<void>;
  setCurrentChat: (chat: Chat | null) => void;
  clearError: () => void;
}
