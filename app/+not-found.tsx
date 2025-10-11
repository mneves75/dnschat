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

import { StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { router } from 'expo-router';

/**
 * Not Found Screen Component
 *
 * CRITICAL: Default export required for Expo Router.
 * This screen catches all unmatched routes.
 */
export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
      <Text style={[styles.emoji]}>🔍</Text>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        Page Not Found
      </Text>
      <Text
        style={[styles.message, { color: isDark ? '#AEAEB2' : '#6D6D70' }]}
      >
        The page you're looking for doesn't exist or has been moved.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#007AFF' }]}
        onPress={handleGoHome}
        accessibilityRole="button"
        accessibilityLabel="Go to home screen"
      >
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
