/**
 * GlassSettings - Evan Bacon Glass UI Settings Screen
 *
 * Complete reimplementation of the settings screen using Evan Bacon's
 * glass UI components, showcasing all glass effects and interactions.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support + Evan Bacon Glass UI)
 */

import React from "react";
import {
  StyleSheet,
  Switch,
  Text,
  View,
  Alert,
  Platform,
  Linking,
  Share,
  useColorScheme,
} from "react-native";
import { useChat } from "../../context/ChatContext";
import { useSettings } from "../../context/SettingsContext";
import { useOnboarding } from "../../context/OnboardingContext";
import { useTranslation } from "../../i18n";
import { LOCALE_LABEL_KEYS } from "../../i18n/localeMeta";
import { DEFAULT_DNS_SERVER } from "../../context/settingsStorage";
import { DNSLogService } from "../../services/dnsLogService";
import { StorageService } from "../../services/storageService";

const packageJson = require("../../../package.json");
import {
  Form,
  GlassBottomSheet,
  GlassActionSheet,
  useGlassBottomSheet,
  LiquidGlassWrapper,
} from "../../components/glass";
import { useTransportTestThrottle } from "../../ui/hooks/useTransportTestThrottle";
import { persistHapticsPreference } from "../../utils/haptics";
import { devLog, devWarn } from "../../utils/devLog";

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

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Bottom sheet states
  const dnsServerSheet = useGlassBottomSheet();
  const aboutSheet = useGlassBottomSheet();
  const supportSheet = useGlassBottomSheet();

  // DNS Service options
  const dnsServerOptions = React.useMemo(
    () => [
      {
        value: DEFAULT_DNS_SERVER,
        label: t("screen.glassSettings.dnsOptions.chAt.label"),
        description: t("screen.glassSettings.dnsOptions.chAt.description"),
      },
      {
        value: "llm.pieter.com",
        label: t("screen.glassSettings.dnsOptions.llmPieter.label"),
        description: t(
          "screen.glassSettings.dnsOptions.llmPieter.description",
        ),
      },
    ],
    [t],
  );

  const fallbackDnsOption =
    dnsServerOptions[0] ?? {
      value: DEFAULT_DNS_SERVER,
      label: t("screen.glassSettings.dnsOptions.chAt.label"),
      description: t("screen.glassSettings.dnsOptions.chAt.description"),
    };
  const currentDnsOption =
    dnsServerOptions.find((option) => option.value === dnsServer) ??
    fallbackDnsOption;
  const activeLocaleSelection = preferredLocale ?? null;
  const localeOptions = React.useMemo(
    () => [
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
    ],
    [availableLocales, systemLocale, t],
  );
  const transportLabelMap = React.useMemo(
    () => ({
      native: t("screen.settings.sections.transportTest.transports.native"),
      udp: t("screen.settings.sections.transportTest.transports.udp"),
      tcp: t("screen.settings.sections.transportTest.transports.tcp"),
    }),
    [t],
  );
  const appVersion: string = packageJson.version;
  const aboutFeatureKeys = ["line1", "line2", "line3", "line4", "line5"] as const;

  // Action handlers
  const handleDnsServerSelect = React.useCallback(
    async (server: string) => {
      await updateDnsServer(server);
      dnsServerSheet.hide();

      // Haptic feedback
      if (Platform.OS === "ios") {
      }
    },
    [updateDnsServer, dnsServerSheet],
  );

  const handleShareApp = React.useCallback(async () => {
    try {
      await Share.share({
        message: t("screen.glassSettings.sections.about.shareMessage"),
        url: "https://github.com/mneves75/dnschat",
      });
    } catch (error) {
      devWarn("[GlassSettings] Share failed", error);
    }
  }, [t]);

  const handleOpenGitHub = React.useCallback(() => {
    Linking.openURL("https://github.com/mneves75/dnschat");
  }, []);

  const handleResetSettings = React.useCallback(() => {
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
  }, [
    updateDnsServer,
    updateEnableMockDNS,
    updateEnableHaptics,
    t,
  ]);

  const handleResetOnboarding = React.useCallback(() => {
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
  }, [resetOnboarding, t]);

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
    } catch (e: any) {
      setLastTestError(e?.message || String(e));
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
    } catch (e: any) {
      setLastTestError(e?.message || String(e));
    } finally {
      setTestRunning(false);
    }
  };

  const handleClearData = React.useCallback(() => {
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
  }, [clearingData, loadChats, t]);

  return (
    <>
      <Form.List navigationTitle={t("screen.settings.navigationTitle")}>
        {/* DNS Configuration Section */}
        <Form.Section
          title={t("screen.settings.sections.dnsConfig.title")}
          footer={t("screen.settings.sections.dnsConfig.description")}
        >
          <Form.Item
            title={t("screen.settings.sections.dnsConfig.dnsServerLabel")}
            subtitle={currentDnsOption.label}
            rightContent={<Text style={styles.valueText}>{dnsServer}</Text>}
            onPress={dnsServerSheet.show}
            showChevron
          />

          <Form.Item
            title={t("screen.glassSettings.sections.dnsConfig.mockTitle")}
            subtitle={t("screen.glassSettings.sections.dnsConfig.mockSubtitle")}
            rightContent={
              <Switch
                value={enableMockDNS}
                onValueChange={handleToggleMockDNS}
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={Platform.OS === "ios" ? undefined : "#f4f3f4"}
              />
            }
          />
          <Form.Item
            title={t("screen.settings.sections.appBehavior.enableHaptics.label")}
            subtitle={t(
              "screen.settings.sections.appBehavior.enableHaptics.description",
            )}
            rightContent={
              <Switch
                value={enableHaptics}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={Platform.OS === "ios" ? undefined : "#f4f3f4"}
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
              title={option.title}
              subtitle={option.subtitle}
              rightContent={
                activeLocaleSelection === option.value && (
                  <Text style={styles.selectedIndicator}>•</Text>
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
            onPress={() => {}}
            rightContent={<Text style={styles.valueText}>{testMessage}</Text>}
          />
          <LiquidGlassWrapper
            variant="interactive"
            shape="capsule"
            style={{ marginVertical: 8, alignItems: "center", padding: 10 }}
          >
            <Text
              onPress={handleTestSelectedPreference}
              style={{ color: "#007AFF" }}
            >
              {testRunning
                ? t("screen.settings.sections.transportTest.testingButton")
                : t("screen.settings.sections.transportTest.testButton")}
            </Text>
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
                <Text onPress={() => handleForceTransport(transportKey)}>
                  {transportLabelMap[transportKey]}
                </Text>
              </LiquidGlassWrapper>
            ))}
          </View>

          {lastTestResult && (
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                {t("screen.glassSettings.results.label", {
                  value: lastTestResult,
                })}
              </Text>
            </View>
          )}
          {lastTestError && (
            <View style={styles.aboutCard}>
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
            title={t("screen.glassSettings.sections.about.appVersionTitle")}
            subtitle={t(
              "screen.glassSettings.sections.about.appVersionSubtitle",
              { version: appVersion },
            )}
            rightContent={
              <LiquidGlassWrapper
                variant="interactive"
                shape="capsule"
                style={styles.versionBadge}
              >
                <Text style={styles.versionText}>
                  {t("screen.glassSettings.sections.about.latestBadge")}
                </Text>
              </LiquidGlassWrapper>
            }
            onPress={aboutSheet.show}
          />

          <Form.Link
            title={t("screen.glassSettings.sections.about.githubTitle")}
            subtitle={t(
              "screen.glassSettings.sections.about.githubSubtitle",
            )}
            onPress={handleOpenGitHub}
          />

          <Form.Item
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
            title={t("screen.glassSettings.sections.advanced.clearCacheTitle")}
            subtitle={t(
              "screen.glassSettings.sections.advanced.clearCacheSubtitle",
            )}
            onPress={handleClearData}
            showChevron
          />

          <Form.Item
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
            title={t("screen.glassSettings.sections.support.helpTitle")}
            subtitle={t("screen.glassSettings.sections.support.helpSubtitle")}
            onPress={supportSheet.show}
            showChevron
          />

          <Form.Item
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
            title={t("screen.settings.sections.development.resetOnboardingTitle")}
            subtitle={t("screen.settings.sections.development.resetOnboardingSubtitle")}
            onPress={handleResetOnboarding}
            showChevron
          />
        </Form.Section>
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
              key={option.value}
              title={option.label}
              subtitle={option.description}
              rightContent={
                dnsServer === option.value && (
                  <Text style={styles.selectedIndicator}>•</Text>
                )
              }
              onPress={() => handleDnsServerSelect(option.value)}
              style={[
                styles.dnsOption,
                dnsServer === option.value && styles.selectedDnsOption,
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
            style={styles.aboutCard}
          >
            <Text
              style={[
                styles.aboutText,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
            >
              {t("screen.glassSettings.aboutSheet.overview")}
            </Text>
          </LiquidGlassWrapper>

          <View style={styles.aboutFeatures}>
            <Text
              style={[
                styles.featureTitle,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
            >
              {t("screen.glassSettings.aboutSheet.featuresTitle")}
            </Text>
            {aboutFeatureKeys.map((featureKey) => (
              <Text
                key={featureKey}
                style={[
                  styles.featureItem,
                  { color: isDark ? "#AEAEB2" : "#6D6D70" },
                ]}
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
    color: "#8E8E93",
    fontWeight: "400",
  },
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 122, 255, 0.15)", // iOS system blue
  },
  versionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B35", // Notion orange
  },
  dnsOptionsContainer: {
    paddingTop: 8,
  },
  dnsOption: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  selectedDnsOption: {
    backgroundColor: "rgba(255, 69, 58, 0.1)", // Notion red
  },
  selectedIndicator: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF453A", // Modern red
  },
  aboutContent: {
    paddingTop: 16,
  },
  aboutCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
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
