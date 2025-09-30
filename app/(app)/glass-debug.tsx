import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Pressable,
} from "react-native";

import {
  LiquidGlassWrapper,
  useLiquidGlassCapabilities,
} from "../../src/components/LiquidGlassWrapper";
import { useAppTheme } from "../../src/theme";

export default function GlassDebugScreen() {
  const { colors } = useAppTheme();
  const capabilities = useLiquidGlassCapabilities();

  const capabilityRows = [
    { label: "Supported", value: capabilities.isSupported ? "Yes" : "No" },
    { label: "SwiftUI Glass", value: capabilities.supportsSwiftUIGlass ? "Yes" : "No" },
    { label: "Platform", value: Platform.OS },
    { label: "OS Version", value: Platform.Version?.toString() ?? "unknown" },
    { label: "Material Variant", value: capabilities.materialVariant ?? "n/a" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={[styles.title, { color: colors.text }]}>Liquid Glass Diagnostics</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Inspect device capability flags and preview the current material.</Text>

        <View style={[styles.section, { borderColor: colors.border }]}> 
          {capabilityRows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
              <Text style={[styles.rowValue, { color: colors.muted }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Material Preview</Text>
        <Text style={[styles.body, { color: colors.muted }]}>This block renders with the same parameters we pass to headers and tab bars when glass is available.</Text>

        <LiquidGlassWrapper
          variant="prominent"
          shape="roundedRect"
          enableContainer
          sensorAware
          style={styles.previewCard}
        >
          <Text style={[styles.previewTitle, { color: colors.text }]}>Glass Surface</Text>
          <Text style={[styles.previewBody, { color: colors.muted }]}>Move your device to see sensor parallax (supported hardware only).</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            style={({ pressed }) => [
              styles.previewButton,
              { backgroundColor: colors.accent },
              pressed && styles.previewButtonPressed,
            ]}
          >
            <Text style={styles.previewButtonLabel}>Tap Effect</Text>
          </Pressable>
        </LiquidGlassWrapper>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  section: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 14,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewCard: {
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  previewBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewButton: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  previewButtonPressed: {
    opacity: 0.7,
  },
  previewButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
