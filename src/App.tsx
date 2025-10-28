import { Assets as NavigationAssets } from "@react-navigation/elements";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { useColorScheme, Platform, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Navigation } from "./navigation";
import { ChatProvider } from "./context/ChatContext";
import { SettingsProvider } from "./context/SettingsContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import { OnboardingProvider, useOnboarding } from "./context/OnboardingContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OnboardingContainer } from "./components/onboarding/OnboardingContainer";
import {
  LiquidGlassWrapper,
  useLiquidGlassCapabilities,
} from "./components/LiquidGlassWrapper";
import { HapticsConfigurator } from "./components/HapticsConfigurator";
import { DNSLogService } from "./services/dnsLogService";
import { I18nProvider } from "./i18n";

Asset.loadAsync([...NavigationAssets, require("./assets/newspaper.png")]);

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding, loading } = useOnboarding();
  const { isSupported: glassSupported } = useLiquidGlassCapabilities();

  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

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

  const navigationComponent = (
    <Navigation
      theme={theme}
      linking={{
        enabled: "auto",
        prefixes: [
          // Change the scheme to match your app's scheme defined in app.json
          "dnschat://",
        ],
      }}
    />
  );

  // Wrap in iOS 26 Liquid Glass container if supported
  if (glassSupported && Platform.OS === "ios") {
    return (
      <LiquidGlassWrapper
        variant="regular"
        shape="rect"
        enableContainer={true}
        style={styles.appContainer}
      >
        {navigationComponent}
      </LiquidGlassWrapper>
    );
  }

  return navigationComponent;
}

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ErrorBoundary>
            <SettingsProvider>
              <AccessibilityProvider>
                <I18nProvider>
                  <OnboardingProvider>
                    <ChatProvider>
                      <HapticsConfigurator />
                      <AppContent />
                    </ChatProvider>
                  </OnboardingProvider>
                </I18nProvider>
              </AccessibilityProvider>
            </SettingsProvider>
          </ErrorBoundary>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
