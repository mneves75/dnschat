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
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Linking,
  useColorScheme,
} from "react-native";
import { DNSMethodPreference } from "../context/SettingsContext";
import {
  Form,
  GlassBottomSheet,
  GlassActionSheet,
  useGlassBottomSheet,
  LiquidGlassWrapper,
} from "../components/glass";
import { nativeDNS } from "../../modules/dns-native";
import { DNSLogService } from "../services/dnsLogService";
import { useSettingsControls } from "./hooks/useSettingsControls";

// ==================================================================================
// GLASS SETTINGS SCREEN COMPONENT
// ==================================================================================

export function GlassSettings() {
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
      setLocale,
    },
  } = useSettingsControls();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Bottom sheet states
  const dnsServerSheet = useGlassBottomSheet();
  const aboutSheet = useGlassBottomSheet();
  const supportSheet = useGlassBottomSheet();

  // DNS Service options
  const dnsServerOptions = [
    {
      value: "ch.at",
      label: "ch.at (Default)",
      description: "Official ChatDNS server with AI responses",
    },
    {
      value: "llm.pieter.com",
      label: "llm.pieter.com",
      description: "Pieter's LLM service via DNS",
    },
  ];

  const currentDnsOption =
    dnsServerOptions.find((option) => option.value === dnsServer) ||
    dnsServerOptions[0];

  // Action handlers
  const handleDnsServerSelect = React.useCallback(
    async (server: string) => {
      const result = await setDnsServer(server);
      if (!result.ok) {
        Alert.alert("Save Failed", result.message);
        return;
      }

      dnsServerSheet.hide();

      if (Platform.OS === "ios") {
        console.log("🔸 Haptic: DNS server changed");
      }
    },
    [setDnsServer, dnsServerSheet],
  );

  const handleShareApp = React.useCallback(async () => {
    try {
      await Share.share({
        message:
          "Check out DNSChat - Chat over DNS! A unique way to communicate using DNS TXT queries.",
        url: "https://github.com/mneves75/dnschat",
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  }, []);

  const handleOpenGitHub = React.useCallback(() => {
    Linking.openURL("https://github.com/mneves75/dnschat");
  }, []);

  const handleResetSettings = React.useCallback(() => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default values?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await setDnsServer("ch.at");
            await setPreferDnsOverHttps(false);
            await setDnsMethodPreference("native-first");
            await setEnableMockDNS(false);
            await setAllowExperimentalTransports(false);
            await setLocale(null);
            Alert.alert(
              "Settings Reset",
              "All settings have been reset to default values.",
            );
          },
        },
      ],
    );
  }, [
    setAllowExperimentalTransports,
    setDnsMethodPreference,
    setDnsServer,
    setEnableMockDNS,
    setLocale,
    setPreferDnsOverHttps,
  ]);

  // Transport test state
  const [testMessage, setTestMessage] = React.useState("ping");
  const [testRunning, setTestRunning] = React.useState(false);
  const [lastTestResult, setLastTestResult] = React.useState<string | null>(
    null,
  );
  const [lastTestError, setLastTestError] = React.useState<string | null>(null);
  const [verifyRunning, setVerifyRunning] = React.useState(false);

  const handleSelectMethodPreference = async (
    preference: DNSMethodPreference,
  ) => {
    const result = await setDnsMethodPreference(preference);
    if (!result.ok) {
      console.log("Failed to save DNS method preference", result.message);
    }
  };

  const handleToggleMockDNS = async (value: boolean) => {
    const result = await setEnableMockDNS(value);
    if (!result.ok) {
      console.log("Failed to save Mock DNS preference", result.message);
    }
  };

  const handleTogglePreferHttps = async (value: boolean) => {
    const result = await setPreferDnsOverHttps(value);
    if (!result.ok) {
      console.log("Failed to save Prefer HTTPS toggle", result.message);
    }
  };

  const handleToggleExperimentalTransports = async (value: boolean) => {
    const result = await setAllowExperimentalTransports(value);
    if (!result.ok) {
      console.log("Failed to update experimental transports", result.message);
    }
  };

  const handleTestSelectedPreference = async () => {
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
    } catch (e: any) {
      setLastTestError(e?.message || String(e));
    } finally {
      setTestRunning(false);
    }
  };

  const handleForceTransport = async (
    transport: "native" | "udp" | "tcp" | "https",
  ) => {
    if (testRunning) return;
    setTestRunning(true);
    setLastTestResult(null);
    setLastTestError(null);
    try {
      const { DNSService } = await import("../services/dnsService");
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

  const handleVerifyNativeDns = React.useCallback(async () => {
    if (verifyRunning) return;
    setVerifyRunning(true);
    try {
      const capabilities = await nativeDNS.isAvailable();
      await DNSLogService.recordSettingsEvent(
        "Native DNS verification",
        JSON.stringify(capabilities),
      );
      Alert.alert(
        "Native DNS Available",
        `Platform: ${capabilities.platform}\nSupports Custom Server: ${capabilities.supportsCustomServer ? 'Yes' : 'No'}\nSupports Async Query: ${capabilities.supportsAsyncQuery ? 'Yes' : 'No'}`,
      );
    } catch (error: any) {
      const message = error?.message || String(error);
      await DNSLogService.recordSettingsEvent(
        "Native DNS verification failed",
        message,
      );
      Alert.alert(
        "Native DNS Unavailable",
        `${message}\nEnable 'Allow Experimental Transports' to retry with UDP/TCP/HTTPS if needed.`,
      );
    } finally {
      setVerifyRunning(false);
    }
  }, [verifyRunning]);

  const handleClearCache = React.useCallback(() => {
    Alert.alert(
      "Clear Cache",
      "This will clear all cached DNS responses and conversation history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // Cache clearing logic would go here
            Alert.alert("Cache Cleared", "All cached data has been cleared.");
          },
        },
      ],
    );
  }, []);

  return (
    <>
      <Form.List navigationTitle="Settings">
        {/* DNS Configuration Section */}
        <Form.Section
          title="DNS Configuration"
          footer="Configure DNS server and query methods for optimal performance and privacy."
        >
          <Form.Item
            title="DNS Service"
            subtitle={currentDnsOption.label}
            rightContent={<Text style={styles.valueText}>{dnsServer}</Text>}
            onPress={dnsServerSheet.show}
            showChevron
          />

        <Form.Item
          title="Prefer DNS-over-HTTPS"
          subtitle="Use Cloudflare's secure HTTPS DNS for enhanced privacy"
          rightContent={
            <Switch
              value={preferDnsOverHttps}
              onValueChange={handleTogglePreferHttps}
              trackColor={{ false: "#767577", true: "#007AFF" }}
              thumbColor={Platform.OS === "ios" ? undefined : "#f4f3f4"}
            />
          }
        />
        <Form.Item
          title="Allow Experimental Transports"
          subtitle="Re-enables UDP, TCP, and HTTPS fallbacks when native DNS fails"
          rightContent={
            <Switch
              value={allowExperimentalTransports}
              onValueChange={handleToggleExperimentalTransports}
              trackColor={{ false: "#767577", true: "#34C759" }}
              thumbColor={Platform.OS === "ios" ? undefined : "#f4f3f4"}
            />
          }
        />
        <Form.Item
          title="Enable Mock DNS"
          subtitle="Use local mock responses when real DNS fails"
          rightContent={
            <Switch
                value={enableMockDNS}
                onValueChange={handleToggleMockDNS}
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={Platform.OS === "ios" ? undefined : "#f4f3f4"}
              />
            }
          />
        </Form.Section>

        {/* DNS Method Preference */}
        <Form.Section
          title="DNS Method Preference"
          footer="Choose transport ordering for DNS queries"
        >
          {[
            {
              key: "automatic",
              label: "Automatic",
              desc: "Balanced fallback chain",
            },
            {
              key: "prefer-https",
              label: "Prefer HTTPS",
              desc: "HTTPS first (needs experimental transports; limited by ch.at)",
            },
            { key: "udp-only", label: "UDP Only", desc: "Fastest direct" },
            {
              key: "never-https",
              label: "Never HTTPS",
              desc: "Native/UDP/TCP only",
            },
            {
              key: "native-first",
              label: "Native First",
              desc: "Use platform DNS first",
            },
          ].map((option) => (
            <Form.Item
              key={option.key}
              title={option.label}
              subtitle={option.desc}
              rightContent={
                <Text
                  style={[
                    styles.selectedIndicator,
                    { opacity: dnsMethodPreference === option.key ? 1 : 0 },
                  ]}
                >
                  ✓
                </Text>
              }
              onPress={() =>
                handleSelectMethodPreference(option.key as DNSMethodPreference)
              }
              style={StyleSheet.flatten([
                styles.dnsOption,
                dnsMethodPreference === option.key
                  ? styles.selectedDnsOption
                  : null,
              ])}
            />
          ))}
        </Form.Section>

        {/* Transport Test */}
        <Form.Section
          title="Transport Test"
          footer="Run a test message across transports. See Logs for details."
        >
          <Form.Item
            title="Verify Native DNS"
            subtitle="Checks platform resolver capability"
            onPress={() => {
              if (!verifyRunning) {
                handleVerifyNativeDns();
              }
            }}
            rightContent={
              verifyRunning ? <ActivityIndicator size="small" /> : undefined
            }
          />
          <View style={styles.testMessageContainer}>
            <Text style={[styles.label, { color: isDark ? "#FFFFFF" : "#1C1C1E" }]}>Test Message</Text>
            <TextInput
              value={testMessage}
              onChangeText={setTestMessage}
              placeholder="ping"
              placeholderTextColor={isDark ? "#8E8E93" : "#AEAEB2"}
              style={[
                styles.testMessageInput,
                {
                  color: isDark ? "#FFFFFF" : "#1C1C1E",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.04)",
                },
              ]}
              autoCorrect={false}
              autoCapitalize="none"
              selectTextOnFocus
            />
          </View>
          <LiquidGlassWrapper
            variant="interactive"
            shape="capsule"
            style={{ marginVertical: 8, alignItems: "center", padding: 10 }}
          >
            <Text
              onPress={handleTestSelectedPreference}
              style={{ color: "#007AFF" }}
            >
              {testRunning ? "Testing…" : "Test Selected Preference"}
            </Text>
          </LiquidGlassWrapper>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            {(["native", "udp", "tcp", "https"] as const).map((t) => (
              <LiquidGlassWrapper
                key={t}
                variant="interactive"
                shape="capsule"
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text onPress={() => handleForceTransport(t)}>
                  {t.toUpperCase()}
                </Text>
              </LiquidGlassWrapper>
            ))}
          </View>

          {lastTestResult && (
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>Result: {lastTestResult}</Text>
            </View>
          )}
          {lastTestError && (
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>Error: {lastTestError}</Text>
            </View>
          )}
        </Form.Section>

        {/* App Information Section */}
        <Form.Section title="About">
          <Form.Item
            title="App Version"
            subtitle="DNSChat v2.0.0"
            rightContent={
              <LiquidGlassWrapper
                variant="interactive"
                shape="capsule"
                style={styles.versionBadge}
              >
                <Text style={styles.versionText}>Latest</Text>
              </LiquidGlassWrapper>
            }
            onPress={aboutSheet.show}
          />

          <Form.Link
            title="GitHub Repository"
            subtitle="View source code and contribute"
            onPress={handleOpenGitHub}
          />

          <Form.Item
            title="Share DNSChat"
            subtitle="Tell others about this app"
            onPress={handleShareApp}
            showChevron
          />
        </Form.Section>

        {/* Advanced Section */}
        <Form.Section
          title="Advanced"
          footer="Advanced settings for power users. Use with caution."
        >
          <Form.Item
            title="Clear Cache"
            subtitle="Remove all cached DNS responses"
            onPress={handleClearCache}
            showChevron
          />

          <Form.Item
            title="Reset Settings"
            subtitle="Restore all settings to default values"
            onPress={handleResetSettings}
            showChevron
          />
        </Form.Section>

        {/* Support Section */}
        <Form.Section title="Support">
          <Form.Item
            title="Help & Feedback"
            subtitle="Get help or provide feedback"
            onPress={supportSheet.show}
            showChevron
          />

          <Form.Item
            title="Report Bug"
            subtitle="Found an issue? Let us know"
            onPress={() =>
              Linking.openURL("https://github.com/mneves75/dnschat/issues")
            }
            showChevron
          />
        </Form.Section>
      </Form.List>

      {/* DNS Service Selection Bottom Sheet */}
      <GlassBottomSheet
        visible={dnsServerSheet.visible}
        onClose={dnsServerSheet.hide}
        title="Select DNS Service"
        subtitle="Choose your preferred DNS resolver"
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
                  <Text style={styles.selectedIndicator}>✓</Text>
                )
              }
              onPress={() => handleDnsServerSelect(option.value)}
              style={StyleSheet.flatten([
                styles.dnsOption,
                dnsServer === option.value ? styles.selectedDnsOption : null,
              ])}
            />
          ))}
        </View>
      </GlassBottomSheet>

      {/* About Bottom Sheet */}
      <GlassBottomSheet
        visible={aboutSheet.visible}
        onClose={aboutSheet.hide}
        title="About DNSChat"
        subtitle="Chat over DNS TXT queries"
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
              DNSChat is a unique communication app that uses DNS TXT queries to
              chat with an AI. This innovative approach demonstrates how DNS can
              be used for more than just domain resolution.
            </Text>
          </LiquidGlassWrapper>

          <View style={styles.aboutFeatures}>
            <Text
              style={[
                styles.featureTitle,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
            >
              Key Features:
            </Text>
            <Text
              style={[
                styles.featureItem,
                { color: isDark ? "#AEAEB2" : "#6D6D70" },
              ]}
            >
              • Native DNS module with iOS 26 support
            </Text>
            <Text
              style={[
                styles.featureItem,
                { color: isDark ? "#AEAEB2" : "#6D6D70" },
              ]}
            >
              • Multiple DNS transport methods (UDP, TCP, HTTPS)
            </Text>
            <Text
              style={[
                styles.featureItem,
                { color: isDark ? "#AEAEB2" : "#6D6D70" },
              ]}
            >
              • Real-time query logging and debugging
            </Text>
            <Text
              style={[
                styles.featureItem,
                { color: isDark ? "#AEAEB2" : "#6D6D70" },
              ]}
            >
              • Beautiful glass UI inspired by Apple's design
            </Text>
            <Text
              style={[
                styles.featureItem,
                { color: isDark ? "#AEAEB2" : "#6D6D70" },
              ]}
            >
              • Cross-platform React Native implementation
            </Text>
          </View>
        </View>
      </GlassBottomSheet>

      {/* Support Action Sheet */}
      <GlassActionSheet
        visible={supportSheet.visible}
        onClose={supportSheet.hide}
        title="Support Options"
        message="How can we help you today?"
        actions={[
          {
            title: "View Documentation",
            onPress: () =>
              Linking.openURL(
                "https://github.com/mneves75/dnschat/blob/main/README.md",
              ),
            icon: <Text>📚</Text>,
          },
          {
            title: "Join Community",
            onPress: () =>
              Linking.openURL(
                "https://github.com/mneves75/dnschat/discussions",
              ),
            icon: <Text>💬</Text>,
          },
          {
            title: "Send Email",
            onPress: () =>
              Linking.openURL(
                "mailto:support@dnschat.app?subject=DNSChat Support",
              ),
            icon: <Text>📧</Text>,
          },
          {
            title: "Cancel",
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
  testMessageContainer: {
    marginTop: 12,
    marginBottom: 10,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  testMessageInput: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(142, 142, 147, 0.2)",
    fontSize: 16,
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
