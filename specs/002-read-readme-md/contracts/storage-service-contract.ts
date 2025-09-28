/**
 * Storage Service Contract
 * Defines the interface for local data persistence and retrieval
 */

export interface StorageServiceContract {
  // Chat Message Operations
  /**
   * Save a chat message to local storage
   * @param message - Message to store
   * @returns Promise with save result
   */
  saveMessage(message: ChatMessage): Promise<StorageResult>

  /**
   * Retrieve messages for a conversation with pagination
   * @param conversationId - Target conversation
   * @param options - Pagination and filtering options
   * @returns Promise with messages and pagination info
   */
  getMessages(
    conversationId: string,
    options?: GetMessagesOptions
  ): Promise<GetMessagesResult>

  /**
   * Update message status (e.g., sent → received)
   * @param messageId - Target message ID
   * @param status - New message status
   * @returns Promise with update result
   */
  updateMessageStatus(
    messageId: string,
    status: MessageStatus
  ): Promise<StorageResult>

  // Conversation Operations
  /**
   * Create a new conversation
   * @param conversation - Conversation data
   * @returns Promise with created conversation
   */
  createConversation(
    conversation: Omit<ConversationHistory, 'id' | 'createdAt'>
  ): Promise<ConversationHistory>

  /**
   * Get all conversations with metadata
   * @param options - Sorting and filtering options
   * @returns Promise with conversation list
   */
  getConversations(
    options?: GetConversationsOptions
  ): Promise<ConversationHistory[]>

  /**
   * Delete a conversation and all its messages
   * @param conversationId - Target conversation ID
   * @returns Promise with deletion result
   */
  deleteConversation(conversationId: string): Promise<StorageResult>

  // DNS Log Operations
  /**
   * Save DNS query log entry
   * @param log - DNS query log data
   * @returns Promise with save result
   */
  saveDNSLog(log: DNSQueryLog): Promise<StorageResult>

  /**
   * Get DNS logs with filtering and pagination
   * @param options - Filter and pagination options
   * @returns Promise with logs and pagination info
   */
  getDNSLogs(options?: GetDNSLogsOptions): Promise<GetDNSLogsResult>

  /**
   * Clean up old DNS logs (30-day retention policy)
   * @returns Promise with cleanup statistics
   */
  cleanupOldLogs(): Promise<CleanupResult>

  // Settings Operations
  /**
   * Save user settings with validation
   * @param settings - User settings object
   * @returns Promise with save result
   */
  saveSettings(settings: UserSettings): Promise<StorageResult>

  /**
   * Get current user settings with migration if needed
   * @returns Promise with current settings
   */
  getSettings(): Promise<UserSettings>

  // Encryption Operations
  /**
   * Encrypt sensitive message content
   * @param content - Plain text content
   * @param conversationId - Associated conversation
   * @returns Promise with encrypted content
   */
  encryptContent(content: string, conversationId: string): Promise<string>

  /**
   * Decrypt message content
   * @param encryptedContent - Encrypted content
   * @param conversationId - Associated conversation
   * @returns Promise with decrypted content
   */
  decryptContent(
    encryptedContent: string,
    conversationId: string
  ): Promise<string>
}

export interface StorageResult {
  success: boolean
  error?: string
}

export interface GetMessagesOptions {
  limit?: number           // Number of messages to retrieve (default: 50)
  offset?: number         // Starting offset for pagination
  startDate?: Date        // Filter messages after this date
  endDate?: Date         // Filter messages before this date
  status?: MessageStatus  // Filter by message status
}

export interface GetMessagesResult {
  messages: ChatMessage[]
  totalCount: number      // Total messages in conversation
  hasMore: boolean       // Whether more messages available
}

export interface GetConversationsOptions {
  sortBy?: 'lastMessage' | 'created' | 'title'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface GetDNSLogsOptions {
  messageId?: string      // Filter by associated message
  method?: DNSMethod     // Filter by DNS method
  status?: QueryStatus   // Filter by query status
  startDate?: Date       // Filter logs after this date
  endDate?: Date        // Filter logs before this date
  limit?: number        // Number of logs to retrieve
  offset?: number       // Starting offset
}

export interface GetDNSLogsResult {
  logs: DNSQueryLog[]
  totalCount: number
  hasMore: boolean
}

export interface CleanupResult {
  deletedCount: number   // Number of logs deleted
  spaceFreed: number    // Bytes freed
  error?: string
}

// Re-export from data model
export {
  ChatMessage,
  MessageStatus,
  ConversationHistory,
  DNSQueryLog,
  DNSMethod,
  QueryStatus,
  UserSettings
} from '../data-model'