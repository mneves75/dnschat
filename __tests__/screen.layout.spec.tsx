import React from "react";
import { StyleSheet, Text } from "react-native";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { Screen } from "../src/components/layout/Screen";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children, ...props }: { children: React.ReactNode }) => (
    React.createElement("safe-area-view", props, children)
  ),
}));

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({
    background: "#fafafa",
  }),
}));

describe("Screen layout", () => {
  function renderScreen(element: React.ReactElement) {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = createWithSuppressedWarnings(element);
    });
    return tree;
  }

  it("applies default safe-area edges, forwards testID, and layers styles", () => {
    const tree = renderScreen(
      <Screen
        testID="profile-screen"
        style={{ paddingTop: 4 }}
        contentStyle={{ paddingHorizontal: 12 }}
      >
        <Text>Body</Text>
      </Screen>,
    );

    const safeArea = tree.root.find(
      (node: { type: unknown; props: Record<string, unknown> }) =>
        node.type === "safe-area-view" && node.props["testID"] === "profile-screen",
    );
    expect(safeArea.props["testID"]).toBe("profile-screen");
    expect(safeArea.props["edges"]).toEqual(["top", "right", "bottom", "left"]);
    expect(StyleSheet.flatten(safeArea.props["style"])).toMatchObject({
      flex: 1,
      backgroundColor: "#fafafa",
      paddingTop: 4,
    });

    const content = safeArea.find(
      (node: { type: unknown }) => node.type === "View",
    );
    expect(StyleSheet.flatten(content.props["style"])).toMatchObject({
      flex: 1,
      backgroundColor: "#fafafa",
      paddingHorizontal: 12,
    });
  });

  it("uses explicit safe-area edges when supplied", () => {
    const tree = renderScreen(
      <Screen edges={["bottom"]}>
        <Text>Body</Text>
      </Screen>,
    );

    const safeArea = tree.root.find(
      (node: { type: unknown }) => node.type === "safe-area-view",
    );
    expect(safeArea.props["edges"]).toEqual(["bottom"]);
  });
});
