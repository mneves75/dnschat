/**
 * E2E Test: Error Handling & Edge Cases
 *
 * Covers:
 * - DNS query timeouts
 * - Network offline scenarios
 * - Rate limiting (>10 queries/min)
 * - Invalid input handling
 * - App recovery from errors
 */

const { device, element, by, expect, waitFor } = require('detox');

describe('Error Handling', () => {
  beforeAll(async () => {
    await device.launchApp({
      delete: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    // Skip onboarding
    try {
      await waitFor(element(by.id('onboarding-skip')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('onboarding-skip')).tap();
    } catch (e) {}
  });

  afterEach(async () => {
    await device.reloadReactNative();
  });

  describe('DNS Query Timeout', () => {
    it('should handle query timeout gracefully', async () => {
      // Send query to non-existent domain
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Timeout test');
      await element(by.id('chat-send')).tap();

      // User message should appear
      await expect(element(by.text('Timeout test'))).toExist();

      // Should show timeout error within 15 seconds
      await waitFor(
        element(by.text(/timeout|timed out|no response|failed/i))
      )
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should display user-friendly timeout error message', async () => {
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Error message test');
      await element(by.id('chat-send')).tap();

      // Wait for timeout
      await waitFor(element(by.id('message-error')))
        .toBeVisible()
        .withTimeout(15000);

      // Error should be user-friendly (not technical stack trace)
      await expect(
        element(
          by
            .id('message-error-text')
            .and(by.text(/couldn't reach|try again|check connection/i))
        )
      ).toExist();
    });

    it('should allow retry after timeout', async () => {
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Retry test');
      await element(by.id('chat-send')).tap();

      // Wait for timeout
      await waitFor(element(by.id('message-error')))
        .toBeVisible()
        .withTimeout(15000);

      // Tap retry button
      await element(by.id('message-retry')).tap();

      // Should attempt query again
      await waitFor(element(by.id('message-loading')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Network Offline Scenarios', () => {
    it('should detect offline state and show appropriate message', async () => {
      // Disable network
      await device.disableSynchronization();
      await device.shake(); // Open dev menu
      await element(by.text('Toggle Network')).tap();

      // Try to send message
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Offline test');
      await element(by.id('chat-send')).tap();

      // Should show offline error
      await expect(
        element(by.text(/offline|no internet|connection/i))
      ).toBeVisible();

      // Re-enable network
      await device.shake();
      await element(by.text('Toggle Network')).tap();
      await device.enableSynchronization();
    });

    it('should queue messages when offline and send when online', async () => {
      // Note: This test requires implementing offline queue functionality
      // Currently documents expected behavior

      await element(by.id('chat-new')).tap();

      // Disable network
      await device.disableSynchronization();

      // Send message while offline
      await element(by.id('chat-input')).typeText('Queued message');
      await element(by.id('chat-send')).tap();

      // Message should show "Pending" or "Queued" status
      await expect(element(by.id('message-pending'))).toBeVisible();

      // Re-enable network
      await device.enableSynchronization();

      // Message should automatically send
      await waitFor(element(by.id('message-sent')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce 10 queries/minute rate limit', async () => {
      await element(by.id('chat-new')).tap();

      // Send 11 messages rapidly (exceeds 10/min limit)
      for (let i = 1; i <= 11; i++) {
        await element(by.id('chat-input')).typeText(`Message ${i}`);
        await element(by.id('chat-send')).tap();
        await element(by.id('chat-input')).clearText();
      }

      // 11th message should show rate limit error
      await waitFor(element(by.text(/rate limit|too many|slow down/i)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display countdown timer until rate limit resets', async () => {
      await element(by.id('chat-new')).tap();

      // Trigger rate limit
      for (let i = 1; i <= 11; i++) {
        await element(by.id('chat-input')).typeText(`Spam ${i}`);
        await element(by.id('chat-send')).tap();
      }

      // Should show timer or "Try again in X seconds"
      await expect(
        element(by.text(/try again in|wait|seconds remaining/i))
      ).toBeVisible();
    });

    it('should allow sending after rate limit window expires', async () => {
      // Note: This test may take 60+ seconds to complete
      jest.setTimeout(90000);

      await element(by.id('chat-new')).tap();

      // Trigger rate limit
      for (let i = 1; i <= 11; i++) {
        await element(by.id('chat-input')).typeText(`Limit ${i}`);
        await element(by.id('chat-send')).tap();
      }

      // Wait for rate limit error
      await waitFor(element(by.id('rate-limit-error')))
        .toBeVisible()
        .withTimeout(5000);

      // Wait for rate limit to reset (60 seconds)
      await new Promise((resolve) => setTimeout(resolve, 65000));

      // Should allow sending again
      await element(by.id('chat-input')).typeText('After reset');
      await element(by.id('chat-send')).tap();

      await expect(element(by.text('After reset'))).toExist();
    });
  });

  describe('Invalid Input Handling', () => {
    it('should prevent sending messages with only whitespace', async () => {
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('     ');
      await element(by.id('chat-send')).tap();

      // Send button should be disabled or message rejected
      // (No message should appear in chat)
      await expect(element(by.text('     '))).not.toExist();
    });

    it('should handle extremely long messages gracefully', async () => {
      await element(by.id('chat-new')).tap();

      const longMessage = 'A'.repeat(10000);
      await element(by.id('chat-input')).replaceText(longMessage);
      await element(by.id('chat-send')).tap();

      // Should either truncate or show error
      await waitFor(
        element(
          by.text(/too long|maximum length|character limit/i).or(
            by.text(longMessage.substring(0, 100))
          )
        )
      )
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should handle special characters and emojis correctly', async () => {
      await element(by.id('chat-new')).tap();

      const specialMessage = 'Test <>&"\' 🚀 Ñ ü';
      await element(by.id('chat-input')).typeText(specialMessage);
      await element(by.id('chat-send')).tap();

      // Message should appear correctly (no HTML escaping issues)
      await expect(element(by.text(specialMessage))).toExist();
    });

    it('should sanitize potential XSS attempts', async () => {
      await element(by.id('chat-new')).tap();

      const xssAttempt = '<script>alert("XSS")</script>';
      await element(by.id('chat-input')).typeText(xssAttempt);
      await element(by.id('chat-send')).tap();

      // Should display as plain text, not execute script
      await expect(element(by.text(xssAttempt))).toExist();
      // And app should not crash
      await expect(element(by.id('chat-input'))).toBeVisible();
    });
  });

  describe('App Recovery', () => {
    it('should recover from crash and preserve chat history', async () => {
      // Create chat with message
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Pre-crash message');
      await element(by.id('chat-send')).tap();

      // Force crash (using dev menu crash button)
      try {
        await device.shake();
        await element(by.text('Crash App')).tap();
      } catch (e) {
        // App crashed, expected
      }

      // Relaunch app
      await device.launchApp({ newInstance: false });

      // Chat should still exist
      await waitFor(element(by.id('chat-item-0')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('chat-item-0')).atIndex(0).tap();

      // Message should persist
      await expect(element(by.text('Pre-crash message'))).toExist();
    });

    it('should handle background app termination gracefully', async () => {
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Background test');
      await element(by.id('chat-send')).tap();

      // Terminate app in background
      await device.sendToHome();
      await device.terminateApp();

      // Relaunch
      await device.launchApp({ newInstance: true });

      // Skip onboarding
      try {
        await element(by.id('onboarding-skip')).tap();
      } catch (e) {}

      // Chat should persist
      await expect(element(by.id('chat-item-0'))).toBeVisible();
    });

    it('should handle rapid orientation changes without crashing', async () => {
      await element(by.id('chat-new')).tap();

      // Rotate device multiple times
      await device.setOrientation('landscape');
      await device.setOrientation('portrait');
      await device.setOrientation('landscape');
      await device.setOrientation('portrait');

      // App should remain functional
      await expect(element(by.id('chat-input'))).toBeVisible();
      await element(by.id('chat-input')).typeText('Rotation test');
      await element(by.id('chat-send')).tap();

      await expect(element(by.text('Rotation test'))).toExist();
    });
  });

  describe('Error Logging & Reporting', () => {
    it('should log errors to console in dev mode', async () => {
      // Note: This test validates that errors are logged, not silent failures
      // Requires checking device logs or Sentry integration

      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Logging test');
      await element(by.id('chat-send')).tap();

      // Trigger timeout
      await waitFor(element(by.id('message-error')))
        .toBeVisible()
        .withTimeout(15000);

      // Logs should contain error details (verified manually or via log viewer)
      // This is a documentation placeholder for manual verification
    });

    it('should show error details in DNS logs viewer', async () => {
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Log viewer test');
      await element(by.id('chat-send')).tap();

      // Wait for error
      await waitFor(element(by.id('message-error')))
        .toBeVisible()
        .withTimeout(15000);

      // Navigate to logs viewer (Settings > DNS Logs)
      await element(by.id('tab-settings')).tap();
      await element(by.id('dns-logs-button')).tap();

      // Error should appear in logs with details
      await expect(element(by.text(/error|timeout|failed/i))).toExist();
      await expect(element(by.id('log-entry-0'))).toBeVisible();
    });
  });
});
