import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { PressableRipple } from "../../PressableRipple";
import { useSettings } from "../../../context/SettingsContext";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../../i18n";
import { devWarn } from "../../../utils/devLog";
import { appAlert } from "../../../utils/appAlert";

interface NetworkTest {
  method: string;
  description: string;
}

export function NetworkSetupScreen() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { t } = useTranslation();
  const { applyRecommendedNetworkSettings } = useSettings();

  const [isApplyingSettings, setIsApplyingSettings] = useState(false);
  const networkTests: NetworkTest[] = [
    {
      method: t("screen.onboarding.networkSetup.tests.native.name"),
      description: t("screen.onboarding.networkSetup.tests.native.description"),
    },
    {
      method: t("screen.onboarding.networkSetup.tests.udp.name"),
      description: t("screen.onboarding.networkSetup.tests.udp.description"),
    },
    {
      method: t("screen.onboarding.networkSetup.tests.tcp.name"),
      description: t("screen.onboarding.networkSetup.tests.tcp.description"),
    },
  ];

  const applyRecommendedSettings = async () => {
    if (isApplyingSettings) return;
    setIsApplyingSettings(true);
    try {
      await applyRecommendedNetworkSettings(true);
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
    } catch (error) {
      devWarn(
        "[NetworkSetupScreen] Failed to apply recommended settings",
        error,
      );
      appAlert(
        t("screen.onboarding.networkSetup.alerts.errorTitle"),
        t("screen.onboarding.networkSetup.alerts.errorMessage"),
      );
    }
    setIsApplyingSettings(false);
  };

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
            />
          ))}
        </View>

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
            accessibilityState={{
              disabled: isApplyingSettings,
              busy: isApplyingSettings,
            }}
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
              {isApplyingSettings
                ? t("screen.onboarding.networkSetup.optimization.loading")
                : t("screen.onboarding.networkSetup.optimization.applyButton")}
            </Text>
          </PressableRipple>
        </View>
      </ScrollView>

      <OnboardingNavigation
        nextButtonText={t("screen.onboarding.networkSetup.navigation.continue")}
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
}

function NetworkTestItem({
  test,
  isLast,
  palette,
  typography,
}: NetworkTestItemProps) {
  const { t } = useTranslation();

  const statusLabel = t("screen.onboarding.networkSetup.status.recommended");

  return (
    <View
      style={[
        styles.testItem,
        {
          borderBottomColor: palette.separator,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
      accessible
      accessibilityLabel={`${test.method}. ${test.description}. ${statusLabel}.`}
    >
      <View style={styles.testHeader}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: palette.textSecondary },
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
              { color: palette.textSecondary, fontWeight: "500" },
            ]}
          >
            {statusLabel}
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
