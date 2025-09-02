import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface InfoIconProps {
  size: number;
  color: string;
}

export function InfoIcon({ size, color }: InfoIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.text, { fontSize: size * 0.6, color }]}>ⓘ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "bold",
  },
});
