/**
 * Regressions for the redesign follow-up corrections.
 *
 * Covers the defects introduced (or left behind) when Liquid Glass was removed
 * from routine content: a square-clipped form panel, an onboarding preview that
 * disagreed with the real chat bubble, a stray separator under the last log row,
 * inert accessibility props, and a hardcoded last-item index.
 */
import React from "react";
import type { ReactTestRenderer } from "react-test-renderer";
import { act } from "react-test-renderer";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { LiquidGlassSpacing } from "../src/ui/theme/liquidGlassSpacing";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

const readSource = (...segments: string[]) =>
  readFileSync(join(__dirname, "..", ...segments), "utf8");

// ==================================================================================
// SOURCE INVARIANTS
// ==================================================================================

describe("GlassForm inset panel", () => {
  const source = readSource("src", "components", "glass", "GlassForm.tsx");

  it("keeps the grouped panel rounded after the LiquidGlassWrapper removal", () => {
    const sectionContent = source.slice(source.indexOf("sectionContent: {"));
    expect(sectionContent.slice(0, 320)).toContain(
      "borderRadius: LiquidGlassSpacing.cornerRadiusSmall",
    );
    expect(sectionContent.slice(0, 320)).toContain('overflow: "hidden"');
  });

  it("uses the existing 12pt token rather than a new radius abstraction", () => {
    expect(LiquidGlassSpacing.cornerRadiusSmall).toBe(12);
  });
});

describe("Onboarding first-chat preview", () => {
  const previewSource = readSource(
    "src",
    "components",
    "onboarding",
    "screens",
    "FirstChatScreen.tsx",
  );
  const bubbleSource = readSource("src", "components", "MessageBubble.tsx");

  it("colors the user preview bubble with the same token as the real bubble", () => {
    expect(bubbleSource).toContain("palette.bubbleTextOnBlue");

    const previewText = previewSource.slice(
      previewSource.indexOf("styles.messageText"),
    );
    expect(previewText.slice(0, 400)).toContain("palette.bubbleTextOnBlue");
    expect(previewText.slice(0, 400)).not.toContain("palette.textOnChroma");
  });
});

describe("Onboarding features cards", () => {
  const source = readSource(
    "src",
    "components",
    "onboarding",
    "screens",
    "FeaturesScreen.tsx",
  );

  it("does not attach accessibility label/hint to a non-accessible container", () => {
    const card = source.slice(source.indexOf("function FeatureCard"));
    // Label and hint are conditional on the same flag that drives `accessible`.
    expect(card).toContain("const isSummary = !feature.action;");
    expect(card).toContain("accessible={isSummary}");
    expect(card).not.toContain(
      "accessibilityLabel={`${feature.label}. ${feature.title}. ${feature.description}`}",
    );
  });

  it("keeps the nested action and its text individually discoverable", () => {
    const card = source.slice(source.indexOf("function FeatureCard"));
    expect(card).toContain("accessible={Boolean(feature.action)}");
    expect(card).toContain('accessibilityRole="link"');
  });
});

describe("Onboarding network setup rows", () => {
  const source = readSource(
    "src",
    "components",
    "onboarding",
    "screens",
    "NetworkSetupScreen.tsx",
  );

  it("derives the last row from the actual list length", () => {
    expect(source).toContain("isLast={index === networkTests.length - 1}");
    expect(source).toContain(
      "borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth",
    );
    // The bug was a literal row count; any hardcoded index must stay gone.
    expect(source).not.toContain("index < 2");
  });

  it("changes only the active marker color, never its width", () => {
    const testItemStyle = source.slice(source.indexOf("testItem: {"));
    expect(testItemStyle.slice(0, 140)).toContain("borderLeftWidth: 2");
    expect(source).not.toContain("borderLeftWidth: isActive ? 2 : 0");
    expect(source).toContain("borderLeftColor: isActive");
  });
});

// ==================================================================================
// LOGS RENDER REGRESSION (LAST-ROW SEPARATOR)
// ==================================================================================

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../src/context/AccessibilityContext", () => ({
  useAccessibility: () => ({
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    highContrastEnabled: false,
  }),
  useHighContrast: () => ({ isHighContrast: false }),
  useMotionReduction: () => ({
    shouldReduceMotion: true,
    animationDuration: undefined,
  }),
  useScreenReader: () => ({ isEnabled: false, announce: () => undefined }),
  useFontSize: () => ({ scale: 1.0 }),
}));

jest.mock("../src/ui/hooks/useScreenEntrance", () => ({
  useScreenEntrance: () => ({ animatedStyle: {} }),
}));

jest.mock("../src/ui/hooks/useStaggeredList", () => {
  const ReactModule = require("react");
  return {
    useStaggeredListValues: () => ({ opacities: [], translates: [] }),
    AnimatedListItem: ({ children }: { children?: React.ReactNode }) =>
      ReactModule.createElement(ReactModule.Fragment, null, children),
  };
});

jest.mock("../src/components/glass/GlassForm", () => {
  const ReactModule = require("react");
  type ChildrenOnly = { children?: React.ReactNode };
  const Passthrough = ({ children }: ChildrenOnly) =>
    ReactModule.createElement(ReactModule.Fragment, null, children);
  return {
    Form: {
      List: Passthrough,
      Section: Passthrough,
      Item: Passthrough,
      Link: Passthrough,
    },
  };
});

jest.mock("../src/services/dnsLogService", () => {
  const buildLog = (id: string) => ({
    id,
    message: "redacted",
    startTime: new Date("2026-01-01T10:00:00Z").getTime(),
    finalStatus: "success",
    finalMethod: "udp",
    totalDuration: 120,
    entries: [],
  });
  const fixtures = [buildLog("log-1"), buildLog("log-2")];

  return {
    DNSLogService: {
      initialize: jest.fn(() => Promise.resolve()),
      getLogs: jest.fn(() => fixtures),
      subscribe: jest.fn(() => () => undefined),
      clearLogs: jest.fn(() => Promise.resolve()),
      formatDuration: (value: number) => `${value}ms`,
      getStatusIcon: () => "OK",
      getMethodColor: () => "#2196F3",
    },
  };
});

describe("Logs list separators", () => {
  it("renders a recoverable error state when encrypted logs cannot be loaded", async () => {
    const { DNSLogService } = require("../src/services/dnsLogService") as {
      DNSLogService: {
        initialize: jest.Mock<Promise<void>, []>;
      };
    };
    DNSLogService.initialize.mockRejectedValueOnce(
      new Error("secure storage unavailable"),
    );

    const { Logs } = require("../src/navigation/screens/Logs") as {
      Logs: React.ComponentType;
    };
    let renderer: ReactTestRenderer | undefined;
    await act(async () => {
      renderer = createWithSuppressedWarnings(<Logs />);
      await Promise.resolve();
    });

    if (!renderer) throw new Error("renderer was not created");
    expect(renderer.root.findByProps({ testID: "logs-load-error" })).toBeDefined();

    await act(async () => {
      renderer?.unmount();
    });
  });

  it("derives the last row from the rendered list length", () => {
    const source = readSource("src", "navigation", "screens", "Logs.tsx");
    expect(source).toContain("isLast={index === logs.length - 1}");
    expect(source).toContain(
      "borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth",
    );
    const logCardStyle = source.slice(source.indexOf("logCard: {"));
    expect(logCardStyle.slice(0, 120)).not.toContain("borderBottomWidth");
  });

  it("draws a hairline between rows but not under the last one", async () => {
    const { Logs } = require("../src/navigation/screens/Logs") as {
      Logs: React.ComponentType;
    };
    const { StyleSheet, View } = require("react-native") as {
      StyleSheet: {
        flatten: (
          style: unknown,
        ) => Record<string, number | string | undefined>;
        hairlineWidth: number;
      };
      View: React.ElementType;
    };

    let renderer: ReactTestRenderer | undefined;
    await act(async () => {
      renderer = createWithSuppressedWarnings(<Logs />);
    });

    if (!renderer) throw new Error("renderer was not created");
    const rendered: ReactTestRenderer = renderer;

    const cards = ["log-1", "log-2"].map((id) => {
      const row = rendered.root.findByProps({ testID: `logs-entry-${id}` });
      const card = row.findAllByType(View).find((node) => {
        const style = StyleSheet.flatten(node.props["style"]);
        return style?.["padding"] === 16 && "borderBottomWidth" in style;
      });

      if (!card) throw new Error(`log card ${id} was not rendered`);
      return StyleSheet.flatten(card.props["style"]);
    });

    expect(cards).toHaveLength(2);
    expect(cards[0]?.["borderBottomWidth"]).toBe(StyleSheet.hairlineWidth);
    expect(cards[1]?.["borderBottomWidth"]).toBe(0);

    await act(async () => {
      renderer?.unmount();
    });
  });
});
