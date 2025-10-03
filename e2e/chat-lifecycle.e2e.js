/**
 * E2E Test: Chat Lifecycle
 *
 * Covers:
 * - Creating new chats
 * - Sending messages
 * - Receiving DNS responses
 * - Deleting chats
 * - Chat persistence
 */

const { device, element, by, expect, waitFor } = require('detox');

describe('Chat Lifecycle', () => {
  beforeAll(async () => {
    await device.launchApp({
      delete: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    // Skip onboarding if shown
    try {
      await waitFor(element(by.id('onboarding-skip')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('onboarding-skip')).tap();
    } catch (e) {
      // Already past onboarding, continue
    }
  });

  afterEach(async () => {
    await device.reloadReactNative();
  });

  describe('Create Chat', () => {
    it('should create a new chat successfully', async () => {
      await expect(element(by.id('chat-new'))).toBeVisible();
      await element(by.id('chat-new')).tap();

      // Should navigate to chat screen with input visible
      await expect(element(by.id('chat-input'))).toBeVisible();
      await expect(element(by.id('chat-send'))).toBeVisible();
    });

    it('should create multiple chats independently', async () => {
      // Create first chat
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('First chat message');
      await element(by.id('chat-send')).tap();

      // Go back to chat list (assuming nav back exists)
      await device.pressBack(); // Android
      // For iOS: await element(by.traits(['button'])).atIndex(0).tap();

      // Create second chat
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Second chat message');
      await element(by.id('chat-send')).tap();

      // Both messages should exist in their respective chats
      await expect(element(by.text('Second chat message'))).toExist();
    });
  });

  describe('Send Messages', () => {
    beforeEach(async () => {
      await element(by.id('chat-new')).tap();
    });

    it('should send a text message successfully', async () => {
      const testMessage = 'Hello DNS Chat!';

      await element(by.id('chat-input')).typeText(testMessage);
      await element(by.id('chat-send')).tap();

      // Message should appear in chat
      await expect(element(by.text(testMessage))).toExist();
    });

    it('should send multiple messages in sequence', async () => {
      const messages = ['First message', 'Second message', 'Third message'];

      for (const message of messages) {
        await element(by.id('chat-input')).typeText(message);
        await element(by.id('chat-send')).tap();
        await waitFor(element(by.text(message)))
          .toExist()
          .withTimeout(3000);
      }

      // All messages should be visible
      for (const message of messages) {
        await expect(element(by.text(message))).toExist();
      }
    });

    it('should clear input after sending message', async () => {
      await element(by.id('chat-input')).typeText('Test message');
      await element(by.id('chat-send')).tap();

      // Input should be empty (ready for next message)
      await expect(element(by.id('chat-input'))).toHaveText('');
    });

    it('should not send empty messages', async () => {
      // Tap send without typing anything
      await element(by.id('chat-send')).tap();

      // Send button should be disabled or no message added
      // (Depends on implementation - may need to check message count)
    });

    it('should handle long messages (>500 characters)', async () => {
      const longMessage = 'A'.repeat(500);

      await element(by.id('chat-input')).typeText(longMessage);
      await element(by.id('chat-send')).tap();

      // Should handle gracefully (may truncate or show error)
      await waitFor(element(by.text(longMessage.substring(0, 50))))
        .toExist()
        .withTimeout(5000);
    });
  });

  describe('Receive DNS Responses', () => {
    beforeEach(async () => {
      await element(by.id('chat-new')).tap();
    });

    it('should display DNS response after sending query', async () => {
      await element(by.id('chat-input')).typeText('Hello AI');
      await element(by.id('chat-send')).tap();

      // User message should appear immediately
      await expect(element(by.text('Hello AI'))).toExist();

      // AI response should appear after DNS query (may take 1-3 seconds)
      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle DNS query timeout gracefully', async () => {
      // Send message to non-existent domain (should timeout)
      await element(by.id('chat-input')).typeText('Test timeout');
      await element(by.id('chat-send')).tap();

      // Should show error message or timeout indicator
      await waitFor(element(by.text(/timeout|error|failed/i)))
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should display loading indicator during DNS query', async () => {
      await element(by.id('chat-input')).typeText('Loading test');
      await element(by.id('chat-send')).tap();

      // Should show loading indicator (spinner, "Thinking...", etc.)
      // Note: Depends on implementation
      await waitFor(element(by.id('message-loading')))
        .toBeVisible()
        .withTimeout(1000);
    });
  });

  describe('Delete Chat', () => {
    it('should delete a chat successfully', async () => {
      // Create and send message
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Chat to delete');
      await element(by.id('chat-send')).tap();

      // Go back to chat list
      await device.pressBack();

      // Long press on chat item to delete (or use delete button)
      // Note: Requires adding testID to delete action
      const firstChat = element(by.id('chat-item-0')).atIndex(0);
      await firstChat.longPress();
      await element(by.id('chat-delete-confirm')).tap();

      // Chat should be removed from list
      await expect(firstChat).not.toBeVisible();
    });

    it('should persist chat deletion after app restart', async () => {
      // Create chat
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Persistent delete test');
      await element(by.id('chat-send')).tap();
      await device.pressBack();

      // Delete chat
      const chat = element(by.id('chat-item-0')).atIndex(0);
      await chat.longPress();
      await element(by.id('chat-delete-confirm')).tap();

      // Reload app
      await device.reloadReactNative();

      // Chat should still be deleted
      await expect(element(by.text('Persistent delete test'))).not.toExist();
    });
  });

  describe('Chat Persistence', () => {
    it('should persist chat history across app restarts', async () => {
      const testMessage = 'Persistent message test';

      // Create chat and send message
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText(testMessage);
      await element(by.id('chat-send')).tap();

      // Reload app (simulates restart)
      await device.reloadReactNative();

      // Navigate to chat (should be in list)
      await waitFor(element(by.id('chat-item-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('chat-item-0')).atIndex(0).tap();

      // Message should still be visible
      await expect(element(by.text(testMessage))).toExist();
    });

    it('should handle app termination and relaunch', async () => {
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Termination test');
      await element(by.id('chat-send')).tap();

      // Terminate and relaunch
      await device.terminateApp();
      await device.launchApp({ newInstance: true });

      // Skip onboarding if shown
      try {
        await element(by.id('onboarding-skip')).tap();
      } catch (e) {}

      // Chat should persist
      await expect(element(by.id('chat-item-0'))).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid message sending', async () => {
      await element(by.id('chat-new')).tap();

      // Send 5 messages rapidly
      for (let i = 0; i < 5; i++) {
        await element(by.id('chat-input')).typeText(`Rapid ${i}`);
        await element(by.id('chat-send')).tap();
      }

      // All messages should eventually appear
      await waitFor(element(by.text('Rapid 4')))
        .toExist()
        .withTimeout(5000);
    });

    it('should handle special characters in messages', async () => {
      await element(by.id('chat-new')).tap();

      const specialMessage = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      await element(by.id('chat-input')).typeText(specialMessage);
      await element(by.id('chat-send')).tap();

      await expect(element(by.text(specialMessage))).toExist();
    });

    it('should handle emojis in messages', async () => {
      await element(by.id('chat-new')).tap();

      const emojiMessage = 'Hello 👋 World 🌍';
      await element(by.id('chat-input')).typeText(emojiMessage);
      await element(by.id('chat-send')).tap();

      await expect(element(by.text(emojiMessage))).toExist();
    });
  });
});
