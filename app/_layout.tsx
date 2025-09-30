import "../src/polyfills/webCrypto";

import { Asset } from "expo-asset";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { LiquidGlassWrapper, useLiquidGlassCapabilities } from "../src/components/LiquidGlassWrapper";
import { OnboardingContainer } from "../src/components/onboarding/OnboardingContainer";
import { ChatProvider } from "../src/context/ChatContext";
import { OnboardingProvider, useOnboarding } from "../src/context/OnboardingContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import { LocalizationProvider } from "../src/i18n/LocalizationProvider";
import { AppThemeProvider } from "../src/theme/AppThemeContext";
import { DNSLogService } from "../src/services/dnsLogService";
import { setupWebWorkerErrorHandling } from "../src/utils/webWorkerErrorHandler";

Asset.loadAsync([require("../src/assets/newspaper.png")]);

SplashScreen.preventAutoHideAsync();

function RootContent() {
  const { hasCompletedOnboarding, loading } = useOnboarding();
  const { isSupported: glassSupported } = useLiquidGlassCapabilities();

  React.useEffect(() => {
    // Initialize web worker error handling for web platform
    setupWebWorkerErrorHandling();

    if (!loading) {
      SplashScreen.hideAsync().catch(() => {
        // Keep splash screen hidden fallback even if the async call fails
      });
    }
  }, [loading]);

  React.useEffect(() => {
    DNSLogService.initialize().catch(() => {
      // Non-fatal: logs viewer will still function in-memory
    });
  }, []);

  if (loading) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingContainer />;
  }

  const content = <Slot />;

  if (glassSupported && Platform.OS === "ios") {
    return (
      <LiquidGlassWrapper
        variant="regular"
        shape="rect"
        enableContainer
        sensorAware
        style={styles.appContainer}
      >
        {content}
      </LiquidGlassWrapper>
    );
  }

  return content;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <SettingsProvider>
          <LocalizationProvider>
            <AppThemeProvider>
              <OnboardingProvider>
                <ChatProvider>
                  <RootContent />
                </ChatProvider>
              </OnboardingProvider>
            </AppThemeProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
