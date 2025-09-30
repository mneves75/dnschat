import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { DNSLogViewer } from "../components/DNSLogViewer";
import { useGlassTheme } from "../hooks/useGlassTheme";

/**
 * DevLogs screen with minimal glass styling for developer-only features.
 *
 * Features:
 * - Minimal glass toolbar to maintain consistency
 * - DNSLogViewer component for detailed DNS query logging
 * - Glass Debug button for testing glass capabilities
 * - Gated behind __DEV__ flag (accessible via About screen)
 *
 * Performance: Minimal glass elements to avoid overhead in dev environment.
 *
 * Phase 3: About + Dev Tools Modernization (September 30, 2025)
 */
export function DevLogs() {
  const router = useRouter();
  const { colors, getGlassStyle } = useGlassTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Glass Toolbar */}
      <View style={[getGlassStyle("navbar", "prominent", "rect"), styles.toolbar]}>
        <Text style={[styles.toolbarTitle, { color: colors.text }]}>Developer Logs</Text>
        <Text style={[styles.toolbarSubtitle, { color: colors.muted }]}>
          DNS query pipeline diagnostics
        </Text>
      </View>

      {/* Glass Debug Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[getGlassStyle("button", "interactive", "capsule"), styles.debugButton]}
          onPress={() => router.push("/glass-debug")}
          activeOpacity={0.7}
        >
          <Text style={[styles.debugButtonText, { color: colors.accent }]}>
            🔍 Glass Debug
          </Text>
        </TouchableOpacity>
      </View>

      {/* DNS Log Viewer */}
      <DNSLogViewer maxEntries={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    paddingTop: 60, // Safe area spacing
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  toolbarTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  toolbarSubtitle: {
    fontSize: 14,
    fontWeight: "400",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  debugButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DevLogs;
