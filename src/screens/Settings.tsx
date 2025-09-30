import React from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { DNSMethodPreference } from "../context/SettingsContext";
import { useAppTheme } from "../theme";
import { DNSLogService } from "../services/dnsLogService";
import { nativeDNS } from "../../modules/dns-native";
import { useSettingsControls } from "./hooks/useSettingsControls";

const PREFERENCE_OPTIONS: Array<{
  key: DNSMethodPreference;
  label: string;
  description: string;
}> = [
  {
    key: "automatic",
    label: "Automatic",
    description: "Balanced fallback chain",
  },
  {
    key: "prefer-https",
    label: "Prefer HTTPS",
    description: "DNS-over-HTTPS first (requires experimental transports)",
  },
  {
    key: "udp-only",
    label: "UDP Only",
    description: "Fastest direct UDP queries",
  },
  {
    key: "never-https",
    label: "Never HTTPS",
    description: "Native/UDP/TCP only",
  },
  {
    key: "native-first",
    label: "Native First",
    description: "Always try native module before fallbacks",
  },
];

export function Settings(): React.JSX.Element {
  const { colors } = useAppTheme();
  const {
    state: {
      dnsServer,
      preferDnsOverHttps,
      dnsMethodPreference,
      enableMockDNS,
      allowExperimentalTransports,
      loading,
    },
    actions: {
      setDnsServer,
      setPreferDnsOverHttps,
      setDnsMethodPreference,
      setEnableMockDNS,
      setAllowExperimentalTransports,
      resetOnboarding,
    },
  } = useSettingsControls();

  const [dnsServerInput, setDnsServerInput] = React.useState(dnsServer);
  const [savingDnsServer, setSavingDnsServer] = React.useState(false);
  const [testMessage, setTestMessage] = React.useState("ping");
  const [testRunning, setTestRunning] = React.useState(false);
  const [lastTestResult, setLastTestResult] = React.useState<string | null>(null);
  const [lastTestError, setLastTestError] = React.useState<string | null>(null);
  const [verifyingNative, setVerifyingNative] = React.useState(false);

  React.useEffect(() => {
    setDnsServerInput(dnsServer);
  }, [dnsServer]);

  const saveDnsServer = React.useCallback(async () => {
    if (loading || savingDnsServer) {
      return;
    }
    setSavingDnsServer(true);
    const result = await setDnsServer(dnsServerInput.trim());
    setSavingDnsServer(false);

    if (!result.ok) {
      Alert.alert("Save Failed", result.message);
      return;
    }

    Alert.alert("Saved", `DNS server updated to ${dnsServerInput.trim()}`);
  }, [dnsServerInput, loading, savingDnsServer, setDnsServer]);

  const handleToggle = React.useCallback(
    (updater: (value: boolean) => Promise<{ ok: boolean; message?: string }> ) =>
      async (value: boolean) => {
        const result = await updater(value);
        if (!result.ok && result.message) {
          Alert.alert("Update Failed", result.message);
        }
      },
    [],
  );

  const handleSelectPreference = React.useCallback(
    async (preference: DNSMethodPreference) => {
      const result = await setDnsMethodPreference(preference);
      if (!result.ok) {
        Alert.alert("Update Failed", result.message);
      }
    },
    [setDnsMethodPreference],
  );

  const verifyNativeDns = React.useCallback(async () => {
    if (verifyingNative) return;
    setVerifyingNative(true);
    try {
      const capabilities = await nativeDNS.isAvailable();
      await DNSLogService.recordSettingsEvent(
        "Native DNS verification",
        JSON.stringify(capabilities),
      );
      Alert.alert(
        "Native DNS",
        `Platform: ${capabilities.platform}\nCustom servers: ${capabilities.supportsCustomServer ? "yes" : "no"}\nAsync queries: ${capabilities.supportsAsyncQuery ? "yes" : "no"}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "Unknown error");
      await DNSLogService.recordSettingsEvent(
        "Native DNS verification failed",
        message,
      );
      Alert.alert("Native DNS", message);
    } finally {
      setVerifyingNative(false);
    }
  }, []);

  const runTransportTest = React.useCallback(async () => {
    if (testRunning) return;
    setTestRunning(true);
    setLastTestResult(null);
    setLastTestError(null);

    try {
      const { DNSService } = await import("../services/dnsService");
      const response = await DNSService.queryLLM(
        testMessage,
        dnsServer,
        preferDnsOverHttps,
        dnsMethodPreference,
        enableMockDNS,
        allowExperimentalTransports,
      );
      setLastTestResult(response);
    } catch (error) {
      setLastTestError(
        error instanceof Error ? error.message : String(error ?? "Unknown error"),
      );
    } finally {
      setTestRunning(false);
    }
  }, [
    allowExperimentalTransports,
    dnsMethodPreference,
    dnsServer,
    enableMockDNS,
    preferDnsOverHttps,
    testMessage,
  ]);

  const handleResetOnboarding = React.useCallback(async () => {
    await resetOnboarding();
    Alert.alert("Onboarding", "Onboarding flow will be shown on next launch.");
  }, [resetOnboarding]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>DNS Server</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={dnsServerInput}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          onChangeText={setDnsServerInput}
          placeholder="ch.at"
        />
        <Button
          title={savingDnsServer ? "Saving..." : "Save"}
          onPress={saveDnsServer}
          disabled={loading || savingDnsServer}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        <Row
          label="Prefer DNS-over-HTTPS"
          description="Use Cloudflare's DoH when available"
          value={preferDnsOverHttps}
          onValueChange={handleToggle(setPreferDnsOverHttps)}
          colors={colors}
        />
        <Row
          label="Allow Experimental Transports"
          description="Enable UDP/TCP/HTTPS fallbacks"
          value={allowExperimentalTransports}
          onValueChange={handleToggle(setAllowExperimentalTransports)}
          colors={colors}
        />
        <Row
          label="Enable Mock DNS"
          description="Serve responses from local mock"
          value={enableMockDNS}
          onValueChange={handleToggle(setEnableMockDNS)}
          colors={colors}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transport Order</Text>
        {PREFERENCE_OPTIONS.map((option) => (
          <PreferenceButton
            key={option.key}
            active={dnsMethodPreference === option.key}
            option={option}
            onPress={handleSelectPreference}
            textColor={colors.text}
            borderColor={colors.border}
            accentColor={colors.accent}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Diagnostics</Text>
        <Button
          title={verifyingNative ? "Verifying..." : "Verify Native DNS"}
          onPress={verifyNativeDns}
          disabled={verifyingNative}
        />
        <View style={styles.spacer} />
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={testMessage}
          onChangeText={setTestMessage}
          placeholder="ping"
        />
        <Button
          title={testRunning ? "Testing..." : "Run Transport Test"}
          onPress={runTransportTest}
          disabled={testRunning}
        />
        {lastTestResult && (
          <Text style={[styles.resultText, { color: colors.text }]}>
            Result: {lastTestResult}
          </Text>
        )}
        {lastTestError && (
          <Text style={[styles.errorText, { color: "#FF453A" }]}>
            Error: {lastTestError}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Button title="Reset Onboarding" onPress={handleResetOnboarding} />
      </View>
    </ScrollView>
  );
}

function Row({
  label,
  description,
  value,
  onValueChange,
  colors,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors?: any;
}): React.JSX.Element {
  const themeColors = colors || {
    text: "#000000",
    muted: "#6D6D70",
  };

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: themeColors.text }]}>{label}</Text>
        <Text style={[styles.rowDescription, { color: themeColors.muted }]}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function PreferenceButton({
  option,
  active,
  onPress,
  textColor,
  borderColor,
  accentColor,
}: {
  option: (typeof PREFERENCE_OPTIONS)[number];
  active: boolean;
  onPress: (key: DNSMethodPreference) => void;
  textColor: string;
  borderColor: string;
  accentColor?: string;
}): React.JSX.Element {
  const themeAccent = accentColor || "#007AFF";

  return (
    <Text
      onPress={() => onPress(option.key)}
      style={[
        styles.preferenceButton,
        {
          borderColor,
          backgroundColor: active ? themeAccent + "15" : "transparent",
          color: textColor,
        },
      ]}
    >
      {option.label}
      {"\n"}
      <Text style={[styles.preferenceDescription, { color: textColor + "80" }]}>{option.description}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  rowDescription: {
    fontSize: 13,
    color: "#6D6D70",
  },
  preferenceButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  preferenceDescription: {
    fontSize: 12,
    color: "#6D6D70",
  },
  spacer: {
    height: 12,
  },
  resultText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  },
});
