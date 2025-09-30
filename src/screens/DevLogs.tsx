import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { DNSLogViewer } from "../components/DNSLogViewer";
import { useGlassTheme } from "../hooks/useGlassTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {/* Glass Toolbar */}
      <View style={[getGlassStyle("navbar", "prominent", "rect"), styles.toolbar]}>
        <Text style={[styles.toolbarTitle, { color: colors.text }]}>Developer Logs</Text>
        <Text style={[styles.toolbarSubtitle, { color: colors.muted }]}>
          DNS query pipeline diagnostics
        </Text>
      </View>

      {/* Glass Debug Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            getGlassStyle("button", "interactive", "capsule"),
            styles.debugButton,
            pressed && styles.debugButtonPressed,
          ]}
          onPress={() => router.push("/glass-debug")}
        >
          <Text style={[styles.debugButtonText, { color: colors.accent }]}>
            🔍 Glass Debug
          </Text>
        </Pressable>
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
  debugButtonPressed: {
    opacity: 0.75,
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DevLogs;
