import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
const sentryDsn = typeof extra.sentryDsn === 'string' ? extra.sentryDsn : null;

if (sentryDsn) {
  const sentryEnvironment =
    typeof extra.sentryEnvironment === 'string' ? extra.sentryEnvironment : 'development';
  const tracesSampleRate = Number(extra.sentryTracesSampleRate ?? 0.1);
  const profilesSampleRate = Number(extra.sentryProfilesSampleRate ?? 0.0);

  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnvironment,
    enableAutoSessionTracking: true,
    tracesSampleRate,
    profilesSampleRate,
  });
}
