/**
 * DNS Service Contract
 * Defines the interface for DNS-based message sending and receiving
 */

export interface DNSServiceContract {
  /**
   * Send a message via DNS TXT query to AI service
   * @param message - User message content (will be sanitized)
   * @param options - Optional configuration
   * @returns Promise with AI response or error
   */
  sendMessage(
    message: string,
    options?: SendMessageOptions
  ): Promise<SendMessageResult>

  /**
   * Test connectivity to a specific DNS server
   * @param server - DNS server configuration
   * @returns Promise with connection test result
   */
  testConnection(server: DNSServerConfig): Promise<ConnectionTestResult>

  /**
   * Get available DNS methods in priority order
   * @returns Array of DNS methods ordered by preference
   */
  getAvailableMethods(): DNSMethod[]

  /**
   * Validate and sanitize user input for DNS safety
   * @param input - Raw user input
   * @returns Sanitized input safe for DNS queries
   */
  sanitizeInput(input: string): string

  /**
   * Get current rate limit status
   * @returns Current rate limiting information
   */
  getRateLimitStatus(): RateLimitStatus
}

export interface SendMessageOptions {
  conversationId?: string      // Target conversation ID
  timeout?: number            // Query timeout in milliseconds (default: 10000)
  retryAttempts?: number      // Max retry attempts (default: 3)
  preferredMethod?: DNSMethod // Preferred DNS method to try first
  server?: string            // Specific DNS server to use
}

export interface SendMessageResult {
  success: boolean
  response?: string           // AI response text
  messageId: string          // Unique message identifier
  queryLogs: DNSQueryLog[]   // Detailed query information
  error?: {
    code: string
    message: string
    retryable: boolean       // Whether retry is likely to succeed
  }
}

export interface ConnectionTestResult {
  success: boolean
  responseTime?: number      // Milliseconds
  method: DNSMethod         // Method that succeeded
  error?: string           // Error message if failed
}

export interface RateLimitStatus {
  remaining: number         // Messages remaining in current window
  resetTime: Date          // When rate limit resets
  isLimited: boolean       // Whether currently rate limited
}

// Re-export from data model
export { DNSMethod, DNSQueryLog, DNSServerConfig } from '../data-model'