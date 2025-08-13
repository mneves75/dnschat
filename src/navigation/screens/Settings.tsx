import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Switch, ScrollView } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useSettings, DNSMethodPreference } from '../../context/SettingsContext';
import { useOnboarding } from '../../context/OnboardingContext';
 
export function Settings() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { dnsServer, updateDnsServer, preferDnsOverHttps, updatePreferDnsOverHttps, dnsMethodPreference, updateDnsMethodPreference, loading } = useSettings();
  const { resetOnboarding } = useOnboarding();
  const [tempDnsServer, setTempDnsServer] = useState(dnsServer);
  const [tempPreferHttps, setTempPreferHttps] = useState(preferDnsOverHttps);
  const [tempMethodPreference, setTempMethodPreference] = useState<DNSMethodPreference>(dnsMethodPreference);
  const [saving, setSaving] = useState(false);

  // Sync temp state with context values when they change
  React.useEffect(() => {
    setTempDnsServer(dnsServer);
    setTempPreferHttps(preferDnsOverHttps);
    setTempMethodPreference(dnsMethodPreference);
  }, [dnsServer, preferDnsOverHttps, dnsMethodPreference]);

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      await updateDnsServer(tempDnsServer);
      await updatePreferDnsOverHttps(tempPreferHttps);
      await updateDnsMethodPreference(tempMethodPreference);
      Alert.alert(
        'Settings Saved',
        'Settings have been updated successfully.',
        [{ text: 'OK', onPress: () => (navigation as any)?.goBack?.() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setTempDnsServer('ch.at');
            setTempPreferHttps(false);
            setTempMethodPreference('automatic');
          }
        }
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset the onboarding process and show it again on next app launch. This is useful for testing or if you want to see the tour again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Onboarding', 
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            Alert.alert('Onboarding Reset', 'The onboarding will be shown again when you restart the app.');
          }
        }
      ]
    );
  };

  const isDirty = tempDnsServer !== dnsServer || tempPreferHttps !== preferDnsOverHttps || tempMethodPreference !== dnsMethodPreference;
  const isValidServer = tempDnsServer.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            DNS Configuration
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            Configure the DNS server used for LLM communication. This server will receive your messages via DNS TXT queries.
          </Text>
          
          <Text style={[styles.label, { color: colors.text }]}>
            DNS TXT Service
          </Text>
          <TextInput
            style={[
              styles.input, 
              { 
                borderColor: colors.border, 
                color: colors.text,
                backgroundColor: colors.card
              }
            ]}
            value={tempDnsServer}
            onChangeText={setTempDnsServer}
            placeholder="ch.at"
            placeholderTextColor={colors.text + '60'}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            editable={!loading}
          />
          
          <Text style={[styles.hint, { color: colors.text + '80' }]}>
            Default: ch.at
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            DNS Method Preference
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            Choose how DNS queries are performed. Different methods offer various benefits for security, privacy, and network compatibility.
          </Text>
          
          {/* New method preference picker */}
          <View style={styles.methodContainer}>
            {[
              { key: 'automatic', label: 'Automatic', description: 'Balanced approach with fallback chain' },
              { key: 'prefer-https', label: 'Prefer HTTPS', description: 'Privacy-focused with DNS-over-HTTPS first' },
              { key: 'udp-only', label: 'UDP Only', description: 'Fast direct UDP queries only' },
              { key: 'never-https', label: 'Never HTTPS', description: 'Native and UDP/TCP methods only' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.methodOption,
                  { 
                    backgroundColor: tempMethodPreference === option.key ? '#007AFF20' : colors.card,
                    borderColor: tempMethodPreference === option.key ? '#007AFF' : colors.border
                  }
                ]}
                onPress={() => setTempMethodPreference(option.key as DNSMethodPreference)}
                disabled={loading}
              >
                <View style={styles.methodInfo}>
                  <View style={styles.methodHeader}>
                    <Text style={[styles.methodLabel, { color: colors.text }]}>
                      {option.label}
                    </Text>
                    <View style={[
                      styles.radioButton,
                      { 
                        borderColor: tempMethodPreference === option.key ? '#007AFF' : colors.border,
                        backgroundColor: tempMethodPreference === option.key ? '#007AFF' : 'transparent'
                      }
                    ]}>
                      {tempMethodPreference === option.key && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                  <Text style={[styles.methodDescription, { color: colors.text + '80' }]}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Legacy switch for backward compatibility */}
          <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>
                Prefer DNS-over-HTTPS (Legacy)
              </Text>
              <Text style={[styles.switchDescription, { color: colors.text + '80' }]}>
                Uses Cloudflare's secure DNS service
              </Text>
            </View>
            <Switch
              value={tempPreferHttps}
              onValueChange={setTempPreferHttps}
              trackColor={{ false: colors.border, true: '#007AFF' }}
              thumbColor={tempPreferHttps ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor={colors.border}
              disabled={loading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Current Configuration
          </Text>
          <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>
                Active DNS Server:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {dnsServer}
              </Text>
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>
                DNS Method:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {dnsMethodPreference === 'prefer-https' ? 'DNS-over-HTTPS (Preferred)' :
                 dnsMethodPreference === 'udp-only' ? 'UDP Only' :
                 dnsMethodPreference === 'never-https' ? 'Native/UDP/TCP Only' :
                 preferDnsOverHttps ? 'DNS-over-HTTPS (Legacy)' : 'Automatic Fallback'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Development
          </Text>
          <TouchableOpacity
            style={[
              styles.devButton,
              { borderColor: colors.text + '40', backgroundColor: colors.card }
            ]}
            onPress={handleResetOnboarding}
            disabled={saving || loading}
          >
            <View>
              <Text style={[styles.devButtonTitle, { color: colors.text }]}>
                Reset Onboarding
              </Text>
              <Text style={[styles.devButtonDescription, { color: colors.text + '80' }]}>
                Show the onboarding flow again
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.resetButton,
              { borderColor: colors.text + '40' }
            ]}
            onPress={handleReset}
            disabled={saving || loading}
          >
            <Text style={[styles.resetButtonText, { color: colors.text }]}>
              Reset to Default
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { 
                backgroundColor: isDirty && isValidServer ? '#007AFF' : colors.border,
                opacity: saving ? 0.6 : 1
              }
            ]}
            onPress={handleSave}
            disabled={!isDirty || !isValidServer || saving || loading}
          >
            <Text style={[
              styles.saveButtonText, 
              { color: isDirty && isValidServer ? '#FFFFFF' : colors.text }
            ]}>
              {saving ? 'Saving...' : 'Save Changes'}
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '500',
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
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '500',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: 20,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  devButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  devButtonTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  devButtonDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
});