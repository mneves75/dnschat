import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
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

    const trimmedServer = dnsServerInput.trim();
    if (!trimmedServer) {
      Alert.alert("Save Failed", "DNS server cannot be empty.");
      setDnsServerInput(dnsServer);
      return;
    }

    setSavingDnsServer(true);
    const result = await setDnsServer(trimmedServer);
    setSavingDnsServer(false);

    if (!result.ok) {
      Alert.alert("Save Failed", result.message);
      return;
    }

    Alert.alert("Saved", `DNS server updated to ${trimmedServer}`);
  }, [dnsServer, dnsServerInput, loading, savingDnsServer, setDnsServer]);

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
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      contentInsetAdjustmentBehavior="automatic"
    >
      <SectionCard
        title="DNS Server"
        description="Choose which resolver handles TXT queries"
        colors={colors}
      >
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={dnsServerInput}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          onChangeText={setDnsServerInput}
          placeholder="ch.at"
          placeholderTextColor={colors.muted}
          keyboardType="url"
          accessibilityLabel="DNS server hostname"
        />
        <ThemedButton
          label={savingDnsServer ? "Saving…" : "Save DNS Server"}
          onPress={saveDnsServer}
          disabled={loading || savingDnsServer}
          colors={colors}
        />
      </SectionCard>

      <SectionCard
        title="Preferences"
        description="Toggle routing and fallback behavior"
        colors={colors}
      >
        <Row
          label="Prefer DNS-over-HTTPS"
          description="Use Cloudflare's DoH when available"
          value={preferDnsOverHttps}
          onValueChange={handleToggle(setPreferDnsOverHttps)}
          colors={colors}
          accessibilityLabel="Toggle to prefer DNS-over-HTTPS"
        />
        <Row
          label="Allow Experimental Transports"
          description="Enable UDP/TCP/HTTPS fallbacks"
          value={allowExperimentalTransports}
          onValueChange={handleToggle(setAllowExperimentalTransports)}
          colors={colors}
          accessibilityLabel="Toggle to allow experimental transports"
        />
        <Row
          label="Enable Mock DNS"
          description="Serve responses from local mock"
          value={enableMockDNS}
          onValueChange={handleToggle(setEnableMockDNS)}
          colors={colors}
          accessibilityLabel="Toggle to enable mock DNS"
        />
      </SectionCard>

      <SectionCard
        title="Transport Order"
        description="Select the priority order for transports"
        colors={colors}
      >
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
      </SectionCard>

      <SectionCard
        title="Diagnostics"
        description="Validate connectivity and transports"
        colors={colors}
      >
        <ThemedButton
          label={verifyingNative ? "Verifying…" : "Verify Native DNS"}
          onPress={verifyNativeDns}
          disabled={verifyingNative}
          colors={colors}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={testMessage}
          onChangeText={setTestMessage}
          placeholder="ping"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Diagnostic message"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ThemedButton
          label={testRunning ? "Testing…" : "Run Transport Test"}
          onPress={runTransportTest}
          disabled={testRunning}
          colors={colors}
        />
        {lastTestResult && (
          <View style={[styles.resultCard, { borderColor: colors.border }]}> 
            <Text style={[styles.resultText, { color: colors.text }]}>Result</Text>
            <Text style={[styles.resultBody, { color: colors.text }]}>{lastTestResult}</Text>
          </View>
        )}
        {lastTestError && (
          <View style={[styles.resultCard, { borderColor: colors.border }]}> 
            <Text style={[styles.errorText, { color: "#FF453A" }]}>Error</Text>
            <Text style={[styles.resultBody, { color: "#FF453A" }]}>{lastTestError}</Text>
          </View>
        )}
      </SectionCard>

      <SectionCard
        title="Onboarding"
        description="Replay the intro guide"
        colors={colors}
      >
        <ThemedButton
          label="Reset Onboarding"
          onPress={handleResetOnboarding}
          colors={colors}
        />
      </SectionCard>
    </ScrollView>
  );
}

function SectionCard({
  title,
  description,
  children,
  colors,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { color: colors.text }]}
      >
        {title}
      </Text>
      {description ? (
        <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{description}</Text>
      ) : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ThemedButton({
  label,
  onPress,
  disabled = false,
  colors,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  colors: any;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.accent },
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

function Row({
  label,
  description,
  value,
  onValueChange,
  colors,
  accessibilityLabel,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors?: any;
  accessibilityLabel?: string;
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
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={description}
      />
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
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: themeAccent + "22" }}
      onPress={() => onPress(option.key)}
      style={({ pressed }) => [
        styles.preferenceButton,
        {
          borderColor,
          backgroundColor: active ? themeAccent + "15" : "transparent",
        },
        pressed && styles.preferenceButtonPressed,
      ]}
    >
      <Text style={[styles.preferenceLabel, { color: textColor }]}>{option.label}</Text>
      <Text style={[styles.preferenceDescription, { color: textColor + "80" }]}>
        {option.description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  sectionBody: {
    marginTop: 16,
    gap: 16,
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
    gap: 4,
  },
  preferenceButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  preferenceDescription: {
    fontSize: 12,
    color: "#6D6D70",
  },
  spacer: {
    height: 12,
  },
  resultCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
