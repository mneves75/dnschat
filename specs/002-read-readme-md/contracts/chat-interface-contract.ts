/**
 * Chat Interface Contract
 * Defines the interface for chat UI components and user interactions
 */

export interface ChatInterfaceContract {
  // Message Display Operations
  /**
   * Render a list of messages in the chat interface
   * @param messages - Messages to display
   * @param options - Rendering options
   * @returns Promise with render result
   */
  renderMessages(
    messages: ChatMessage[],
    options?: RenderOptions
  ): Promise<RenderResult>

  /**
   * Add a new message to the chat display
   * @param message - Message to add
   * @param animate - Whether to animate the addition
   * @returns Promise with add result
   */
  addMessage(message: ChatMessage, animate?: boolean): Promise<void>

  /**
   * Update message status in the UI (e.g., sending → sent)
   * @param messageId - Target message ID
   * @param status - New status
   * @returns Promise with update result
   */
  updateMessageStatus(messageId: string, status: MessageStatus): Promise<void>

  /**
   * Show typing indicator for AI response
   * @param show - Whether to show or hide indicator
   * @returns Promise when animation completes
   */
  showTypingIndicator(show: boolean): Promise<void>

  // User Input Operations
  /**
   * Handle user text input with validation
   * @param input - Raw user input
   * @returns Promise with validation result
   */
  handleUserInput(input: string): Promise<InputValidationResult>

  /**
   * Send user message through the chat system
   * @param message - Validated message content
   * @param options - Send options
   * @returns Promise with send result
   */
  sendMessage(
    message: string,
    options?: SendOptions
  ): Promise<SendResult>

  /**
   * Clear the current input field
   * @returns Promise when cleared
   */
  clearInput(): Promise<void>

  // Chat State Management
  /**
   * Load conversation history into the interface
   * @param conversationId - Target conversation
   * @param options - Loading options
   * @returns Promise with load result
   */
  loadConversation(
    conversationId: string,
    options?: LoadConversationOptions
  ): Promise<LoadConversationResult>

  /**
   * Create a new conversation
   * @param title - Optional conversation title
   * @returns Promise with new conversation ID
   */
  createNewConversation(title?: string): Promise<string>

  /**
   * Get current conversation state
   * @returns Current conversation information
   */
  getCurrentConversation(): ConversationState | null

  // Theme and Accessibility
  /**
   * Apply theme changes to the chat interface
   * @param theme - Theme configuration
   * @returns Promise when theme applied
   */
  applyTheme(theme: ThemeConfig): Promise<void>

  /**
   * Update accessibility settings
   * @param config - Accessibility configuration
   * @returns Promise when settings applied
   */
  updateAccessibility(config: AccessibilityConfig): Promise<void>

  // Error Handling
  /**
   * Display error message to user
   * @param error - Error information
   * @param options - Display options
   * @returns Promise when error displayed
   */
  showError(error: ChatError, options?: ErrorDisplayOptions): Promise<void>

  /**
   * Show rate limit warning to user
   * @param remainingTime - Time until rate limit resets
   * @returns Promise when warning displayed
   */
  showRateLimitWarning(remainingTime: number): Promise<void>
}

export interface RenderOptions {
  scrollToBottom?: boolean    // Auto-scroll to newest message
  highlightNew?: boolean     // Highlight newly added messages
  showTimestamps?: boolean   // Display message timestamps
  showStatus?: boolean       // Display delivery status indicators
}

export interface RenderResult {
  success: boolean
  messagesRendered: number
  error?: string
}

export interface InputValidationResult {
  isValid: boolean
  sanitizedInput?: string    // Cleaned input ready for sending
  errors: string[]          // Validation error messages
  warnings: string[]        // Non-blocking warnings
}

export interface SendOptions {
  conversationId?: string   // Target conversation (current if not specified)
  retryOnFailure?: boolean // Whether to retry failed sends
}

export interface SendResult {
  success: boolean
  messageId?: string       // ID of sent message
  error?: ChatError
}

export interface LoadConversationOptions {
  messageLimit?: number    // Number of recent messages to load
  scrollToBottom?: boolean // Whether to scroll to bottom after load
}

export interface LoadConversationResult {
  success: boolean
  messagesLoaded: number
  hasMoreMessages: boolean
  error?: string
}

export interface ConversationState {
  id: string
  title: string
  messageCount: number
  lastMessageAt: Date
  isLoading: boolean
  hasUnsavedChanges: boolean
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor?: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
}

export interface AccessibilityConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  highContrast: boolean
  reduceMotion: boolean
  screenReader: boolean
  focusIndicators: boolean
}

export interface ChatError {
  code: string
  message: string
  details?: string
  retryable: boolean
  timestamp: Date
}

export interface ErrorDisplayOptions {
  dismissible?: boolean    // Whether error can be dismissed
  autoHide?: boolean      // Whether error auto-hides
  hideDelay?: number      // Milliseconds before auto-hide
  showRetryButton?: boolean // Whether to show retry option
}

// Re-export from data model
export { ChatMessage, MessageStatus } from '../data-model'