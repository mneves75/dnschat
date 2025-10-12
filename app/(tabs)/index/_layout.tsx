/**
 * Chat Stack Layout
 *
 * Wraps chat list and detail routes in a Stack navigator.
 * This is required when using NativeTabs - each tab that needs
 * navigation must be a directory with a Stack layout, not a flat file.
 *
 * Routes:
 * - /           → Chat list (index.tsx)
 * - /[id]       → Chat detail ([id].tsx)
 *
 * @author DNSChat Team
 * @since 2.0.0 (NativeTabs Stack Navigation)
 */

import { Stack } from 'expo-router';

export default function ChatStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
        gestureEnabled: true,
        presentation: 'card',
      }}
    >
      {/* Index screen is implicit - no need to explicitly register */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
