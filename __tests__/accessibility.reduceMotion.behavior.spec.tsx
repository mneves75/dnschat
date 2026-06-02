import React from "react";
import { AccessibilityInfo } from "react-native";
import { act } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

/**
 * Behavioral regression guard for the 4.0.19 -> 4.0.20 reduce-motion crash.
 *
 * 4.0.19 derived `isReduceMotionEnabled` from an async `AccessibilityInfo`
 * probe that flips `false -> true` after mount. For users with iOS Reduce
 * Motion enabled, that runtime transition re-triggered motion-transition
 * effects across animated screens and drove "Maximum update depth exceeded".
 *
 * The fix makes reduce motion a stable, in-app-only preference. These tests
 * render the provider (unlike the previous source-string assertions) so a
 * reintroduced async flip or OS subscription fails CI.
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

describe("AccessibilityContext reduce-motion stability", () => {
  beforeEach(() => {
    currentSettings = baseSettings;
    jest.clearAllMocks();
  });

  it("ignores the async OS probe and never flips reduce motion mid-session", async () => {
    // OS reports Reduce Motion ON. The provider must NOT adopt it: that async
    // false->true flip is exactly what regressed in 4.0.19.
    (AccessibilityInfo.isReduceMotionEnabled as unknown) = jest.fn(async () => true);

    const values = await renderProbe();

    expect(values.length).toBeGreaterThan(0);
    expect(values.every((value) => value === false)).toBe(true);
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

  it("does not subscribe to OS reduceMotionChanged events", async () => {
    const addSpy = jest.spyOn(AccessibilityInfo, "addEventListener");

    await renderProbe();

    const subscribedEvents = addSpy.mock.calls.map((call) => call[0]);
    expect(subscribedEvents).not.toContain("reduceMotionChanged");

    addSpy.mockRestore();
  });
});
