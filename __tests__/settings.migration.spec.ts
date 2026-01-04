import {
  DEFAULT_SETTINGS,
  SETTINGS_VERSION,
  migrateSettings,
  areAccessibilityConfigsEqual,
} from '../src/context/settingsStorage';

describe('SettingsContext migrateSettings', () => {
  it('migrates legacy v1 payload (no version) to v3', () => {
    const legacyPayload = {
      dnsServer: '8.8.8.8',
      enableMockDNS: true,
    };

    const result = migrateSettings(legacyPayload);

    expect(result).toEqual({
      version: SETTINGS_VERSION,
      dnsServer: '8.8.8.8',
      enableMockDNS: true,
      allowExperimentalTransports: true,
      enableHaptics: true,
      preferredLocale: null,
      accessibility: DEFAULT_SETTINGS.accessibility,
    });
  });

  it('migrates v2 payload to v3 (removes HTTPS fields, enables experimental transports)', () => {
    const v2Payload = {
      version: 2,
      dnsServer: 'ch.at',
      preferDnsOverHttps: true,
      dnsMethodPreference: 'prefer-https',
      enableMockDNS: false,
      allowExperimentalTransports: false,
      enableHaptics: true,
      preferredLocale: 'en-US',
    };

    const result = migrateSettings(v2Payload);

    expect(result).toEqual({
      version: SETTINGS_VERSION,
      dnsServer: 'ch.at',
      enableMockDNS: false,
      allowExperimentalTransports: true,
      enableHaptics: true,
      preferredLocale: 'en-US',
      accessibility: DEFAULT_SETTINGS.accessibility,
    });
  });

  it('preserves v3 payload with correct fields', () => {
    const v3Payload = {
      version: 3,
      dnsServer: 'llm.pieter.com',
      enableMockDNS: true,
      allowExperimentalTransports: false,
      enableHaptics: false,
      preferredLocale: 'pt-BR',
      accessibility: DEFAULT_SETTINGS.accessibility,
    };

    const result = migrateSettings(v3Payload);

    expect(result).toEqual({
      version: SETTINGS_VERSION,
      dnsServer: 'llm.pieter.com',
      enableMockDNS: true,
      allowExperimentalTransports: false,
      enableHaptics: false,
      preferredLocale: 'pt-BR',
      accessibility: DEFAULT_SETTINGS.accessibility,
    });
  });

  it('sanitizes invalid values in v3 payloads', () => {
    const malformedPayload = {
      version: 3,
      dnsServer: '   ',
      enableMockDNS: 'truthy',
      allowExperimentalTransports: 'truthy',
      preferredLocale: 'en-US',
    } as unknown;

    const result = migrateSettings(malformedPayload);

    expect(result).toEqual({
      version: SETTINGS_VERSION,
      dnsServer: DEFAULT_SETTINGS.dnsServer,
      enableMockDNS: true,
      allowExperimentalTransports: true,
      enableHaptics: true,
      preferredLocale: 'en-US',
      accessibility: DEFAULT_SETTINGS.accessibility,
    });
  });

  it('falls back to default dnsServer when payload is not allowlisted', () => {
    const payload = {
      version: 3,
      dnsServer: 'example.com',
      enableMockDNS: false,
      allowExperimentalTransports: true,
      enableHaptics: true,
      preferredLocale: 'en-US',
      accessibility: DEFAULT_SETTINGS.accessibility,
    };

    const result = migrateSettings(payload);

    expect(result.dnsServer).toBe(DEFAULT_SETTINGS.dnsServer);
  });

  it('falls back to defaults for invalid payload', () => {
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings('bad')).toEqual(DEFAULT_SETTINGS);
  });

  it('normalizes preferredLocale values when present', () => {
    const payload = {
      version: 3,
      preferredLocale: 'pt',
    };

    const result = migrateSettings(payload);

    expect(result.preferredLocale).toBe('pt-BR');
  });

  it('compares accessibility configs by field', () => {
    const baseline = DEFAULT_SETTINGS.accessibility;
    expect(areAccessibilityConfigsEqual(baseline, baseline)).toBe(true);
    expect(
      areAccessibilityConfigsEqual(baseline, {
        ...baseline,
        highContrast: true,
      }),
    ).toBe(false);
  });
});
