import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components/Themed';
import { DNS_SERVER_WHITELIST } from '@/constants/dns';
import { useDNSLogs } from '@/context/DNSLogProvider';
import { usePreferences, usePreferencesActions } from '@/context/PreferencesProvider';
import { useResolvedLocale } from '@/hooks/useResolvedLocale';
import { useTranslation } from '@/i18n';
import type { TranslationKey } from '@/i18n';

const LOCALE_OPTIONS: Array<{ labelKey: TranslationKey; value: 'system' | 'en-US' | 'pt-BR' }> = [
  { labelKey: 'settings.locale.system', value: 'system' },
  { labelKey: 'settings.locale.en', value: 'en-US' },
  { labelKey: 'settings.locale.pt', value: 'pt-BR' }
];

const servers = Object.values(DNS_SERVER_WHITELIST);

export default function SettingsScreen() {
  const preferences = usePreferences();
  const { setLocale, setTransport, setOnboardingCompleted, setServerHost } = usePreferencesActions();
  const logs = useDNSLogs();
  const locale = useResolvedLocale();
  const { t } = useTranslation();

  const transportToggles = useMemo(
    () => [
      { key: 'native' as const, labelKey: 'settings.transport.native' as TranslationKey },
      { key: 'udp' as const, labelKey: 'settings.transport.udp' as TranslationKey },
      { key: 'tcp' as const, labelKey: 'settings.transport.tcp' as TranslationKey },
      { key: 'https' as const, labelKey: 'settings.transport.https' as TranslationKey }
    ],
    []
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('settings.transport.title')}</Text>
      <View style={styles.card}>
        {transportToggles.map((toggle) => (
          <View key={toggle.key} style={styles.row}>
            <Text style={styles.rowLabel}>{t(toggle.labelKey)}</Text>
            <Switch
              value={preferences.transport[toggle.key]}
              onValueChange={(value) => setTransport({ [toggle.key]: value })}
            />
          </View>
        ))}
        <Text style={styles.caption}>{t('settings.transport.caption')}</Text>
      </View>

      <Text style={styles.heading}>{t('settings.server.title')}</Text>
      <View style={styles.card}>
        {servers.map((server) => {
          const active = server.host === preferences.serverHost;
          return (
            <Pressable
              key={server.host}
              onPress={() => setServerHost(server.host)}
              style={({ pressed }) => [
                styles.serverRow,
                active && styles.serverRowActive,
                pressed && !active && styles.serverRowPressed
              ]}
            >
              <View>
                <Text style={styles.serverLabel}>{server.label}</Text>
                <Text style={styles.serverHost}>{server.host}</Text>
              </View>
              {active ? <Text style={styles.serverActiveBadge}>{t('settings.server.selected')}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.heading}>{t('settings.locale.title')}</Text>
      <View style={styles.card}>
        {LOCALE_OPTIONS.map((option) => {
          const active = option.value === preferences.locale;
          return (
            <Pressable
              key={option.value}
              onPress={() => setLocale(option.value)}
              style={({ pressed }) => [styles.row, pressed && styles.serverRowPressed]}
            >
              <Text style={styles.rowLabel}>{t(option.labelKey)}</Text>
              <Text style={[styles.localeValue, active && styles.localeValueActive]}>{option.value}</Text>
            </Pressable>
          );
        })}
        <Text style={styles.caption}>{t('settings.locale.current', { locale })}</Text>
      </View>

      <Text style={styles.heading}>{t('settings.onboarding.title')}</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.onboarding.completed')}</Text>
          <Switch
            value={preferences.onboardingCompleted}
            onValueChange={(value) => setOnboardingCompleted(value)}
          />
        </View>
        <Pressable
          onPress={() => setOnboardingCompleted(false)}
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
        >
          <Text style={styles.resetButtonLabel}>{t('settings.onboarding.rerun')}</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>{t('settings.diagnostics.title')}</Text>
      <View style={styles.card}>
        <Text style={styles.rowLabel}>{t('settings.diagnostics.logsLabel')}</Text>
        <Text style={styles.caption}>{t('settings.diagnostics.count', { count: logs.length })}</Text>
        <Text style={styles.caption}>{t('settings.diagnostics.caption')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20
  },
  heading: {
    fontSize: 16,
    fontWeight: '700'
  },
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(249,249,249,0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(142,142,147,0.2)',
    gap: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600'
  },
  caption: {
    fontSize: 13,
    color: 'rgba(99,99,102,0.9)'
  },
  serverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  serverRowActive: {
    backgroundColor: 'rgba(10,132,255,0.12)'
  },
  serverRowPressed: {
    backgroundColor: 'rgba(142,142,147,0.12)'
  },
  serverLabel: {
    fontSize: 15,
    fontWeight: '600'
  },
  serverHost: {
    fontSize: 13,
    color: 'rgba(99,99,102,0.9)'
  },
  serverActiveBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A84FF'
  },
  localeValue: {
    fontSize: 13,
    color: 'rgba(142,142,147,0.9)'
  },
  localeValueActive: {
    color: '#0A84FF',
    fontWeight: '700'
  },
  resetButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(142,142,147,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  resetButtonPressed: {
    opacity: 0.7
  },
  resetButtonLabel: {
    fontSize: 13,
    fontWeight: '600'
  }
});
