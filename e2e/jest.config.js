module.exports = {
  preset: 'detox',
  testMatch: ['**/?(*.)+(e2e).[tj]s?(x)'],
  testTimeout: 180000,
  reporters: ['detox/runners/jest/streamlineReporter'],
  setupFilesAfterEnv: ['./setup.js'],
};
