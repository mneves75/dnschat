import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "../../context/OnboardingContext";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { OnboardingProgress } from "./OnboardingProgress";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { DNSMagicScreen } from "./screens/DNSMagicScreen";
import { NetworkSetupScreen } from "./screens/NetworkSetupScreen";
import { FirstChatScreen } from "./screens/FirstChatScreen";
import { FeaturesScreen } from "./screens/FeaturesScreen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function OnboardingContainer() {
  const palette = useImessagePalette();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { currentStep, steps } = useOnboarding();

  const renderCurrentScreen = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return null;

    switch (currentStepData.component) {
      case "WelcomeScreen":
        return <WelcomeScreen />;
      case "DNSMagicScreen":
        return <DNSMagicScreen />;
      case "NetworkSetupScreen":
        return <NetworkSetupScreen />;
      case "FirstChatScreen":
        return <FirstChatScreen />;
      case "FeaturesScreen":
        return <FeaturesScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <OnboardingProgress />

      <View style={styles.content}>{renderCurrentScreen()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
});
