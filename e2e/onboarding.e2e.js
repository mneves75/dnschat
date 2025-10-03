/**
 * E2E Test: Onboarding Flow
 *
 * Covers:
 * - Complete onboarding tutorial
 * - Navigation between onboarding steps
 * - Skip functionality
 * - Finish and transition to main app
 */

const { device, element, by, expect } = require('detox');

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      delete: true, // Fresh install to trigger onboarding
      permissions: { notifications: 'YES' },
    });
  });

  afterEach(async () => {
    await device.reloadReactNative();
  });

  describe('Skip Onboarding', () => {
    it('should allow user to skip onboarding tutorial', async () => {
      await expect(element(by.id('onboarding-skip'))).toBeVisible();
      await element(by.id('onboarding-skip')).tap();

      // Should land on chat list screen
      await expect(element(by.id('chat-new'))).toBeVisible();
    });

    it('should persist skip preference on app restart', async () => {
      await expect(element(by.id('onboarding-skip'))).toBeVisible();
      await element(by.id('onboarding-skip')).tap();

      // Reload app (simulates restart)
      await device.reloadReactNative();

      // Should NOT show onboarding again
      await expect(element(by.id('chat-new'))).toBeVisible();
      await expect(element(by.id('onboarding-skip'))).not.toBeVisible();
    });
  });

  describe('Complete Onboarding', () => {
    beforeEach(async () => {
      await device.launchApp({
        delete: true, // Force onboarding
      });
    });

    it('should navigate through all onboarding steps', async () => {
      // Step 1: Welcome screen
      await expect(element(by.id('onboarding-next'))).toBeVisible();
      await element(by.id('onboarding-next')).tap();

      // Step 2: Features explanation
      await expect(element(by.id('onboarding-back'))).toBeVisible();
      await expect(element(by.id('onboarding-next'))).toBeVisible();
      await element(by.id('onboarding-next')).tap();

      // Step 3: Privacy & DNS info
      await expect(element(by.id('onboarding-back'))).toBeVisible();
      await expect(element(by.id('onboarding-next'))).toBeVisible();
      await element(by.id('onboarding-next')).tap();

      // Final step: Should show "Finish" button
      await expect(element(by.id('onboarding-finish'))).toBeVisible();
      await element(by.id('onboarding-finish')).tap();

      // Should land on chat list screen
      await expect(element(by.id('chat-new'))).toBeVisible();
    });

    it('should allow navigating back to previous steps', async () => {
      // Go to step 2
      await element(by.id('onboarding-next')).tap();

      // Go back to step 1
      await expect(element(by.id('onboarding-back'))).toBeVisible();
      await element(by.id('onboarding-back')).tap();

      // Should be back on first step (no back button)
      await expect(element(by.id('onboarding-back'))).not.toBeVisible();
      await expect(element(by.id('onboarding-next'))).toBeVisible();
    });

    it('should persist completion preference on app restart', async () => {
      // Complete all steps
      await element(by.id('onboarding-next')).tap();
      await element(by.id('onboarding-next')).tap();
      await element(by.id('onboarding-next')).tap();
      await element(by.id('onboarding-finish')).tap();

      // Reload app (simulates restart)
      await device.reloadReactNative();

      // Should NOT show onboarding again
      await expect(element(by.id('chat-new'))).toBeVisible();
      await expect(element(by.id('onboarding-skip'))).not.toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid taps without crashing', async () => {
      await device.launchApp({ delete: true });

      // Rapid tap "Next" button
      await element(by.id('onboarding-next')).multiTap(5);

      // Should not crash, still navigable
      await expect(element(by.id('onboarding-back'))).toBeVisible();
    });

    it('should handle app backgrounding during onboarding', async () => {
      await device.launchApp({ delete: true });

      await element(by.id('onboarding-next')).tap();

      // Send app to background and bring back
      await device.sendToHome();
      await device.launchApp({ newInstance: false });

      // Should resume on same onboarding step
      await expect(element(by.id('onboarding-back'))).toBeVisible();
      await expect(element(by.id('onboarding-next'))).toBeVisible();
    });
  });
});
