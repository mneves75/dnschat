import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ChatProvider } from "./context/ChatContext";
import { SettingsProvider } from "./context/SettingsContext";
import { OnboardingProvider, useOnboarding } from "./context/OnboardingContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OnboardingContainer } from "./components/onboarding/OnboardingContainer";
import { ExpoRoot } from "expo-router";
import { DNSLogService } from "./services/dnsLogService";

Asset.loadAsync([require("./assets/newspaper.png")]);

SplashScreen.preventAutoHideAsync();

// Metro provides require.context via @expo/metro-runtime; use loose typing to avoid TS friction.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expoRouterContext = (require as any).context("../app", true, /\.tsx?$/);

function Router() {
  return <ExpoRoot context={expoRouterContext} />;
}

function AppContent() {
  const { hasCompletedOnboarding, loading } = useOnboarding();

  React.useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // Initialize persisted DNS logs once
  React.useEffect(() => {
    DNSLogService.initialize().catch(() => {
      // Non-fatal: logs viewer will still function in-memory
    });
  }, []);

  if (loading) {
    return null; // Keep splash screen visible while loading
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingContainer />;
  }

  return <Router />;
}

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SettingsProvider>
          <OnboardingProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </OnboardingProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
