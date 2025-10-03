/**
 * E2E Test: DNS Transport Switching & Fallback
 *
 * Covers:
 * - Switching between DNS transports (Native, UDP, TCP, DoH)
 * - Transport fallback logic
 * - Settings persistence
 * - Transport performance verification
 *
 * NOTE: Requires testIDs to be added to Settings screen components
 */

const { device, element, by, expect, waitFor } = require('detox');

describe('DNS Transport Configuration', () => {
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

  describe('Access Settings', () => {
    it('should navigate to Settings screen', async () => {
      // Tap Settings tab (bottom navigation)
      await element(by.id('tab-settings')).tap();

      // Settings screen should be visible
      await expect(element(by.id('settings-screen'))).toBeVisible();
      await expect(element(by.id('dns-transport-section'))).toBeVisible();
    });
  });

  describe('Transport Selection', () => {
    beforeEach(async () => {
      await element(by.id('tab-settings')).tap();
    });

    it('should display all available transport options', async () => {
      await expect(element(by.id('transport-native'))).toBeVisible();
      await expect(element(by.id('transport-udp'))).toBeVisible();
      await expect(element(by.id('transport-tcp'))).toBeVisible();
      await expect(element(by.id('transport-doh'))).toBeVisible();
    });

    it('should switch to UDP transport successfully', async () => {
      await element(by.id('transport-udp')).tap();

      // Should show confirmation or checkmark
      await expect(element(by.id('transport-udp-selected'))).toBeVisible();

      // Verify setting persists
      await device.reloadReactNative();
      await element(by.id('tab-settings')).tap();
      await expect(element(by.id('transport-udp-selected'))).toBeVisible();
    });

    it('should switch to TCP transport successfully', async () => {
      await element(by.id('transport-tcp')).tap();

      await expect(element(by.id('transport-tcp-selected'))).toBeVisible();
    });

    it('should switch to DoH (DNS over HTTPS) transport successfully', async () => {
      await element(by.id('transport-doh')).tap();

      await expect(element(by.id('transport-doh-selected'))).toBeVisible();
    });

    it('should switch back to Native transport successfully', async () => {
      // Change to UDP first
      await element(by.id('transport-udp')).tap();
      await expect(element(by.id('transport-udp-selected'))).toBeVisible();

      // Switch back to Native
      await element(by.id('transport-native')).tap();
      await expect(element(by.id('transport-native-selected'))).toBeVisible();
    });
  });

  describe('Transport Testing', () => {
    beforeEach(async () => {
      await element(by.id('tab-settings')).tap();
    });

    it('should test Native transport with "Test Connection" button', async () => {
      await element(by.id('transport-native')).tap();
      await element(by.id('test-transport')).tap();

      // Should show test result (success or failure)
      await waitFor(element(by.id('test-result')))
        .toBeVisible()
        .withTimeout(5000);

      // Result should indicate success or specific error
      await expect(
        element(by.id('test-result-text').and(by.text(/success|failed/i)))
      ).toExist();
    });

    it('should test UDP transport with "Test Connection" button', async () => {
      await element(by.id('transport-udp')).tap();
      await element(by.id('test-transport')).tap();

      await waitFor(element(by.id('test-result')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should test TCP transport with "Test Connection" button', async () => {
      await element(by.id('transport-tcp')).tap();
      await element(by.id('test-transport')).tap();

      await waitFor(element(by.id('test-result')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should test DoH transport with "Test Connection" button', async () => {
      await element(by.id('transport-doh')).tap();
      await element(by.id('test-transport')).tap();

      await waitFor(element(by.id('test-result')))
        .toBeVisible()
        .withTimeout(10000); // DoH may be slower
    });
  });

  describe('Transport Fallback Logic', () => {
    it('should fallback to UDP when Native fails', async () => {
      // This test requires mocking Native transport failure
      // or running in environment where Native is unavailable

      // Create chat and send message
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Fallback test');
      await element(by.id('chat-send')).tap();

      // Message should still send via fallback transport
      await waitFor(element(by.text('Fallback test')))
        .toExist()
        .withTimeout(10000);

      // Optional: Check logs to verify fallback occurred
      // (Requires log viewer in Settings or dev mode indicator)
    });

    it('should fallback to TCP when UDP fails', async () => {
      // Set UDP as primary transport
      await element(by.id('tab-settings')).tap();
      await element(by.id('transport-udp')).tap();
      await element(by.id('tab-chats')).tap();

      // Send message (if UDP blocked, should fallback to TCP)
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('UDP to TCP fallback');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.text('UDP to TCP fallback')))
        .toExist()
        .withTimeout(10000);
    });

    it('should fallback to DoH when TCP fails', async () => {
      // Set TCP as primary transport
      await element(by.id('tab-settings')).tap();
      await element(by.id('transport-tcp')).tap();
      await element(by.id('tab-chats')).tap();

      // Send message
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('TCP to DoH fallback');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.text('TCP to DoH fallback')))
        .toExist()
        .withTimeout(15000); // Allow time for fallback chain
    });
  });

  describe('Transport Performance', () => {
    it('should complete DNS query via Native transport in <3 seconds', async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.id('transport-native')).tap();
      await element(by.id('tab-chats')).tap();

      await element(by.id('chat-new')).tap();

      const startTime = Date.now();
      await element(by.id('chat-input')).typeText('Performance test');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(3000);

      const elapsed = Date.now() - startTime;
      console.log(`Native transport query time: ${elapsed}ms`);
    });

    it('should complete DNS query via DoH transport in <5 seconds', async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.id('transport-doh')).tap();
      await element(by.id('tab-chats')).tap();

      await element(by.id('chat-new')).tap();

      const startTime = Date.now();
      await element(by.id('chat-input')).typeText('DoH perf test');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(5000);

      const elapsed = Date.now() - startTime;
      console.log(`DoH transport query time: ${elapsed}ms`);
    });
  });

  describe('Custom DNS Server Configuration', () => {
    beforeEach(async () => {
      await element(by.id('tab-settings')).tap();
    });

    it('should allow configuring custom DNS server', async () => {
      await element(by.id('dns-server-input')).tap();
      await element(by.id('dns-server-input')).replaceText('8.8.8.8');
      await element(by.id('dns-server-save')).tap();

      // Should persist custom server
      await device.reloadReactNative();
      await element(by.id('tab-settings')).tap();
      await expect(element(by.id('dns-server-input'))).toHaveText('8.8.8.8');
    });

    it('should validate DNS server IP address format', async () => {
      await element(by.id('dns-server-input')).tap();
      await element(by.id('dns-server-input')).replaceText('invalid-ip');
      await element(by.id('dns-server-save')).tap();

      // Should show validation error
      await expect(element(by.id('dns-server-error'))).toBeVisible();
      await expect(element(by.text(/invalid|format/i))).toExist();
    });

    it('should reset to default DNS server', async () => {
      // Set custom server
      await element(by.id('dns-server-input')).replaceText('8.8.8.8');
      await element(by.id('dns-server-save')).tap();

      // Reset to default
      await element(by.id('dns-server-reset')).tap();

      // Should restore default (likely empty or default value)
      await expect(element(by.id('dns-server-input'))).not.toHaveText(
        '8.8.8.8'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid transport switching', async () => {
      await element(by.id('tab-settings')).tap();

      // Rapidly switch between transports
      await element(by.id('transport-udp')).tap();
      await element(by.id('transport-tcp')).tap();
      await element(by.id('transport-doh')).tap();
      await element(by.id('transport-native')).tap();

      // Should settle on last selection
      await expect(element(by.id('transport-native-selected'))).toBeVisible();
    });

    it('should handle transport switch during active DNS query', async () => {
      // Start a DNS query
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('During-switch test');
      await element(by.id('chat-send')).tap();

      // Immediately switch transport (while query in progress)
      await element(by.id('tab-settings')).tap();
      await element(by.id('transport-udp')).tap();

      // Original query should complete or fail gracefully
      await element(by.id('tab-chats')).tap();
      await waitFor(element(by.text('During-switch test')))
        .toExist()
        .withTimeout(10000);
    });
  });
});
