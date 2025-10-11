/**
 * Modals Layout - Modal Presentation Group
 *
 * Configures modal presentation for screens that should appear as modals
 * rather than pushed onto the stack.
 *
 * CRITICAL: Expo Router uses route groups with parentheses to organize
 * routes without affecting the URL structure.
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

/**
 * Modals Layout Component
 *
 * IMPORTANT: This layout configures all routes in app/(modals)/ to
 * present as modals with iOS-style slide-up animation.
 *
 * TRICKY PART: Stack children validation
 * Stack component expects ONLY Stack.Screen children. NO JSX comments
 * allowed inside the component - they create child nodes that trigger
 * "Layout children must be of type Screen" warnings.
 */
export default function ModalsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        // Modal presentation style
        presentation: 'modal',
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
        },
        headerTintColor: '#007AFF', // iOS blue for close button
        headerTitleStyle: {
          fontWeight: '600',
        },
        // iOS-style slide-up animation for modals
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerLeft: () => null, // Remove back button (use close instead)
        }}
      />
    </Stack>
  );
}
