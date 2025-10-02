import {
  DEFAULT_SETTINGS,
  SETTINGS_VERSION,
  migrateSettings,
} from '../src/context/settingsStorage';

describe('SettingsContext migrateSettings', () => {
  it('migrates legacy payload without version', () => {
    const legacyPayload = {
      dnsServer: '8.8.8.8',
      preferDnsOverHttps: true,
      dnsMethodPreference: 'prefer-https',
      enableMockDNS: true,
    };

    const result = migrateSettings(legacyPayload);

    expect(result).toEqual({
      version: SETTINGS_VERSION,
      dnsServer: '8.8.8.8',
      preferDnsOverHttps: true,
      dnsMethodPreference: 'prefer-https',
      enableMockDNS: true,
      allowExperimentalTransports: false,
      preferredLocale: null,
      accessibility: DEFAULT_SETTINGS.accessibility,
    });
  });

  it('sanitizes invalid values in versioned payloads', () => {
    const malformedPayload = {
      version: 1,
      dnsServer: '   ',
      preferDnsOverHttps: 'yes',
      dnsMethodPreference: 'invalid-option',
      enableMockDNS: 'truthy',
      allowExperimentalTransports: 'truthy',
      preferredLocale: 'xx-YY',
    } as unknown;

    const result = migrateSettings(malformedPayload);

    expect(result).toEqual({
      version: SETTINGS_VERSION,
      dnsServer: DEFAULT_SETTINGS.dnsServer,
      preferDnsOverHttps: true,
      dnsMethodPreference: 'native-first',
      enableMockDNS: true,
      allowExperimentalTransports: true,
      preferredLocale: 'xx-YY',
      accessibility: DEFAULT_SETTINGS.accessibility,
    });
  });

  it('falls back to defaults for invalid payload', () => {
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings('bad')).toEqual(DEFAULT_SETTINGS);
  });
});
