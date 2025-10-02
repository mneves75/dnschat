const { device, element, by, expect } = require('detox');

describe('DNSChat onboarding and messaging', () => {
  beforeAll(async () => {
    await device.launchApp({
      delete: true,
      permissions: { notifications: 'YES' },
    });
  });

  it('skips onboarding and sends a message', async () => {
    await expect(element(by.id('onboarding-skip'))).toBeVisible();
    await element(by.id('onboarding-skip')).tap();

    await expect(element(by.id('chat-new'))).toBeVisible();
    await element(by.id('chat-new')).tap();

    await expect(element(by.id('chat-input'))).toBeVisible();
    await element(by.id('chat-input')).typeText('Hello via DNS');
    await element(by.id('chat-send')).tap();

    await expect(element(by.text('Hello via DNS'))).toExist();
  });
});
