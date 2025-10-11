import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  DNSMethodPreference,
  useSettings,
} from '../context/SettingsContext';
import { useOnboarding } from '../context/OnboardingContext';

type TransportKey = 'native' | 'udp' | 'tcp' | 'https';

const TEST_TRANSPORTS: Array<{ key: TransportKey; label: string }> = [
  { key: 'native', label: 'Native' },
  { key: 'udp', label: 'UDP' },
  { key: 'tcp', label: 'TCP' },
  { key: 'https', label: 'HTTPS' },
];

const METHOD_OPTIONS: Array<{
  key: DNSMethodPreference;
  label: string;
  description: string;
}> = [
  {
    key: 'automatic',
    label: 'Automatic Fallback',
    description:
      'Use the default fallback chain: Native → UDP → TCP → HTTPS → Mock.',
  },
  {
    key: 'prefer-https',
    label: 'Prefer DNS-over-HTTPS',
    description:
      'Start with Cloudflare HTTPS for privacy before falling back to other transports.',
  },
  {
    key: 'udp-only',
    label: 'UDP Only',
    description:
      'Restrict to native DNS and UDP. Disables TCP and HTTPS fallbacks.',
  },
  {
    key: 'never-https',
    label: 'Never Use HTTPS',
    description:
      'Restrict to native, UDP, and TCP. Excludes HTTPS fallbacks entirely.',
  },
];

export function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const colors = useMemo(
    () => ({
      text: isDark ? '#FFFFFF' : '#000000',
      card: isDark ? 'rgba(28,28,30,0.75)' : '#FFFFFF',
      border: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
      background: isDark ? '#000000' : '#F2F2F7',
    }),
    [isDark]
  );

  const {
    dnsServer,
    updateDnsServer,
    preferDnsOverHttps,
    updatePreferDnsOverHttps,
    dnsMethodPreference,
    updateDnsMethodPreference,
    loading,
  } = useSettings();
  const { resetOnboarding } = useOnboarding();

  const [tempDnsServer, setTempDnsServer] = useState(dnsServer);
  const [tempPreferHttps, setTempPreferHttps] = useState(preferDnsOverHttps);
  const [tempMethodPreference, setTempMethodPreference] =
    useState<DNSMethodPreference>(dnsMethodPreference);
  const [saving, setSaving] = useState(false);

  const [testMessage, setTestMessage] = useState('ping');
  const [testRunning, setTestRunning] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<string | null>(null);
  const [lastTestError, setLastTestError] = useState<string | null>(null);

  useEffect(() => {
    setTempDnsServer(dnsServer);
  }, [dnsServer]);

  useEffect(() => {
    setTempPreferHttps(preferDnsOverHttps);
  }, [preferDnsOverHttps]);

  useEffect(() => {
    setTempMethodPreference(dnsMethodPreference);
  }, [dnsMethodPreference]);

  const handleSelectMethodPreference = async (
    preference: DNSMethodPreference,
  ) => {
    if (loading) {
      return;
    }

    try {
      setTempMethodPreference(preference);
      setSaving(true);
      await updateDnsMethodPreference(preference);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save preference';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePreferHttps = async (value: boolean) => {
    if (loading) {
      return;
    }

    try {
      setTempPreferHttps(value);
      setSaving(true);
      await updatePreferDnsOverHttps(value);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update setting';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDnsServerEndEditing = async () => {
    if (loading) {
      return;
    }

    try {
      setSaving(true);
      await updateDnsServer(tempDnsServer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save DNS server';
      Alert.alert('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      await updateDnsServer(tempDnsServer);
      await updatePreferDnsOverHttps(tempPreferHttps);
      await updateDnsMethodPreference(tempMethodPreference);
      Alert.alert('Settings Saved', 'All changes have been applied.', [
        {
          text: 'OK',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            }
          },
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save settings';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default',
      'Reset all settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await updateDnsServer('ch.at');
              await updatePreferDnsOverHttps(false);
              await updateDnsMethodPreference('automatic');
              setTempDnsServer('ch.at');
              setTempPreferHttps(false);
              setTempMethodPreference('automatic');
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Failed to reset settings';
              Alert.alert('Error', message);
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding?',
      'Onboarding will play again the next time you open the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            await resetOnboarding();
            Alert.alert('Onboarding Reset', 'Restart the app to replay onboarding.');
          },
        },
      ],
    );
  };

  const handleTestSelectedPreference = async () => {
    if (testRunning) {
      return;
    }

    try {
      setTestRunning(true);
      setLastTestResult(null);
      setLastTestError(null);

      const { DNSService } = await import('../services/dnsService');
      const response = await DNSService.queryLLM(
        testMessage,
        tempDnsServer,
        tempPreferHttps,
        tempMethodPreference,
      );

      setLastTestResult(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setLastTestError(message);
    } finally {
      setTestRunning(false);
    }
  };

  const handleForceTransport = async (transport: TransportKey) => {
    if (testRunning) {
      return;
    }

    try {
      setTestRunning(true);
      setLastTestResult(null);
      setLastTestError(null);

      const { DNSService } = await import('../services/dnsService');
      const response = await DNSService.testTransport(
        testMessage,
        transport,
        tempDnsServer,
      );

      setLastTestResult(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setLastTestError(message);
    } finally {
      setTestRunning(false);
    }
  };

  const handleViewLogs = () => {
    router.navigate('/logs');
  };

  const isDirty =
    tempDnsServer !== dnsServer ||
    tempPreferHttps !== preferDnsOverHttps ||
    tempMethodPreference !== dnsMethodPreference;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>DNS Configuration</Text>
            <Text style={[styles.description, { color: colors.text + '80' }]}>Configure the DNS server used for chat queries.</Text>

            <Text style={[styles.label, { color: colors.text }]}>DNS Server</Text>
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
              placeholder="ch.at"
              placeholderTextColor={colors.text + '60'}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              editable={!loading}
            />
            <Text style={[styles.hint, { color: colors.text + '80' }]}>Default: ch.at</Text>

            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={handleReset}
              disabled={saving}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset to Default</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>DNS Method Preference</Text>
            <Text style={[styles.description, { color: colors.text + '80' }]}>Choose the preferred transport strategy for queries.</Text>

            {METHOD_OPTIONS.map((option) => {
              const selected = tempMethodPreference === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.methodOption,
                    {
                      borderColor: selected ? '#007AFF' : colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                  onPress={() => handleSelectMethodPreference(option.key)}
                  disabled={loading || saving}
                >
                  <View style={styles.methodHeader}>
                    <Text style={[styles.methodLabel, { color: colors.text }]}>{option.label}</Text>
                    <View
                      style={[
                        styles.radioButton,
                        {
                          borderColor: selected ? '#007AFF' : colors.border,
                          backgroundColor: selected ? '#007AFF' : 'transparent',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.methodDescription, { color: colors.text + '80' }]}> {option.description}</Text>
                </TouchableOpacity>
              );
            })}

            <View
              style={[
                styles.switchRow,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Prefer DNS-over-HTTPS (Legacy)</Text>
                <Text style={[styles.switchDescription, { color: colors.text + '80' }]}>Use Cloudflare HTTPS before other transports.</Text>
              </View>
              <Switch
                value={tempPreferHttps}
                onValueChange={handleTogglePreferHttps}
                trackColor={{ false: colors.border, true: '#007AFF' }}
                thumbColor={tempPreferHttps ? '#FFFFFF' : '#F4F3F4'}
                ios_backgroundColor={colors.border}
                disabled={loading || saving}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Transport Test</Text>
            <Text style={[styles.description, { color: colors.text + '80' }]}>Send a test message using the current settings or force a specific transport.</Text>

            <Text style={[styles.label, { color: colors.text }]}>Test Message</Text>
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
              placeholder="ping"
              placeholderTextColor={colors.text + '60'}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!testRunning}
            />

            <TouchableOpacity
              style={[
                styles.testButton,
                {
                  backgroundColor: testRunning ? colors.border : '#007AFF',
                  opacity: testRunning ? 0.6 : 1,
                },
              ]}
              onPress={handleTestSelectedPreference}
              disabled={testRunning || !testMessage.trim()}
            >
              <Text style={[styles.testButtonText, { color: '#FFFFFF' }]}>
                {testRunning ? 'Testing...' : 'Test Selected Preference'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Force Specific Transport</Text>
            <View style={styles.transportButtons}>
              {TEST_TRANSPORTS.map((transport, index) => (
                <TouchableOpacity
                  key={transport.key}
                  style={[
                    styles.transportButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: testRunning ? colors.border : colors.card,
                      opacity: testRunning ? 0.6 : 1,
                    },
                    index < TEST_TRANSPORTS.length - 1 && { marginRight: 8 },
                  ]}
                  onPress={() => handleForceTransport(transport.key)}
                  disabled={testRunning}
                >
                  <Text style={[styles.transportButtonText, { color: colors.text }]}>
                    {transport.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.logsButton, { borderColor: colors.text + '40' }]}
              onPress={handleViewLogs}
            >
              <Text style={[styles.logsButtonText, { color: colors.text }]}>View DNS Logs</Text>
            </TouchableOpacity>

            {lastTestResult && (
              <View
                style={[
                  styles.resultBox,
                  { borderColor: '#34C759', backgroundColor: '#34C75920' },
                ]}
              >
                <Text style={[styles.resultLabel, { color: '#34C759' }]}>Last Test Result:</Text>
                <Text style={[styles.resultText, { color: colors.text }]}>{lastTestResult}</Text>
              </View>
            )}

            {lastTestError && (
              <View
                style={[
                  styles.resultBox,
                  { borderColor: '#FF3B30', backgroundColor: '#FF3B3020' },
                ]}
              >
                <Text style={[styles.resultLabel, { color: '#FF3B30' }]}>Last Test Error:</Text>
                <Text style={[styles.resultText, { color: colors.text }]}>{lastTestError}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Configuration</Text>
            <View
              style={[styles.infoBox, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Active DNS Server</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{dnsServer}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>DNS Method</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {tempMethodPreference === 'prefer-https'
                    ? 'DNS-over-HTTPS (Preferred)'
                    : tempMethodPreference === 'udp-only'
                      ? 'UDP Only'
                      : tempMethodPreference === 'never-https'
                        ? 'Native / UDP / TCP Only'
                        : tempPreferHttps
                          ? 'DNS-over-HTTPS (Legacy)'
                          : 'Automatic Fallback'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Developer</Text>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={handleResetOnboarding}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset Onboarding Flow</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.primaryButton, { opacity: isDirty ? 1 : 0.6 }]}
              onPress={handleSave}
              disabled={!isDirty || saving}
            >
              <Text style={styles.primaryButtonText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                }
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  resetButton: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  methodOption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  testButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  transportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  transportButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
  },
  transportButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logsButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  logsButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerActions: {
    marginTop: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
