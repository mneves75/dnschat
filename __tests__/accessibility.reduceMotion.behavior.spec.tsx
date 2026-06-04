import React from "react";
import { AccessibilityInfo } from "react-native";
import { act } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

/**
 * Behavioral regression guard for the 4.0.19 -> 4.0.20 reduce-motion crash.
 *
 * 4.0.19 derived `isReduceMotionEnabled` from an async OS probe while animated
 * screens were already mounted. For users with iOS Reduce Motion enabled, that
 * false -> true transition re-triggered transition effects and drove "Maximum
 * update depth exceeded".
 *
 * The current contract honors the OS setting before children render, then
 * listens to user-driven OS changes after startup.
 */

type MockSettings = {
  accessibility: {
    fontSize: "small" | "medium" | "large" | "extra-large";
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  updateAccessibility: jest.Mock;
};

const baseSettings: MockSettings = {
  accessibility: {
    fontSize: "medium",
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
  updateAccessibility: jest.fn(async () => undefined),
};

let currentSettings: MockSettings = baseSettings;

jest.mock("../src/context/SettingsContext", () => ({
  useSettings: () => currentSettings,
}));

const { AccessibilityProvider, useMotionReduction } =
  require("../src/context/AccessibilityContext") as typeof import("../src/context/AccessibilityContext");

function Probe({ onValue }: { onValue: (value: boolean) => void }) {
  const { shouldReduceMotion } = useMotionReduction();
  onValue(shouldReduceMotion);
  return null;
}

async function renderProbe() {
  const values: boolean[] = [];
  await act(async () => {
    createWithSuppressedWarnings(
      <AccessibilityProvider>
        <Probe onValue={(value) => values.push(value)} />
      </AccessibilityProvider>,
    );
  });
  return values;
}

describe("AccessibilityContext reduce-motion behavior", () => {
  beforeEach(() => {
    currentSettings = baseSettings;
    jest.clearAllMocks();
    (AccessibilityInfo.isReduceMotionEnabled as unknown) = jest.fn(async () => false);
  });

  it("honors the initial OS reduce-motion setting before children render", async () => {
    (AccessibilityInfo.isReduceMotionEnabled as unknown) = jest.fn(async () => true);

    const values = await renderProbe();

    expect(values.length).toBeGreaterThan(0);
    expect(values.every((value) => value === true)).toBe(true);
  });

  it("reflects the in-app reduce-motion preference when enabled", async () => {
    currentSettings = {
      ...baseSettings,
      accessibility: { ...baseSettings.accessibility, reduceMotion: true },
    };

    const values = await renderProbe();

    expect(values.length).toBeGreaterThan(0);
    expect(values.every((value) => value === true)).toBe(true);
  });

  it("subscribes to OS reduceMotionChanged events after startup", async () => {
    const addSpy = jest.spyOn(AccessibilityInfo, "addEventListener");

    await renderProbe();

    const subscribedEvents = addSpy.mock.calls.map((call) => call[0]);
    expect(subscribedEvents).toContain("reduceMotionChanged");

    addSpy.mockRestore();
  });
});
