/**
 * Root Layout - Expo Router Entry Point
 *
 * This is the root layout for the entire application using Expo Router.
 * All screens are descendants of this layout and inherit the global providers.
 *
 * CRITICAL: Expo Router uses file-based routing. The directory structure in app/
 * directly maps to routes. This layout wraps all routes with global providers.
 *
 * Provider Order (Outside → Inside):
 * 1. GestureHandlerRootView - Required for gesture handling (react-navigation)
 * 2. ErrorBoundary - Catches and displays React errors
 * 3. SettingsProvider - Global settings and theme configuration
 * 4. ChatProvider - Chat state management
 * 5. Stack - Expo Router navigation stack
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { SettingsProvider } from '../src/context/SettingsContext';
import { ChatProvider } from '../src/context/ChatContext';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// CRITICAL: Prevent auto-hiding splash screen until app is ready
// This prevents white flash during initialization on iOS/Android
SplashScreen.preventAutoHideAsync();

/**
 * Root Layout Component
 *
 * IMPORTANT: This component must be a default export for Expo Router.
 * All routes defined in app/ will be children of this layout.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash screen after a short delay to ensure providers are ready
    // CRITICAL: Without this, users may see unstyled content briefly
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SettingsProvider>
          <ChatProvider>
            <Stack
              screenOptions={{
                // Default screen options for all routes
                // CRITICAL: These can be overridden per-screen in individual layouts
                headerShown: false, // Hide header by default (tabs will show their own)
                contentStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
                },
                animation: 'default', // iOS-style slide animation
              }}
            >
              {/*
                CRITICAL: Screen configuration is automatic with file-based routing.
                Expo Router automatically creates routes from the app/ directory structure:
                - app/(tabs)/ → Tab navigation group
                - app/(modals)/ → Modal presentation group
                - app/profile/[user].tsx → Dynamic route with parameter
                - app/+not-found.tsx → 404 handler

                No need to manually define <Stack.Screen> components here.
              */}
            </Stack>
          </ChatProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
