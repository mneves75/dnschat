import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useSettings } from '../../context/SettingsContext';
 
export function Settings() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { dnsServer, updateDnsServer, preferDnsOverHttps, updatePreferDnsOverHttps, loading } = useSettings();
  const [tempDnsServer, setTempDnsServer] = useState(dnsServer);
  const [tempPreferHttps, setTempPreferHttps] = useState(preferDnsOverHttps);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      await updateDnsServer(tempDnsServer);
      await updatePreferDnsOverHttps(tempPreferHttps);
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
          }
        }
      ]
    );
  };

  const isDirty = tempDnsServer !== dnsServer || tempPreferHttps !== preferDnsOverHttps;
  const isValidServer = tempDnsServer.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
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
            When enabled, DNS-over-HTTPS will be preferred over native DNS methods for enhanced privacy.
          </Text>
          
          <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>
                Prefer DNS-over-HTTPS
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
                {preferDnsOverHttps ? 'DNS-over-HTTPS (Cloudflare)' : 'Native DNS (UDP/TCP)'}
              </Text>
            </View>
          </View>
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
                backgroundColor: isDirty && isValidServer ? '#007AFF' : colors.text + '20',
                opacity: saving ? 0.6 : 1
              }
            ]}
            onPress={handleSave}
            disabled={!isDirty || !isValidServer || saving || loading}
          >
            <Text style={[
              styles.saveButtonText, 
              { color: isDirty && isValidServer ? '#FFFFFF' : colors.text + '60' }
            ]}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
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
});