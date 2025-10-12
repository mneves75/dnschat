/**
 * Root Layout - Expo Router Entry Point
 *
 * Provider composition now lives in app/App.tsx (Expo manages providers via App.tsx).
 * Keeping this layout minimal ensures Stack only renders Screen children.
 *
 * TESTING LIQUID GLASS ON iOS < 26:
 * Uncomment the line below to force-enable native glass effects for testing:
 * global.__DEV_LIQUID_GLASS_PRE_IOS26__ = true;
 *
 * Alternative: Set environment variable LIQUID_GLASS_PRE_IOS26=1 in .env.development
 */

import { Stack } from 'expo-router';

// Uncomment to test Liquid Glass on iOS < 26 (DEV ONLY):
// if (__DEV__) {
//   (global as any).__DEV_LIQUID_GLASS_PRE_IOS26__ = true;
// }

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'default' }} />
  );
}
