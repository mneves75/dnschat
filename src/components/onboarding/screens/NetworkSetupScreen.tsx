import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { useSettings } from "../../../context/SettingsContext";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";

interface NetworkTest {
  method: string;
  status: "testing" | "success" | "failed" | "skipped";
  latency?: number;
  description: string;
}

export function NetworkSetupScreen() {
  const palette = useImessagePalette();
  const typography = useTypography();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [recommendedSetting, setRecommendedSetting] = useState<boolean | null>(
    null,
  );
  const [networkTests, setNetworkTests] = useState<NetworkTest[]>([
    {
      method: "Native DNS",
      status: "testing",
      description: "Platform-optimized DNS",
    },
    {
      method: "DNS over UDP",
      status: "testing",
      description: "Traditional DNS queries",
    },
    {
      method: "DNS over TCP",
      status: "testing",
      description: "Reliable TCP fallback",
    },
    {
      method: "DNS over HTTPS",
      status: "testing",
      description: "Privacy-enhanced DNS",
    },
  ]);

  const runNetworkOptimization = async () => {
    setIsOptimizing(true);

    const updateTest = (index: number, updates: Partial<NetworkTest>) => {
      setNetworkTests((prev) =>
        prev.map((test, i) => (i === index ? { ...test, ...updates } : test)),
      );
    };

    try {
      const getRandomInt = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const dohLatency = getRandomInt(70, 130);
      const nativeLatency = dohLatency + getRandomInt(5, 60);
      const udpLatency = nativeLatency + getRandomInt(10, 80);
      const tcpLatency = udpLatency + getRandomInt(10, 90);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateTest(0, { status: "success", latency: nativeLatency });

      await new Promise((resolve) => setTimeout(resolve, 800));
      updateTest(1, { status: "success", latency: udpLatency });

      await new Promise((resolve) => setTimeout(resolve, 600));
      updateTest(2, { status: "success", latency: tcpLatency });

      await new Promise((resolve) => setTimeout(resolve, 700));
      updateTest(3, { status: "success", latency: dohLatency });

      const shouldPreferHttps = dohLatency < nativeLatency;
      setRecommendedSetting(shouldPreferHttps);

      setOptimizationComplete(true);
    } catch (error) {
      Alert.alert(
        "Error",
        "Network optimization failed. Using default settings.",
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyRecommendedSettings = async () => {
    if (recommendedSetting !== null) {
      Alert.alert(
        "Settings Applied",
        `Network optimization complete. DNS will use automatic fallback chain for best performance.`,
        [{ text: "Great", style: "default" }],
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runNetworkOptimization();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={[typography.displayMedium, { color: palette.accentTint }]}>
            Setup
          </Text>

          <Text
            style={[
              typography.title1,
              styles.title,
              { color: palette.textPrimary },
            ]}
          >
            Network Optimization
          </Text>

          <Text
            style={[
              typography.callout,
              styles.subtitle,
              { color: palette.textSecondary },
            ]}
          >
            We're testing your network to find the fastest DNS methods
          </Text>

          <View
            style={[
              styles.disclaimerContainer,
              {
                backgroundColor: palette.accentSurface,
                borderColor: palette.accentBorder,
              },
            ]}
          >
            <Text
              style={[
                typography.footnote,
                styles.disclaimer,
                { color: palette.textSecondary },
              ]}
            >
              This is a simulated demonstration
            </Text>
          </View>
        </View>

        <View style={styles.testsSection}>
          {networkTests.map((test, index) => (
            <NetworkTestItem
              key={test.method}
              test={test}
              palette={palette}
              typography={typography}
              isActive={isOptimizing && test.status === "testing"}
            />
          ))}
        </View>

        {optimizationComplete && recommendedSetting !== null && (
          <View
            style={[
              styles.recommendationContainer,
              {
                backgroundColor: palette.accentSurface,
                borderColor: palette.accentBorder,
              },
            ]}
          >
            <Text
              style={[
                typography.headline,
                styles.recommendationTitle,
                { color: palette.accentTint },
              ]}
            >
              Optimization Complete
            </Text>

            <Text
              style={[
                typography.callout,
                styles.recommendationText,
                { color: palette.textPrimary },
              ]}
            >
              Based on your network conditions, we recommend{" "}
              {recommendedSetting ? "enabling" : "disabling"} DNS over HTTPS for
              optimal performance and privacy.
            </Text>

            <TouchableOpacity
              style={[
                styles.applyButton,
                { backgroundColor: palette.accentTint },
              ]}
              onPress={applyRecommendedSettings}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  typography.callout,
                  styles.applyButtonText,
                  { color: palette.solid, fontWeight: "600" },
                ]}
              >
                Apply Recommended Settings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!optimizationComplete && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={palette.accentTint} />
            <Text
              style={[
                typography.callout,
                styles.loadingText,
                { color: palette.textSecondary },
              ]}
            >
              Optimizing your DNS settings...
            </Text>
          </View>
        )}
      </ScrollView>

      <OnboardingNavigation
        nextButtonText={optimizationComplete ? "Continue" : "Skip Optimization"}
        showSkip={false}
      />
    </View>
  );
}

interface NetworkTestItemProps {
  test: NetworkTest;
  palette: ReturnType<typeof useImessagePalette>;
  typography: ReturnType<typeof useTypography>;
  isActive: boolean;
}

function NetworkTestItem({ test, palette, typography, isActive }: NetworkTestItemProps) {
  const getStatusLabel = () => {
    switch (test.status) {
      case "testing":
        return isActive ? "Testing" : "Waiting";
      case "success":
        return "Success";
      case "failed":
        return "Failed";
      case "skipped":
        return "Skipped";
      default:
        return "Waiting";
    }
  };

  const getStatusColor = () => {
    switch (test.status) {
      case "testing":
        return palette.accentTint;
      case "success":
        return palette.success;
      case "failed":
        return palette.destructive;
      case "skipped":
        return palette.textTertiary;
      default:
        return palette.textTertiary;
    }
  };

  return (
    <View
      style={[
        styles.testItem,
        {
          backgroundColor: palette.surface,
          borderColor: isActive ? palette.accentBorder : palette.border,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      <View style={styles.testHeader}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <View style={styles.testInfo}>
          <Text
            style={[
              typography.callout,
              styles.testMethod,
              { color: palette.textPrimary, fontWeight: "600" },
            ]}
          >
            {test.method}
          </Text>
          <Text
            style={[
              typography.footnote,
              styles.testDescription,
              { color: palette.textSecondary },
            ]}
          >
            {test.description}
          </Text>
        </View>
        <View style={styles.testStatus}>
          <Text
            style={[
              typography.caption1,
              styles.statusLabel,
              { color: getStatusColor(), fontWeight: "500" },
            ]}
          >
            {getStatusLabel()}
          </Text>
          {test.latency && (
            <Text
              style={[
                typography.caption1,
                styles.latencyBadge,
                { color: getStatusColor(), fontWeight: "500" },
              ]}
            >
              {test.latency}ms
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: LiquidGlassSpacing.xl,
    paddingTop: LiquidGlassSpacing.lg,
    paddingBottom: 100,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: LiquidGlassSpacing.xxxl,
  },
  title: {
    textAlign: "center",
    marginBottom: LiquidGlassSpacing.sm,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
    marginBottom: LiquidGlassSpacing.md,
  },
  disclaimerContainer: {
    paddingVertical: LiquidGlassSpacing.xxs,
    paddingHorizontal: LiquidGlassSpacing.sm,
    borderRadius: LiquidGlassSpacing.xs,
    borderWidth: 1,
    marginTop: LiquidGlassSpacing.xs,
  },
  disclaimer: {
    textAlign: "center",
    fontStyle: "italic",
  },
  testsSection: {
    gap: LiquidGlassSpacing.sm,
    marginBottom: LiquidGlassSpacing.xxl,
  },
  testItem: {
    padding: LiquidGlassSpacing.md,
    borderRadius: LiquidGlassSpacing.sm,
  },
  testHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: LiquidGlassSpacing.xs,
    height: LiquidGlassSpacing.xs,
    borderRadius: LiquidGlassSpacing.xxs,
    marginRight: LiquidGlassSpacing.sm,
  },
  testInfo: {
    flex: 1,
  },
  testMethod: {
    marginBottom: 2,
  },
  testDescription: {
    opacity: 0.7,
  },
  testStatus: {
    alignItems: "flex-end",
  },
  statusLabel: {
    marginBottom: 2,
  },
  latencyBadge: {
    paddingHorizontal: LiquidGlassSpacing.xs,
    paddingVertical: 2,
  },
  loadingSection: {
    alignItems: "center",
    gap: LiquidGlassSpacing.md,
  },
  loadingText: {
    opacity: 0.8,
  },
  recommendationContainer: {
    padding: LiquidGlassSpacing.lg,
    borderRadius: LiquidGlassSpacing.md,
    marginBottom: LiquidGlassSpacing.lg,
    borderWidth: 1,
  },
  recommendationTitle: {
    fontWeight: "700",
    marginBottom: LiquidGlassSpacing.xs,
  },
  recommendationText: {
    marginBottom: LiquidGlassSpacing.md,
  },
  applyButton: {
    paddingVertical: LiquidGlassSpacing.sm,
    paddingHorizontal: LiquidGlassSpacing.lg,
    borderRadius: LiquidGlassSpacing.xs,
    alignItems: "center",
  },
  applyButtonText: {
    fontWeight: "600",
  },
});
