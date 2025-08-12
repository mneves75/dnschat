import { Assets as NavigationAssets } from '@react-navigation/elements';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Navigation } from './navigation';
import { ChatProvider } from './context/ChatContext';
import { SettingsProvider } from './context/SettingsContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnboardingContainer } from './components/onboarding/OnboardingContainer';

Asset.loadAsync([
  ...NavigationAssets,
  require('./assets/newspaper.png'),
]);

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding, loading } = useOnboarding();

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  React.useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null; // Keep splash screen visible while loading
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingContainer />;
  }

  return (
    <Navigation
      theme={theme}
      linking={{
        enabled: 'auto',
        prefixes: [
          // Change the scheme to match your app's scheme defined in app.json
          'dnschat://',
        ],
      }}
    />
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <OnboardingProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </OnboardingProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
