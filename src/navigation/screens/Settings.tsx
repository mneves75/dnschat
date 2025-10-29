import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ScrollView,
} from "react-native";
import {
  useTheme,
  useNavigation,
  NavigationProp,
  ParamListBase,
} from "@react-navigation/native";
import {
  useSettings,
} from "../../context/SettingsContext";
import { useOnboarding } from "../../context/OnboardingContext";
import { persistHapticsPreference } from "../../utils/haptics";
import { useTranslation } from "../../i18n";
import { LOCALE_LABEL_KEYS } from "../../i18n/localeMeta";
import { DEFAULT_DNS_SERVER } from "../../context/settingsStorage";
import { useImessagePalette } from "../../ui/theme/imessagePalette";

export function Settings() {
  const { colors } = useTheme();
  const palette = useImessagePalette();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
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
  const { resetOnboarding } = useOnboarding();
  const [tempDnsServer, setTempDnsServer] = useState(dnsServer);
  const [tempEnableMockDNS, setTempEnableMockDNS] = useState(enableMockDNS);
  const [tempEnableHaptics, setTempEnableHaptics] = useState(enableHaptics);
  const [saving, setSaving] = useState(false);

  // Transport test state
  const [testMessage, setTestMessage] = useState("ping");
  const [testRunning, setTestRunning] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<string | null>(null);
  const [lastTestError, setLastTestError] = useState<string | null>(null);

  // Auto-save handlers
  const handleToggleMockDNS = async (value: boolean) => {
    if (loading) return;
    try {
      setTempEnableMockDNS(value);
      setSaving(true);
      await updateEnableMockDNS(value);
      console.log("✅ Mock DNS saved:", value);
    } catch (e: any) {
      console.log("❌ Failed to save Mock DNS:", e?.message || e);
    } finally {
      setSaving(false);
    }
  };

  const handleDnsServerEndEditing = async () => {
    if (loading) return;
    try {
      setSaving(true);
      await updateDnsServer(tempDnsServer);
      console.log("✅ DNS server saved on blur:", tempDnsServer);
    } catch (e: any) {
      console.log("❌ Failed to save DNS server:", e?.message || e);
      Alert.alert(
        t("screen.settings.alerts.dnsSaveErrorTitle"),
        t("screen.settings.alerts.dnsSaveErrorMessage"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHaptics = async (value: boolean) => {
    await persistHapticsPreference(value, {
      loading,
      setSaving,
      setTempValue: setTempEnableHaptics,
      updateEnableHaptics,
      logLabel: "Enable haptics saved",
    });
  };

  const handleSelectLocale = async (nextLocale: string | null) => {
    try {
      await updateLocale(nextLocale);
    } catch (error) {
      console.log("❌ Failed to update locale:", error);
      Alert.alert(
        t("screen.settings.alerts.saveErrorTitle"),
        t("screen.settings.alerts.saveErrorMessage"),
      );
    }
  };

  // Sync temp state with context values when they change
  React.useEffect(() => {
    setTempDnsServer(dnsServer);
    setTempEnableMockDNS(enableMockDNS);
    setTempEnableHaptics(enableHaptics);
  }, [dnsServer, enableMockDNS, enableHaptics]);

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      await updateDnsServer(tempDnsServer);
      await updateEnableMockDNS(tempEnableMockDNS);
      await updateEnableHaptics(tempEnableHaptics);
      Alert.alert(
        t("screen.settings.alerts.saveSuccessTitle"),
        t("screen.settings.alerts.saveSuccessMessage"),
        [{ text: t("common.ok"), onPress: () => (navigation as any)?.goBack?.() }],
      );
    } catch (error) {
      Alert.alert(
        t("screen.settings.alerts.saveErrorTitle"),
        t("screen.settings.alerts.saveErrorMessage"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      t("screen.settings.alerts.resetTitle"),
      t("screen.settings.alerts.resetMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("screen.settings.alerts.resetConfirm"),
          style: "destructive",
          onPress: () => {
            setTempDnsServer(DEFAULT_DNS_SERVER);
            setTempEnableMockDNS(false);
            setTempEnableHaptics(true);
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
        { text: t("common.cancel"), style: "cancel" },
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

  // Transport test handlers
  const handleTestSelectedPreference = async () => {
    if (testRunning) return;

    try {
      setTestRunning(true);
      setLastTestResult(null);
      setLastTestError(null);

      console.log("🧪 Testing Native DNS with fallbacks:", {
        dnsServer: tempDnsServer,
        enableMockDNS: tempEnableMockDNS,
        testMessage,
      });

      const { DNSService } = await import("../../services/dnsService");
      const response = await DNSService.queryLLM(
        testMessage,
        tempDnsServer,
        tempEnableMockDNS,
        true,
      );

      setLastTestResult(response);
      console.log("✅ Native DNS test successful:", response);
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      setLastTestError(errorMessage);
      console.log("❌ Native DNS test failed:", errorMessage);
    } finally {
      setTestRunning(false);
    }
  };

  const handleForceTransport = async (
    transport: "native" | "udp" | "tcp",
  ) => {
    if (testRunning) return;

    try {
      setTestRunning(true);
      setLastTestResult(null);
      setLastTestError(null);

      console.log(`🧪 Forcing ${transport.toUpperCase()} transport test`);

      const { DNSService } = await import("../../services/dnsService");
      const response = await DNSService.testTransport(
        testMessage,
        transport,
        tempDnsServer,
      );

      setLastTestResult(response);
      console.log(
        `✅ ${transport.toUpperCase()} transport test successful:`,
        response,
      );
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      setLastTestError(errorMessage);
      console.log(
        `❌ ${transport.toUpperCase()} transport test failed:`,
        errorMessage,
      );
    } finally {
      setTestRunning(false);
    }
  };

  const isDirty =
    tempDnsServer !== dnsServer ||
    tempEnableMockDNS !== enableMockDNS ||
    tempEnableHaptics !== enableHaptics;
  const isValidServer = tempDnsServer.trim().length > 0;
  const activeLocaleSelection = preferredLocale ?? null;
  const localeOptions = React.useMemo(
    () => [
      {
        key: "system",
        label: t("screen.settings.sections.language.systemOption"),
        description: t(
          "screen.settings.sections.language.systemDescription",
          { language: t(LOCALE_LABEL_KEYS[systemLocale]) },
        ),
        value: null as string | null,
      },
      ...availableLocales.map((option) => {
        const label = t(LOCALE_LABEL_KEYS[option.locale]);
        return {
          key: option.locale,
          label,
          description: t(
            "screen.settings.sections.language.optionDescription",
            { language: label },
          ),
          value: option.locale,
        };
      }),
    ],
    [availableLocales, systemLocale, t],
  );

  return (
    <KeyboardAvoidingView
      testID="settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("screen.settings.sections.dnsConfig.title")}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {t("screen.settings.sections.dnsConfig.description")}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            {t("screen.settings.sections.dnsConfig.dnsServerLabel")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.card,
              },
            ]}
            value={tempDnsServer}
            onChangeText={setTempDnsServer}
            onEndEditing={handleDnsServerEndEditing}
            placeholder={t(
              "screen.settings.sections.dnsConfig.dnsServerPlaceholder",
            )}
            placeholderTextColor={colors.text + "60"}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            editable={!loading}
          />

          <Text style={[styles.hint, { color: colors.text + "80" }]}>
            {t("screen.settings.sections.dnsConfig.dnsServerHint", {
              server: DEFAULT_DNS_SERVER,
            })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("screen.settings.sections.appBehavior.title")}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {t("screen.settings.sections.appBehavior.description")}
          </Text>

          <View
            style={[
              styles.switchRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>
                {t("screen.settings.sections.appBehavior.enableMockDNS.label")}
              </Text>
              <Text
                style={[
                  styles.switchDescription,
                  { color: colors.text + "80" },
                ]}
              >
                {t("screen.settings.sections.appBehavior.enableMockDNS.description")}
              </Text>
            </View>
            <Switch
              value={tempEnableMockDNS}
              onValueChange={handleToggleMockDNS}
              trackColor={{ false: colors.border, true: "#007AFF" }}
              thumbColor={tempEnableMockDNS ? "#FFFFFF" : "#F4F3F4"}
              ios_backgroundColor={colors.border}
              disabled={loading || saving}
            />
          </View>

          <View
            style={[
              styles.switchRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>
                {t("screen.settings.sections.appBehavior.enableHaptics.label")}
              </Text>
              <Text
                style={[
                  styles.switchDescription,
                  { color: colors.text + "80" },
                ]}
              >
                {t("screen.settings.sections.appBehavior.enableHaptics.description")}
              </Text>
            </View>
            <Switch
              value={tempEnableHaptics}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: colors.border, true: "#007AFF" }}
              thumbColor={tempEnableHaptics ? "#FFFFFF" : "#F4F3F4"}
              ios_backgroundColor={colors.border}
              disabled={loading || saving}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("screen.settings.sections.language.title")}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {t("screen.settings.sections.language.description")}
          </Text>

          <View style={styles.methodContainer}>
            {localeOptions.map((option) => {
              const isActive = activeLocaleSelection === option.value;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.methodOption,
                    {
                      backgroundColor: isActive ? palette.accentSurface : colors.card,
                      borderColor: isActive ? palette.accentBorder : colors.border,
                    },
                  ]}
                  onPress={() => handleSelectLocale(option.value)}
                  disabled={loading}
                  testID={`language-option-${option.key}`}
                >
                  <View style={styles.methodInfo}>
                    <View style={styles.methodHeader}>
                      <Text style={[styles.methodLabel, { color: colors.text }]}>
                        {option.label}
                      </Text>
                      <View
                        style={[
                          styles.radioButton,
                          {
                            borderColor: isActive ? palette.accentTint : colors.border,
                            backgroundColor: isActive
                              ? palette.accentTint
                              : "transparent",
                          },
                        ]}
                      >
                        {isActive && <View style={styles.radioButtonInner} />}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.methodDescription,
                        { color: colors.text + "80" },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("screen.settings.sections.transportTest.title")}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {t("screen.settings.sections.transportTest.description")}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            {t("screen.settings.sections.transportTest.messageLabel")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.card,
              },
            ]}
            value={testMessage}
            onChangeText={setTestMessage}
            placeholder={t(
              "screen.settings.sections.transportTest.placeholder",
            )}
            placeholderTextColor={colors.text + "60"}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!testRunning}
          />

          <TouchableOpacity
            style={[
              styles.testButton,
              {
                backgroundColor: testRunning ? colors.border : palette.accentTint,
                opacity: testRunning ? 0.6 : 1,
              },
            ]}
            onPress={handleTestSelectedPreference}
            disabled={testRunning || !testMessage.trim()}
          >
            <Text style={[styles.testButtonText, { color: palette.solid }]}>
              {testRunning
                ? t("screen.settings.sections.transportTest.testingButton")
                : t("screen.settings.sections.transportTest.testButton")}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
            {t("screen.settings.sections.transportTest.forceLabel")}
          </Text>
          <View style={styles.transportButtons}>
            {(
              [
                {
                  key: "native" as const,
                  label: t(
                    "screen.settings.sections.transportTest.transports.native",
                  ),
                },
                {
                  key: "udp" as const,
                  label: t(
                    "screen.settings.sections.transportTest.transports.udp",
                  ),
                },
                {
                  key: "tcp" as const,
                  label: t(
                    "screen.settings.sections.transportTest.transports.tcp",
                  ),
                },
              ]
            ).map((transport) => (
              <TouchableOpacity
                key={transport.key}
                style={[
                  styles.transportButton,
                  {
                    backgroundColor: testRunning ? colors.border : palette.accentSurface,
                    borderColor: testRunning ? colors.border : palette.accentBorder,
                    opacity: testRunning ? 0.6 : 1,
                  },
                ]}
                onPress={() =>
                  handleForceTransport(
                    transport.key as "native" | "udp" | "tcp",
                  )
                }
                disabled={testRunning}
              >
                <Text
                  style={[styles.transportButtonText, { color: palette.textPrimary }]}
                >
                  {transport.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.logsButton,
              {
                borderColor: colors.text + "40",
                backgroundColor: colors.card,
              },
            ]}
            onPress={() => {
              navigation.navigate("HomeTabs", { screen: "Logs" });
            }}
            disabled={testRunning}
          >
            <Text style={[styles.logsButtonText, { color: colors.text }]}>
              {t("screen.settings.sections.transportTest.viewLogs")}
            </Text>
          </TouchableOpacity>

          {lastTestResult && (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: palette.success + "20",
                  borderColor: palette.success,
                },
              ]}
            >
              <Text style={[styles.resultLabel, { color: palette.success }]}>
                {t("screen.settings.sections.transportTest.resultLabel")}
              </Text>
              <Text style={[styles.resultText, { color: colors.text }]}>
                {lastTestResult}
              </Text>
            </View>
          )}

          {lastTestError && (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: palette.destructive + "20",
                  borderColor: palette.destructive,
                },
              ]}
            >
              <Text style={[styles.resultLabel, { color: palette.destructive }]}>
                {t("screen.settings.sections.transportTest.errorLabel")}
              </Text>
              <Text style={[styles.resultText, { color: colors.text }]}>
                {lastTestError}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("screen.settings.sections.currentConfig.title")}
          </Text>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View>
              <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>
                {t(
                  "screen.settings.sections.currentConfig.dnsServerLabel",
                )}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {dnsServer}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("screen.settings.sections.development.title")}
          </Text>
          {/* iOS HIG: Button to reset onboarding state and replay the tutorial */}
          <TouchableOpacity
            style={[
              styles.devButton,
              { borderColor: colors.text + "40", backgroundColor: colors.card },
            ]}
            onPress={handleResetOnboarding}
            disabled={saving || loading}
            accessibilityRole="button"
            accessibilityLabel={t("screen.settings.sections.development.resetOnboardingTitle")}
            accessibilityHint="Resets the onboarding tutorial so you can view it again on the next app launch"
            accessibilityState={{ disabled: saving || loading }}
          >
            <View>
              <Text style={[styles.devButtonTitle, { color: colors.text }]}>
                {t(
                  "screen.settings.sections.development.resetOnboardingTitle",
                )}
              </Text>
              <Text
                style={[
                  styles.devButtonDescription,
                  { color: colors.text + "80" },
                ]}
              >
                {t(
                  "screen.settings.sections.development.resetOnboardingSubtitle",
                )}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: colors.text + "40" }]}
            onPress={handleReset}
            disabled={saving || loading}
          >
            <Text style={[styles.resetButtonText, { color: colors.text }]}>
              {t("screen.settings.actions.resetButton")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  isDirty && isValidServer ? palette.accentTint : colors.border,
                opacity: saving ? 0.6 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={!isDirty || !isValidServer || saving || loading}
          >
            <Text
              style={[
                styles.saveButtonText,
                { color: isDirty && isValidServer ? palette.solid : colors.text },
              ]}
            >
              {saving
                ? t("screen.settings.actions.saving")
                : t("screen.settings.actions.saveButton")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 6,
  },
  hint: {
    fontSize: 14,
    fontStyle: "italic",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  methodContainer: {
    marginBottom: 20,
  },
  methodOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  methodDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingBottom: 20,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  devButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  devButtonTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  devButtonDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  testButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  transportButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 10,
  },
  transportButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    minWidth: 60,
  },
  transportButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  logsButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  logsButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  resultBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
