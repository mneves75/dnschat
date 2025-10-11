/**
 * Not Found Screen - 404 Handler
 *
 * This screen is displayed when a user navigates to a route that doesn't exist.
 *
 * CRITICAL: The + prefix in the filename (+not-found.tsx) is a special Expo Router
 * convention that indicates this is a catch-all route for unmatched paths.
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { GlassCard, GlassButton } from '../src/design-system/glass';
import { useTranslation } from '../src/i18n';

/**
 * Not Found Screen Component
 *
 * CRITICAL: Default export required for Expo Router.
 * This screen catches all unmatched routes.
 */
export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // CRITICAL: Get translations
  const { t } = useTranslation();

  const handleGoHome = () => {
    router.replace('/'); // Navigate to home (ChatList)
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
      ]}
    >
      <GlassCard variant="prominent" style={styles.card}>
        <Text style={[styles.emoji]}>🔍</Text>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {t('screens.notFound')}
        </Text>
        <Text
          style={[styles.message, { color: isDark ? '#AEAEB2' : '#6D6D70' }]}
        >
          {t('errors.notFound')}
        </Text>

        <GlassButton
          variant="interactive"
          onPress={handleGoHome}
          accessibilityLabel="Go to home screen"
          style={styles.button}
        >
          <Text style={styles.buttonText}>{t('common.back')}</Text>
        </GlassButton>
      </GlassCard>
    </View>
  );
}

/**
 * CRITICAL: StyleSheet.create for performance
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    maxWidth: 400,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
