import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { Text } from "react-native";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

// Child that throws on mount until `shouldThrow` is cleared, so we can prove retry
// re-mounts the subtree.
let shouldThrow = true;
function Bomb() {
  if (shouldThrow) {
    throw new Error("boom");
  }
  return <Text testID="recovered">recovered</Text>;
}

describe("ErrorBoundary - custom fallback", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    shouldThrow = true;
    // React logs caught render errors to console.error; silence only for these tests.
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("renders the custom fallback (not the default) when a child throws", () => {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = createWithSuppressedWarnings(
        <ErrorBoundary fallback={() => <Text testID="custom-fallback">nope</Text>}>
          <Bomb />
        </ErrorBoundary>,
      );
    });

    expect(tree.root.findAllByProps({ testID: "custom-fallback" }).length).toBeGreaterThan(0);
    // The throwing child must not be mounted while the fallback is shown.
    expect(tree.root.findAllByProps({ testID: "recovered" })).toHaveLength(0);
  });

  it("retry clears the error and re-mounts children", () => {
    let capturedRetry: () => void = () => {};
    let tree!: ReactTestRenderer;
    act(() => {
      tree = createWithSuppressedWarnings(
        <ErrorBoundary
          fallback={(_error, retry) => {
            capturedRetry = retry;
            return <Text testID="custom-fallback">nope</Text>;
          }}
        >
          <Bomb />
        </ErrorBoundary>,
      );
    });
    expect(tree.root.findAllByProps({ testID: "custom-fallback" }).length).toBeGreaterThan(0);

    // Stop throwing, then retry: the boundary should re-mount the recovered child.
    shouldThrow = false;
    act(() => {
      capturedRetry();
    });

    expect(tree.root.findAllByProps({ testID: "recovered" }).length).toBeGreaterThan(0);
    expect(tree.root.findAllByProps({ testID: "custom-fallback" })).toHaveLength(0);
  });

  it("invokes onError when a child throws", () => {
    const onError = jest.fn();
    act(() => {
      createWithSuppressedWarnings(
        <ErrorBoundary fallback={() => null} onError={onError}>
          <Bomb />
        </ErrorBoundary>,
      );
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
