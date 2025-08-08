import { Assets as NavigationAssets } from '@react-navigation/elements';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Navigation } from './navigation';
import { ChatProvider } from './context/ChatContext';
import { SettingsProvider } from './context/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';

Asset.loadAsync([
  ...NavigationAssets,
  require('./assets/newspaper.png'),
]);

SplashScreen.preventAutoHideAsync();

export function App() {
  const colorScheme = useColorScheme();

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ChatProvider>
          <Navigation
            theme={theme}
            linking={{
              enabled: 'auto',
              prefixes: [
                // Change the scheme to match your app's scheme defined in app.json
                'chatdns://',
              ],
            }}
            onReady={() => {
              SplashScreen.hideAsync();
            }}
          />
        </ChatProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
