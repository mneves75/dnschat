/**
 * Root Layout - Expo Router Entry Point
 *
 * Provider composition now lives in app/App.tsx (Expo manages providers via App.tsx).
 * Keeping this layout minimal ensures Stack only renders Screen children.
 */

import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'default' }} />
  );
}
