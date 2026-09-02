import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { PressableRipple } from "../../PressableRipple";
import { useSettings } from "../../../context/SettingsContext";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../../i18n";
import { devWarn } from "../../../utils/devLog";
import { wait } from "../../../utils/wait";
import { appAlert } from "../../../utils/appAlert";

interface NetworkTest {
  method: string;
  status: "waiting" | "configuring" | "configured";
  description: string;
}

export function NetworkSetupScreen() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { t } = useTranslation();
  const { applyRecommendedNetworkSettings } = useSettings();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isApplyingSettings, setIsApplyingSettings] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [recommendedSetting, setRecommendedSetting] = useState<boolean | null>(
    null,
  );
  const [networkTests, setNetworkTests] = useState<NetworkTest[]>([
    {
      method: t("screen.onboarding.networkSetup.tests.native.name"),
      status: "waiting",
      description: t("screen.onboarding.networkSetup.tests.native.description"),
    },
    {
      method: t("screen.onboarding.networkSetup.tests.udp.name"),
      status: "waiting",
      description: t("screen.onboarding.networkSetup.tests.udp.description"),
    },
    {
      method: t("screen.onboarding.networkSetup.tests.tcp.name"),
      status: "waiting",
      description: t("screen.onboarding.networkSetup.tests.tcp.description"),
    },
  ]);
  const isMountedRef = React.useRef(true);

  const applyRecommendedSettings = async () => {
    if (recommendedSetting !== null) {
      setIsApplyingSettings(true);
      try {
        await applyRecommendedNetworkSettings(recommendedSetting);
      } catch (error) {
        devWarn(
          "[NetworkSetupScreen] Failed to apply recommended settings",
          error,
        );
        appAlert(
          t("screen.onboarding.networkSetup.alerts.errorTitle"),
          t("screen.onboarding.networkSetup.alerts.errorMessage"),
        );
        setIsApplyingSettings(false);
        return;
      }
      setIsApplyingSettings(false);

      appAlert(
        t("screen.onboarding.networkSetup.alerts.successTitle"),
        t("screen.onboarding.networkSetup.alerts.successMessage"),
        [
          {
            text: t("screen.onboarding.networkSetup.alerts.successButton"),
            style: "default",
          },
        ],
      );
    }
  };

  // Effect: defer network optimization to allow initial UI paint.
  useEffect(() => {
    isMountedRef.current = true;
    const updateTest = (index: number, updates: Partial<NetworkTest>) => {
      setNetworkTests((prev) =>
        prev.map((test, i) => (i === index ? { ...test, ...updates } : test)),
      );
    };

    const runNetworkOptimization = async () => {
      setIsOptimizing(true);

      try {
        // Visual configuration progression; this applies the transport order
        // without pretending to measure live network success.
        const stageDelaysMs = [1000, 800, 600];
        for (const [index, delayMs] of stageDelaysMs.entries()) {
          updateTest(index, { status: "configuring" });
          await wait(delayMs);
          if (!isMountedRef.current) return;
          updateTest(index, { status: "configured" });
        }

        // Default to automatic fallback chain (no probing yet).
        setRecommendedSetting(true);

        setOptimizationComplete(true);
      } catch (error) {
        devWarn("[NetworkSetupScreen] Network configuration failed", error);
        appAlert(
          t("screen.onboarding.networkSetup.alerts.errorTitle"),
          t("screen.onboarding.networkSetup.alerts.errorMessage"),
        );
      }
      // Replaces `finally`; mount-guarded so the early `!isMountedRef` returns
      // (where this would be a no-op anyway) skip it harmlessly.
      if (isMountedRef.current) {
        setIsOptimizing(false);
      }
    };

    const timer = setTimeout(() => {
      runNetworkOptimization();
    }, 1000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
    };
  }, [t]);

  return (
    <View testID="onboarding-network-setup" style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text
            style={[typography.displayMedium, { color: palette.accentText }]}
          >
            {t("screen.onboarding.networkSetup.label")}
          </Text>

          <Text
            style={[
              typography.title1,
              styles.title,
              { color: palette.textPrimary },
            ]}
          >
            {t("screen.onboarding.networkSetup.title")}
          </Text>

          <Text
            style={[
              typography.callout,
              styles.subtitle,
              { color: palette.textSecondary },
            ]}
          >
            {t("screen.onboarding.networkSetup.subtitle")}
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
              {t("screen.onboarding.networkSetup.disclaimer")}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.testsSection,
            {
              backgroundColor: palette.solid,
              borderColor: palette.border,
            },
          ]}
        >
          {networkTests.map((test, index) => (
            <NetworkTestItem
              key={test.method}
              test={test}
              isLast={index === networkTests.length - 1}
              palette={palette}
              typography={typography}
              isActive={isOptimizing && test.status === "configuring"}
            />
          ))}
        </View>

        {optimizationComplete && recommendedSetting !== null && (
          <View
            accessibilityLiveRegion="polite"
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
                { color: palette.accentText },
              ]}
            >
              {t("screen.onboarding.networkSetup.optimization.title")}
            </Text>

            <Text
              style={[
                typography.callout,
                styles.recommendationText,
                { color: palette.textPrimary },
              ]}
            >
              {t("screen.onboarding.networkSetup.optimization.description")}
            </Text>

            {/* iOS HIG: Primary action button to apply network optimization results */}
            <PressableRipple
              testID="onboarding-network-apply"
              style={[
                styles.applyButton,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.accentTint,
                },
              ]}
              onPress={applyRecommendedSettings}
              disabled={isApplyingSettings}
              variant="surface"
              pressedOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t(
                "screen.onboarding.networkSetup.accessibility.applyLabel",
              )}
              accessibilityHint={t(
                "screen.onboarding.networkSetup.accessibility.applyHint",
              )}
            >
              <Text
                style={[
                  typography.callout,
                  styles.applyButtonText,
                  { color: palette.accentText, fontWeight: "600" },
                ]}
              >
                {t("screen.onboarding.networkSetup.optimization.applyButton")}
              </Text>
            </PressableRipple>
          </View>
        )}

        {!optimizationComplete && (
          <View
            accessible={true}
            accessibilityLabel={t(
              "screen.onboarding.networkSetup.optimization.loading",
            )}
            accessibilityHint={t(
              "screen.onboarding.networkSetup.optimization.loading",
            )}
            accessibilityRole="progressbar"
            accessibilityLiveRegion="polite"
            style={styles.loadingSection}
          >
            <ActivityIndicator size="large" color={palette.accentText} />
            <Text
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              style={[
                typography.callout,
                styles.loadingText,
                { color: palette.textSecondary },
              ]}
            >
              {t("screen.onboarding.networkSetup.optimization.loading")}
            </Text>
          </View>
        )}
      </ScrollView>

      <OnboardingNavigation
        nextButtonText={
          optimizationComplete
            ? t("screen.onboarding.networkSetup.navigation.continue")
            : t("screen.onboarding.networkSetup.navigation.skip")
        }
        showSkip={false}
      />
    </View>
  );
}

interface NetworkTestItemProps {
  test: NetworkTest;
  isLast: boolean;
  palette: ReturnType<typeof useImessagePalette>;
  typography: ReturnType<typeof useTypography>;
  isActive: boolean;
}

function NetworkTestItem({
  test,
  isLast,
  palette,
  typography,
  isActive,
}: NetworkTestItemProps) {
  const { t } = useTranslation();

  const getStatusLabel = () => {
    switch (test.status) {
      case "configuring":
        return t("screen.onboarding.networkSetup.status.testing");
      case "configured":
        return t("screen.onboarding.networkSetup.status.success");
      case "waiting":
        return t("screen.onboarding.networkSetup.status.waiting");
      default:
        return t("screen.onboarding.networkSetup.status.waiting");
    }
  };

  const getStatusColor = () => {
    switch (test.status) {
      case "configuring":
        return palette.accentText;
      case "configured":
        return palette.success;
      case "waiting":
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
          backgroundColor: isActive
            ? palette.accentSurface
            : palette.transparent,
          borderBottomColor: palette.separator,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          // The active-stage marker is always 2pt wide and only changes color,
          // so rows do not shift horizontally as the progression advances.
          borderLeftColor: isActive ? palette.accentTint : palette.transparent,
        },
      ]}
      accessibilityLiveRegion={isActive ? "polite" : "none"}
      accessible
      accessibilityLabel={`${test.method}. ${test.description}. ${getStatusLabel()}.`}
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
    width: "100%",
    maxWidth: LiquidGlassSpacing.huge * 12,
    alignSelf: "center",
    paddingHorizontal: LiquidGlassSpacing.xl,
    paddingTop: LiquidGlassSpacing.lg,
    paddingBottom: LiquidGlassSpacing.xl,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: LiquidGlassSpacing.xl,
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
    gap: 0,
    marginBottom: LiquidGlassSpacing.xxl,
    borderRadius: LiquidGlassSpacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  testItem: {
    padding: LiquidGlassSpacing.md,
    borderLeftWidth: 2,
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
    borderWidth: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontWeight: "600",
  },
});
