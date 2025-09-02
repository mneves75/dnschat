import React from "react";
import { View, StyleSheet } from "react-native";
import { DNSLogViewer } from "../../components/DNSLogViewer";

export function DevLogs() {
  return (
    <View style={styles.container}>
      <DNSLogViewer maxEntries={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default DevLogs;
