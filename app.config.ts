import type { ConfigContext, ExpoConfig } from '@expo/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseAppConfig = require('./app.json') as { expo?: Partial<ExpoConfig> };

const BUILD_TOOLS_VERSION = '35.0.0';
const KOTLIN_VERSION = '1.9.24';
const COMPILE_SDK_VERSION = 35;
const TARGET_SDK_VERSION = 35;

export default function createConfig(context: ConfigContext): ExpoConfig {
  const { config } = context;
  const base = baseAppConfig.expo ?? {};

  const plugins: ExpoConfig['plugins'] = [
    'expo-asset',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/splash-icon.png',
      },
    ],
    'react-native-edge-to-edge',
    'expo-localization',
    './plugins/dns-native-plugin',
    './plugins/liquid-glass-plugin',
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '16.0',
          flipper: false,
          ccacheEnabled: true,
          newArchEnabled: true,
          generateStaticFrameworks: true,
          generateSourcemap: true,
          includeSymbolsInDsym: true,
          xcodeproj: {
            buildSettings: {
              DEBUG_INFORMATION_FORMAT: 'dwarf-with-dsym',
              DSYM_FOLDER_PATH: '$(BUILT_PRODUCTS_DIR)/$(TARGET_NAME).app.dSYM',
              DEPLOYMENT_POSTPROCESSING: 'YES',
              SEPARATE_STRIP: 'YES',
              STRIP_INSTALLED_PRODUCT: 'YES',
              COPY_PHASE_STRIP: 'NO',
            },
          },
        },
        android: {
          compileSdkVersion: COMPILE_SDK_VERSION,
          targetSdkVersion: TARGET_SDK_VERSION,
          buildToolsVersion: BUILD_TOOLS_VERSION,
          kotlinVersion: KOTLIN_VERSION,
        },
      },
    ],
  ];

  if (
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT &&
    process.env.SENTRY_AUTH_TOKEN
  ) {
    plugins.push([
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        url: process.env.SENTRY_URL ?? 'https://sentry.io/',
        uploadDebugSymbols: true,
        uploadSourceMaps: true,
      },
    ]);
  }

  return {
    ...base,
    ...config,
    name: 'DNS Chat',
    slug: 'chat-dns',
    version: '2.0.1',
    orientation: 'default',
    icon: './icons/dnschat_ios26.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    scheme: 'dnschat',
    ios: {
      ...base.ios,
      supportsTablet: true,
      bundleIdentifier: 'org.mvneves.dnschat',
    },
    android: {
      ...base.android,
      adaptiveIcon: {
        foregroundImage: './icons/dnschat_ios26.png',
        backgroundColor: '#0D7377',
      },
      package: 'org.mvneves.dnschat',
    },
    web: {
      ...base.web,
      favicon: './assets/favicon.png',
    },
    extra: {
      sentryDsn: process.env.SENTRY_DSN ?? null,
      sentryEnvironment: process.env.SENTRY_ENV ?? process.env.NODE_ENV ?? 'development',
      sentryTracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1',
      sentryProfilesSampleRate: process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '0.0',
    },
    plugins,
  };
}
