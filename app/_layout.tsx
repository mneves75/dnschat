import { Asset } from "expo-asset";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Assets as NavigationAssets } from "@react-navigation/elements";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { HapticsConfigurator } from "../src/components/HapticsConfigurator";
import {
  LiquidGlassWrapper,
  useLiquidGlassCapabilities,
} from "../src/components/LiquidGlassWrapper";
import { AccessibilityProvider } from "../src/context/AccessibilityContext";
import { ChatProvider } from "../src/context/ChatContext";
import { OnboardingProvider, useOnboarding } from "../src/context/OnboardingContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import { I18nProvider } from "../src/i18n";
import { DNSLogService } from "../src/services/dnsLogService";
import { AndroidStartupDiagnostics } from "../src/utils/androidStartupDiagnostics";

const NAVIGATION_ASSETS = [
  ...NavigationAssets,
  require("../src/assets/newspaper.png"),
  require("../src/assets/logs-icon.png"),
  require("../src/assets/info-icon.png"),
];

Asset.loadAsync(NAVIGATION_ASSETS).catch(() => {});
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutContent() {
  const { hasCompletedOnboarding, loading } = useOnboarding();
  const { isSupported: glassSupported } = useLiquidGlassCapabilities();
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  // Effect: hide the splash screen once onboarding state + navigation are ready.
  React.useEffect(() => {
    if (!loading && rootNavigationState?.key) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading, rootNavigationState?.key]);

  // Effect: enforce onboarding flow based on completion state.
  React.useEffect(() => {
    if (!rootNavigationState?.key || loading) {
      return;
    }

    const inOnboarding = segments[0] === "onboarding";

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace("/onboarding");
      return;
    }

    if (hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [hasCompletedOnboarding, loading, rootNavigationState?.key, router, segments]);

  // Effect: initialize DNS log storage once on mount.
  React.useEffect(() => {
    DNSLogService.initialize().catch(() => {
      // Non-fatal: logs viewer will still function in-memory
    });
  }, []);

  // Effect: run Android startup diagnostics in dev mode on mount.
  React.useEffect(() => {
    if (__DEV__ && Platform.OS === "android") {
      AndroidStartupDiagnostics.runDiagnostics()
        .then(() => {
          AndroidStartupDiagnostics.printSummary();
        })
        .catch((error) => {
          AndroidStartupDiagnostics.error(
            "Failed to run diagnostics",
            String(error),
          );
        });
    }
  }, []);

  if (loading || !rootNavigationState?.key) {
    return null;
  }

  const stack = (
    <Stack
      screenOptions={{
        headerBackTitleVisible: false,
        headerBackTitle: "",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[threadId]" />
      <Stack.Screen name="profile/[user]" />
      <Stack.Screen name="(modals)/settings" />
      <Stack.Screen name="dev/logs" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );

  if (glassSupported && Platform.OS === "ios") {
    return (
      <LiquidGlassWrapper
        variant="regular"
        shape="rect"
        enableContainer={true}
        style={{ flex: 1, backgroundColor: "transparent" }}
      >
        {stack}
      </LiquidGlassWrapper>
    );
  }

  return stack;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <React.StrictMode>
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
                        <ThemeProvider value={theme}>
                          <RootLayoutContent />
                        </ThemeProvider>
                      </ChatProvider>
                    </OnboardingProvider>
                  </I18nProvider>
                </AccessibilityProvider>
              </SettingsProvider>
            </ErrorBoundary>
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </React.StrictMode>
  );
}
