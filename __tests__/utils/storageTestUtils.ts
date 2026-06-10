import { decryptIfEncrypted } from "../../src/services/encryptionService";
import type { Message } from "../../src/types/chat";

/** Decrypts (when encrypted) and parses a persisted chats payload. */
export const parseStoredChats = async (payload: string) =>
  JSON.parse(await decryptIfEncrypted(payload));

export const makeChat = (id: string) => ({
  id,
  title: "Test Chat",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [],
});

export const makeMessage = (id: string): Message => ({
  id,
  content: `Message ${id}`,
  role: "user",
  timestamp: new Date(),
  status: "sent",
});
