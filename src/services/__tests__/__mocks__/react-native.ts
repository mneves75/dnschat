export const Platform = {
  OS: 'ios',
  Version: '26.0',
  // Minimal constants stub used by tests
  constants: { isTesting: true },
} as const;

export const AppState = {
  addEventListener: (_event: string, _cb: (state: string) => void) => ({
    remove: () => {},
  }),
} as const;

export const NativeModules: Record<string, any> = {};

export const requireNativeComponent = (_name: string) => ({} as any);
