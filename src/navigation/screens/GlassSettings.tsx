/**
 * GlassSettings - Evan Bacon Glass UI Settings Screen
 *
 * Complete reimplementation of the settings screen using Evan Bacon's
 * glass UI components, showcasing all glass effects and interactions.
 *
 * Features:
 * - Screen entrance animations
 * - Palette-based theming
 * - Glass UI components
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support + Evan Bacon Glass UI)
 * @see IOS-GUIDELINES.md - iOS 26 Liquid Glass patterns
 */

import React from "react";
import {
  DynamicColorIOS,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  Linking,
  Share,
} from "react-native";
import Animated from "react-native-reanimated";
import { useChat } from "../../context/ChatContext";
import { useSettings } from "../../context/SettingsContext";
import { useOnboarding } from "../../context/OnboardingContext";
import { useTranslation } from "../../i18n";
import { LOCALE_LABEL_KEYS } from "../../i18n/localeMeta";
import { DEFAULT_DNS_SERVER } from "../../context/settingsStorage";
import { DNSLogService } from "../../services/dnsLogService";
import { StorageService } from "../../services/storageService";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useScreenEntrance } from "../../ui/hooks/useScreenEntrance";

import {
  Form,
  GlassBottomSheet,
  GlassActionSheet,
  useGlassBottomSheet,
  LiquidGlassWrapper,
} from "../../components/glass";
import { useTransportTestThrottle } from "../../ui/hooks/useTransportTestThrottle";
import { HapticFeedback, persistHapticsPreference } from "../../utils/haptics";
import { devLog, devWarn } from "../../utils/devLog";
import { getAppVersionInfo } from "../../utils/appVersion";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
};

// ==================================================================================
// GLASS SETTINGS SCREEN COMPONENT
// ==================================================================================

export function GlassSettings() {
  const {
    dnsServer,
    updateDnsServer,
    enableMockDNS,
    updateEnableMockDNS,
    enableHaptics,
    updateEnableHaptics,
    systemLocale,
    preferredLocale,
    availableLocales,
    updateLocale,
    loading,
  } = useSettings();
  const { loadChats } = useChat();
  const { t } = useTranslation();
  const { resetOnboarding } = useOnboarding();
  const palette = useImessagePalette();
  const { animatedStyle } = useScreenEntrance();

  // Bottom sheet states
  const dnsServerSheet = useGlassBottomSheet();
  const aboutSheet = useGlassBottomSheet();
  const supportSheet = useGlassBottomSheet();

  // DNS Service options - llm.pieter.com is now the default (ch.at is offline)
  const dnsServerOptions = [
    {
      value: "llm.pieter.com",
      label: t("screen.glassSettings.dnsOptions.llmPieter.label"),
      description: t(
        "screen.glassSettings.dnsOptions.llmPieter.description",
      ),
    },
    {
      value: "ch.at",
      label: t("screen.glassSettings.dnsOptions.chAt.label"),
      description: t("screen.glassSettings.dnsOptions.chAt.description"),
    },
  ];

  const fallbackDnsOption =
    dnsServerOptions[0] ?? {
      value: DEFAULT_DNS_SERVER,
      label: t("screen.glassSettings.dnsOptions.llmPieter.label"),
      description: t("screen.glassSettings.dnsOptions.llmPieter.description"),
    };
  const currentDnsOption =
    dnsServerOptions.find((option) => option.value === dnsServer) ??
    fallbackDnsOption;
  const activeLocaleSelection = preferredLocale ?? null;
  const localeOptions = [
    {
      key: "system",
      title: t("screen.settings.sections.language.systemOption"),
      subtitle: t(
        "screen.settings.sections.language.systemDescription",
        { language: t(LOCALE_LABEL_KEYS[systemLocale]) },
      ),
      value: null as string | null,
    },
    ...availableLocales.map((option) => {
      const label = t(LOCALE_LABEL_KEYS[option.locale]);
      return {
        key: option.locale,
        title: label,
        subtitle: t(
          "screen.settings.sections.language.optionDescription",
          { language: label },
        ),
        value: option.locale,
      };
    }),
  ];
  const transportLabelMap = {
    native: t("screen.settings.sections.transportTest.transports.native"),
    udp: t("screen.settings.sections.transportTest.transports.udp"),
    tcp: t("screen.settings.sections.transportTest.transports.tcp"),
  };
  const appVersion: string = getAppVersionInfo().displayVersion;
  const aboutFeatureKeys = ["line1", "line2", "line3", "line4", "line5"] as const;

  // Action handlers
  const handleDnsServerSelect = async (server: string) => {
    await updateDnsServer(server);
    dnsServerSheet.hide();

    // Haptic feedback
    if (Platform.OS === "ios") {
      HapticFeedback.medium();
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: t("screen.glassSettings.sections.about.shareMessage"),
        url: "https://github.com/mneves75/dnschat",
      });
    } catch (error) {
      devWarn("[GlassSettings] Share failed", error);
    }
  };

  const handleOpenGitHub = () => {
    Linking.openURL("https://github.com/mneves75/dnschat");
  };

  const handleResetSettings = () => {
    Alert.alert(
      t("screen.glassSettings.alerts.resetTitle"),
      t("screen.glassSettings.alerts.resetMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("screen.glassSettings.alerts.resetConfirm"),
          style: "destructive",
          onPress: async () => {
            await updateDnsServer(DEFAULT_DNS_SERVER);
            await updateEnableMockDNS(false);
            await updateEnableHaptics(true);
            Alert.alert(
              t("screen.glassSettings.alerts.resetTitle"),
              t("screen.glassSettings.alerts.resetMessage"),
            );
          },
        },
      ],
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      t("screen.settings.alerts.onboardingTitle"),
      t("screen.settings.alerts.onboardingMessage"),
      [
        { text: t("screen.settings.alerts.onboardingCancel"), style: "cancel" },
        {
          text: t("screen.settings.alerts.onboardingConfirm"),
          style: "destructive",
          onPress: async () => {
            await resetOnboarding();
            Alert.alert(
              t("screen.settings.alerts.onboardingResetTitle"),
              t("screen.settings.alerts.onboardingResetMessage"),
            );
          },
        },
      ],
    );
  };

  // Transport test state
  const [testMessage, setTestMessage] = React.useState("ping");
  const [testRunning, setTestRunning] = React.useState(false);
  const [lastTestResult, setLastTestResult] = React.useState<string | null>(
    null,
  );
  const [lastTestError, setLastTestError] = React.useState<string | null>(null);
  const [clearingData, setClearingData] = React.useState(false);

  // Shared throttle keeps diagnostics aligned with docs/SETTINGS.md guidance.
  const {
    checkChainAvailability,
    checkForcedAvailability,
    registerChainRun,
    registerForcedRun,
  } = useTransportTestThrottle();

  const handleToggleMockDNS = async (value: boolean) => {
    try {
      await updateEnableMockDNS(value);
    } catch (e) {
      devLog("Failed to save Mock DNS preference", e);
    }
  };

  const handleSelectLocale = async (nextLocale: string | null) => {
    try {
      await updateLocale(nextLocale);
    } catch (error) {
      devLog("Failed to update locale", error);
      Alert.alert(
        t("screen.settings.alerts.saveErrorTitle"),
        t("screen.settings.alerts.saveErrorMessage"),
      );
    }
  };

  const handleToggleHaptics = async (value: boolean) => {
    await persistHapticsPreference(value, {
      loading,
      updateEnableHaptics,
      logLabel: "Glass enable haptics",
    });
  };

  const handleTestSelectedPreference = async () => {
    if (testRunning) return;
    const throttleMessage = checkChainAvailability();
    if (throttleMessage) {
      setLastTestError(throttleMessage);
      return;
    }

    registerChainRun();
    setTestRunning(true);
    setLastTestResult(null);
    setLastTestError(null);
    try {
      const { DNSService } = await import("../../services/dnsService");
      const response = await DNSService.queryLLM(
        testMessage,
        dnsServer,
        enableMockDNS,
        true,
      );
      setLastTestResult(response);
    } catch (e: unknown) {
      setLastTestError(getErrorMessage(e));
    } finally {
      setTestRunning(false);
    }
  };

  const handleForceTransport = async (
    transport: "native" | "udp" | "tcp",
  ) => {
    if (testRunning) return;
    const throttleMessage = checkForcedAvailability(transport);
    if (throttleMessage) {
      setLastTestError(throttleMessage);
      return;
    }

    registerForcedRun(transport);
    setTestRunning(true);
    setLastTestResult(null);
    setLastTestError(null);
    try {
      const { DNSService } = await import("../../services/dnsService");
      const response = await DNSService.testTransport(
        testMessage,
        transport,
        dnsServer,
      );
      setLastTestResult(response);
    } catch (e: unknown) {
      setLastTestError(getErrorMessage(e));
    } finally {
      setTestRunning(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      t("screen.glassSettings.alerts.clearCacheTitle"),
      t("screen.glassSettings.alerts.clearCacheMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.clear"),
          style: "destructive",
          onPress: async () => {
            if (clearingData) return;
            try {
              setClearingData(true);
              await StorageService.clearAllChats();
              await DNSLogService.clearLogs();
              await loadChats();
              Alert.alert(
                t("screen.glassSettings.alerts.clearCacheSuccessTitle"),
                t("screen.glassSettings.alerts.clearCacheSuccessMessage"),
              );
            } catch (error) {
              devWarn("[GlassSettings] Failed to clear local data", error);
              Alert.alert(
                t("common.errorTitle"),
                t("screen.glassSettings.alerts.clearCacheErrorMessage"),
              );
            } finally {
              setClearingData(false);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Form.List
        testID="settings-screen"
        navigationTitle={t("screen.settings.navigationTitle")}
      >
        <Animated.View style={animatedStyle}>
          {/* DNS Configuration Section */}
          <Form.Section
          title={t("screen.settings.sections.dnsConfig.title")}
          footer={t("screen.settings.sections.dnsConfig.description")}
        >
          <Form.Item
            testID="settings-dns-server"
            title={t("screen.settings.sections.dnsConfig.dnsServerLabel")}
            subtitle={currentDnsOption.label}
            rightContent={
              <Text style={[styles.valueText, { color: palette.textTertiary }]}>
                {dnsServer}
              </Text>
            }
            onPress={dnsServerSheet.show}
            showChevron
          />

          <Form.Item
            testID="settings-mock-dns"
            title={t("screen.glassSettings.sections.dnsConfig.mockTitle")}
            subtitle={t("screen.glassSettings.sections.dnsConfig.mockSubtitle")}
            rightContent={
              <Switch
                testID="settings-mock-dns-switch"
                value={enableMockDNS}
                onValueChange={handleToggleMockDNS}
                trackColor={{ false: palette.textTertiary, true: palette.userBubble }}
                thumbColor={
                  Platform.OS === "android"
                    ? enableMockDNS
                      ? "#FFFFFF"
                      : palette.textTertiary
                    : undefined
                }
              />
            }
          />
          <Form.Item
            testID="settings-haptics"
            title={t("screen.settings.sections.appBehavior.enableHaptics.label")}
            subtitle={t(
              "screen.settings.sections.appBehavior.enableHaptics.description",
            )}
            rightContent={
              <Switch
                testID="settings-haptics-switch"
                value={enableHaptics}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: palette.textTertiary, true: palette.userBubble }}
                thumbColor={
                  Platform.OS === "android"
                    ? enableHaptics
                      ? "#FFFFFF"
                      : palette.textTertiary
                    : undefined
                }
              />
            }
          />
        </Form.Section>

        <Form.Section
          title={t("screen.settings.sections.language.title")}
          footer={t("screen.settings.sections.language.description")}
        >
          {localeOptions.map((option) => (
            <Form.Item
              key={option.key}
              testID={`language-option-${option.key}`}
              title={option.title}
              subtitle={option.subtitle}
              rightContent={
                activeLocaleSelection === option.value && (
                  <Text style={[styles.selectedIndicator, { color: palette.userBubble }]}>•</Text>
                )
              }
              onPress={() => handleSelectLocale(option.value)}
              showChevron
            />
          ))}
        </Form.Section>

        {/* Transport Test */}
        <Form.Section
          title={t("screen.settings.sections.transportTest.title")}
          footer={t("screen.settings.sections.transportTest.description")}
        >
          <Form.Item
            title={t("screen.settings.sections.transportTest.messageLabel")}
            subtitle={testMessage}
            rightContent={
              <Text style={[styles.valueText, { color: palette.textTertiary }]}>
                {testMessage}
              </Text>
            }
          />
          <LiquidGlassWrapper
            variant="interactive"
            shape="capsule"
            style={{ marginVertical: 8, alignItems: "center", padding: 10 }}
          >
            <TouchableOpacity
              testID="settings-transport-test"
              onPress={handleTestSelectedPreference}
              accessibilityRole="button"
              accessibilityLabel={
                testRunning
                  ? t("screen.settings.sections.transportTest.testingButton")
                  : t("screen.settings.sections.transportTest.testButton")
              }
              style={styles.transportTestButton}
            >
              <Text style={{ color: palette.userBubble }}>
                {testRunning
                  ? t("screen.settings.sections.transportTest.testingButton")
                  : t("screen.settings.sections.transportTest.testButton")}
              </Text>
            </TouchableOpacity>
          </LiquidGlassWrapper>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            {(["native", "udp", "tcp"] as const).map((transportKey) => (
              <LiquidGlassWrapper
                key={transportKey}
                variant="interactive"
                shape="capsule"
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <TouchableOpacity
                  testID={`settings-force-${transportKey}`}
                  onPress={() => handleForceTransport(transportKey)}
                  accessibilityRole="button"
                  accessibilityLabel={transportLabelMap[transportKey]}
                  style={styles.transportForceButton}
                >
                  <Text>
                    {transportLabelMap[transportKey]}
                  </Text>
                </TouchableOpacity>
              </LiquidGlassWrapper>
            ))}
          </View>

          {lastTestResult && (
            <View style={[styles.aboutCard, { backgroundColor: palette.highlight }]}>
              <Text style={styles.aboutText}>
                {t("screen.glassSettings.results.label", {
                  value: lastTestResult,
                })}
              </Text>
            </View>
          )}
          {lastTestError && (
            <View style={[styles.aboutCard, { backgroundColor: palette.highlight }]}>
              <Text style={styles.aboutText}>
                {t("screen.glassSettings.results.error", {
                  value: lastTestError,
                })}
              </Text>
            </View>
          )}
        </Form.Section>

        {/* App Information Section */}
        <Form.Section title={t("screen.glassSettings.sections.about.title")}>
          <Form.Item
            testID="settings-about-version"
            title={t("screen.glassSettings.sections.about.appVersionTitle")}
            subtitle={t(
              "screen.glassSettings.sections.about.appVersionSubtitle",
              { version: appVersion },
            )}
            rightContent={
              <LiquidGlassWrapper
                variant="interactive"
                shape="capsule"
                style={[
                  styles.versionBadge,
                  { backgroundColor: palette.accentSurface },
                ]}
              >
                <Text
                  style={[
                    styles.versionText,
                    {
                      color: Platform.OS === "ios"
                        ? DynamicColorIOS({ light: "#FF6B35", dark: "#FF8C5A" })
                        : "#FF6B35",
                    },
                  ]}
                >
                  {t("screen.glassSettings.sections.about.latestBadge")}
                </Text>
              </LiquidGlassWrapper>
            }
            onPress={aboutSheet.show}
          />

          <Form.Link
            testID="settings-github-link"
            title={t("screen.glassSettings.sections.about.githubTitle")}
            subtitle={t(
              "screen.glassSettings.sections.about.githubSubtitle",
            )}
            onPress={handleOpenGitHub}
          />

          <Form.Item
            testID="settings-share-app"
            title={t("screen.glassSettings.sections.about.shareTitle")}
            subtitle={t("screen.glassSettings.sections.about.shareSubtitle")}
            onPress={handleShareApp}
            showChevron
          />
        </Form.Section>

        {/* Advanced Section */}
        <Form.Section
          title={t("screen.glassSettings.sections.advanced.title")}
          footer={t("screen.glassSettings.sections.advanced.footer")}
        >
          <Form.Item
            testID="settings-clear-data"
            title={t("screen.glassSettings.sections.advanced.clearCacheTitle")}
            subtitle={t(
              "screen.glassSettings.sections.advanced.clearCacheSubtitle",
            )}
            onPress={handleClearData}
            showChevron
          />

          <Form.Item
            testID="settings-reset-defaults"
            title={t("screen.glassSettings.sections.advanced.resetTitle")}
            subtitle={t(
              "screen.glassSettings.sections.advanced.resetSubtitle",
            )}
            onPress={handleResetSettings}
            showChevron
          />
        </Form.Section>

        {/* Support Section */}
        <Form.Section title={t("screen.glassSettings.sections.support.title")}>
          <Form.Item
            testID="settings-help"
            title={t("screen.glassSettings.sections.support.helpTitle")}
            subtitle={t("screen.glassSettings.sections.support.helpSubtitle")}
            onPress={supportSheet.show}
            showChevron
          />

          <Form.Item
            testID="settings-report-bug"
            title={t("screen.glassSettings.sections.support.bugTitle")}
            subtitle={t("screen.glassSettings.sections.support.bugSubtitle")}
            onPress={() =>
              Linking.openURL("https://github.com/mneves75/dnschat/issues")
            }
            showChevron
          />
        </Form.Section>

        {/* Development Section */}
          <Form.Section
            title={t("screen.settings.sections.development.title")}
            footer={t("screen.settings.sections.development.resetOnboardingSubtitle")}
          >
            <Form.Item
              testID="settings-reset-onboarding"
              title={t("screen.settings.sections.development.resetOnboardingTitle")}
              subtitle={t("screen.settings.sections.development.resetOnboardingSubtitle")}
              onPress={handleResetOnboarding}
              showChevron
            />
          </Form.Section>
        </Animated.View>
      </Form.List>

      {/* DNS Service Selection Bottom Sheet */}
      <GlassBottomSheet
        visible={dnsServerSheet.visible}
        onClose={dnsServerSheet.hide}
        title={t("screen.glassSettings.dnsServerSheet.title")}
        subtitle={t("screen.glassSettings.dnsServerSheet.subtitle")}
        height={0.7}
      >
        <View style={styles.dnsOptionsContainer}>
          {dnsServerOptions.map((option) => (
            <Form.Item
              testID={`settings-dns-option-${option.value.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}
              key={option.value}
              title={option.label}
              subtitle={option.description}
              rightContent={
                dnsServer === option.value && (
                  <Text style={[styles.selectedIndicator, { color: palette.userBubble }]}>•</Text>
                )
              }
              onPress={() => handleDnsServerSelect(option.value)}
              style={[
                styles.dnsOption,
                { backgroundColor: palette.highlight },
                dnsServer === option.value && {
                  backgroundColor: `${palette.userBubble}1A`,
                },
              ]}
            />
          ))}
        </View>
      </GlassBottomSheet>

      {/* About Bottom Sheet */}
      <GlassBottomSheet
        visible={aboutSheet.visible}
        onClose={aboutSheet.hide}
        title={t("screen.glassSettings.aboutSheet.title")}
        subtitle={t("screen.glassSettings.aboutSheet.subtitle")}
        height={0.6}
      >
        <View style={styles.aboutContent}>
          <LiquidGlassWrapper
            variant="regular"
            shape="roundedRect"
            cornerRadius={12}
            style={[styles.aboutCard, { backgroundColor: palette.highlight }]}
          >
            <Text
              style={[styles.aboutText, { color: palette.textPrimary }]}
            >
              {t("screen.glassSettings.aboutSheet.overview")}
            </Text>
          </LiquidGlassWrapper>

          <View style={styles.aboutFeatures}>
            <Text
              style={[styles.featureTitle, { color: palette.textPrimary }]}
            >
              {t("screen.glassSettings.aboutSheet.featuresTitle")}
            </Text>
            {aboutFeatureKeys.map((featureKey) => (
              <Text
                key={featureKey}
                style={[styles.featureItem, { color: palette.textSecondary }]}
              >
                {`• ${t(
                  `screen.glassSettings.aboutSheet.features.${featureKey}` as const,
                )}`}
              </Text>
            ))}
          </View>
        </View>
      </GlassBottomSheet>

      {/* Support Action Sheet */}
      <GlassActionSheet
        visible={supportSheet.visible}
        onClose={supportSheet.hide}
        title={t("screen.glassSettings.supportSheet.title")}
        message={t("screen.glassSettings.supportSheet.message")}
        actions={[
          {
            title: t("screen.glassSettings.supportSheet.docs"),
            onPress: () =>
              Linking.openURL(
                "https://github.com/mneves75/dnschat/blob/main/README.md",
              ),
          },
          {
            title: t("screen.glassSettings.supportSheet.community"),
            onPress: () =>
              Linking.openURL(
                "https://github.com/mneves75/dnschat/discussions",
              ),
          },
          {
            title: t("screen.glassSettings.supportSheet.email"),
            onPress: () =>
              Linking.openURL(
                "mailto:support@dnschat.app?subject=DNSChat Support",
              ),
          },
          {
            title: t("screen.glassSettings.supportSheet.cancel"),
            onPress: () => {},
            style: "cancel",
          },
        ]}
      />
    </>
  );
}

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  valueText: {
    fontSize: 15,
    fontWeight: "400",
  },
  transportTestButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  transportForceButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "600",
    // color applied inline via DynamicColorIOS for theme awareness
  },
  dnsOptionsContainer: {
    paddingTop: 8,
  },
  dnsOption: {
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedIndicator: {
    fontSize: 16,
    fontWeight: "600",
  },
  aboutContent: {
    paddingTop: 16,
  },
  aboutCard: {
    padding: 16,
    marginBottom: 20,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  aboutFeatures: {
    paddingHorizontal: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 20,
  },
});
