import React from 'react';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    SafeAreaView: ({ children }: any) => React.createElement(View, null, children),
  };
});

describe('OnboardingContainer safe area', () => {
  it('component is defined and importable', async () => {
    const { OnboardingProvider } = await import('../src/context/OnboardingContext');
    const { OnboardingContainer } = await import('../src/components/onboarding/OnboardingContainer');
    expect(typeof OnboardingProvider).toBe('function');
    expect(typeof OnboardingContainer).toBe('function');
  });
});
