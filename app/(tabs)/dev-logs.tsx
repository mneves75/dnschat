/**
 * Developer Logs Screen - Tab (__DEV__ only)
 *
 * Shows detailed DNS logging output for debugging.
 * Only visible in development builds.
 *
 * CRITICAL: This tab only renders in __DEV__ mode.
 * See app/(tabs)/_layout.tsx for conditional rendering.
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DNSLogViewer } from '../../src/components/DNSLogViewer';

/**
 * DevLogs Screen Component
 *
 * CRITICAL: Default export required for Expo Router.
 * This screen wraps the existing DNSLogViewer component.
 */
export default function DevLogsScreen() {
  return (
    <View style={styles.container}>
      <DNSLogViewer maxEntries={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
