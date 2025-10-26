import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import {
  Edge,
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { useImessagePalette } from "../../ui/theme/imessagePalette";

const DEFAULT_EDGES: readonly Edge[] = ["top", "right", "bottom", "left"];

export interface ScreenProps extends Pick<SafeAreaViewProps, "testID"> {
  children: React.ReactNode;
  /**
   * Optional override for safe-area edges, defaults to all edges so we never
   * render underneath status bar or home indicator.
   */
  edges?: Edge[];
  /**
   * Style applied to the inner content wrapper (after safe area padding).
   */
  contentStyle?: ViewStyle | ViewStyle[];
  /**
   * Style applied to the SafeAreaView itself.
   */
  style?: ViewStyle | ViewStyle[];
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  edges = DEFAULT_EDGES as Edge[],
  contentStyle,
  style,
  testID,
}) => {
  const palette = useImessagePalette();

  // We layer an inner View so children inherit the grouped background even when
  // they render scroll views or glass cards.
  return (
    <SafeAreaView
      testID={testID}
      edges={edges}
      style={[styles.safeArea, { backgroundColor: palette.background }, style]}
    >
      <View
        style={[
          styles.content,
          { backgroundColor: palette.background },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default Screen;
