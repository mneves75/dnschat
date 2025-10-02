const detox = require('detox');
const adapter = require('detox/runners/jest/adapter');

jest.setTimeout(180000);

beforeAll(async () => {
  await detox.init(undefined, { launchApp: false });
});

afterAll(async () => {
  await detox.cleanup();
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterEach(async () => {
  await adapter.afterEach();
});
