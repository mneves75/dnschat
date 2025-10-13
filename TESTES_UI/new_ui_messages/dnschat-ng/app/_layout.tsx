import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { MessageProvider } from '@/context/MessageProvider';
import { DNSLogProvider } from '@/context/DNSLogProvider';
import { PreferencesProvider } from '@/context/PreferencesProvider';
import { TransportProvider } from '@/context/TransportProvider';
import { I18nProvider } from '@/i18n';
import { usePreferences, usePreferencesHydration } from '@/context/PreferencesProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const preferences = usePreferences();
  const hydrated = usePreferencesHydration();

  useEffect(() => {
    if (!hydrated) return;
    const atOnboarding = segments[0] === 'onboarding';
    // Keep onboarding and authenticated navigation mutually exclusive so deep links do not expose
    // the main tab bar until the intro flow is acknowledged.
    if (!preferences.onboardingCompleted && !atOnboarding) {
      router.replace('/onboarding');
    } else if (preferences.onboardingCompleted && atOnboarding) {
      router.replace('/');
    }
  }, [hydrated, preferences.onboardingCompleted, router, segments]);

  return (
    <PreferencesProvider>
      <I18nProvider>
        <DNSLogProvider>
          <TransportProvider>
            <MessageProvider>
              <SafeAreaProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="new-chat" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                  </Stack>
                </ThemeProvider>
              </SafeAreaProvider>
            </MessageProvider>
          </TransportProvider>
        </DNSLogProvider>
      </I18nProvider>
    </PreferencesProvider>
  );
}
