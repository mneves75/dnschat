/**
 * Token-level WCAG contrast guard for small-text chips.
 *
 * The Logs method badge renders a 12pt label (small text, so WCAG 2.1 AA needs
 * 4.5:1, not the 3:1 large-text allowance) on the shared `assistantBubble` fill.
 * It shipped as `userBubble` (systemBlue) on that fill, which fails in BOTH
 * themes. The fix pairs the fill with its dedicated `bubbleTextOnGray` token.
 *
 * The old pair is asserted to FAIL as a positive control: without it a broken
 * ratio function would report every pair as passing and the guard would be
 * vacuous.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { IMESSAGE_DARK, IMESSAGE_LIGHT } from "../src/ui/theme/imessagePalette";
import type { IMessagePalette } from "../src/ui/theme/imessagePalette";

const AA_SMALL_TEXT = 4.5;
const WHITE = "#FFFFFF";

type Rgb = readonly [number, number, number];
type Rgba = readonly [number, number, number, number];

const parseHex = (hex: string): Rgb => {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  if (!/^[0-9a-f]{6}$/i.test(full)) {
    throw new Error(`Expected an opaque hex color, received "${hex}"`);
  }

  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

const parseColor = (color: string): Rgba => {
  const value = color.trim();
  if (value.startsWith("#")) {
    const [r, g, b] = parseHex(value);
    return [r, g, b, 1];
  }

  const rgba = value.match(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(0(?:\.\d+)?|1(?:\.0+)?)\)$/,
  );
  if (!rgba) {
    throw new Error(
      `Expected an opaque hex or rgba color, received "${color}"`,
    );
  }

  return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4])];
};

const composite = (foreground: string, background: string): string => {
  const [r, g, b, a] = parseColor(foreground);
  const [br, bg, bb, ba] = parseColor(background);
  if (ba !== 1) {
    throw new Error(
      `Background must resolve to opaque before compositing: ${background}`,
    );
  }

  const channels = [r, g, b].map((channel, index) => {
    const base = [br, bg, bb][index];
    if (base === undefined) throw new Error("RGB channel out of range");
    return Math.round(channel * a + base * (1 - a));
  });

  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
};

/** WCAG 2.1 relative luminance (sRGB). */
const relativeLuminance = (hex: string): number => {
  const [r, g, b] = parseHex(hex).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (foreground: string, background: string): number => {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
};

const themes: ReadonlyArray<readonly [string, IMessagePalette]> = [
  ["light", IMESSAGE_LIGHT],
  ["dark", IMESSAGE_DARK],
];

describe("contrastRatio helper (positive control)", () => {
  it("reports the known reference ratios", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
    // Order must not matter.
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });

  it("composites translucent surfaces before measuring them", () => {
    expect(composite("rgba(255,255,255,0.82)", "#F2F2F7")).toBe("#fdfdfe");
  });

  it("rejects a color it cannot measure instead of scoring it", () => {
    expect(() => contrastRatio("currentColor", "#FFFFFF")).toThrow(
      "Expected an opaque hex color",
    );
  });
});

describe("message bubble text contrast", () => {
  it.each(themes)(
    "detects the old white-on-userBubble failure (%s)",
    (_name, palette) => {
      expect(contrastRatio(WHITE, palette.userBubble)).toBeLessThan(
        AA_SMALL_TEXT,
      );
    },
  );

  it.each(themes)(
    "meets AA normal-text contrast on userBubble with bubbleTextOnBlue (%s)",
    (_name, palette) => {
      expect(
        contrastRatio(palette.bubbleTextOnBlue, palette.userBubble),
      ).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
    },
  );
});

describe("onboarding accent text contrast", () => {
  it.each(themes)(
    "meets AA normal-text contrast for neutral onboarding surfaces (%s)",
    (_name, palette) => {
      const resolvedSurface = composite(palette.surface, palette.background);

      for (const background of [
        palette.background,
        palette.solid,
        resolvedSurface,
      ]) {
        expect(
          contrastRatio(palette.accentText, background),
        ).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
      }
    },
  );
});

describe("Logs method badge contrast", () => {
  it.each(themes)(
    "fails AA with the shipped userBubble-on-assistantBubble pair (%s)",
    (_name, palette) => {
      // Positive control: the regression this guard exists for must be detected.
      expect(
        contrastRatio(palette.userBubble, palette.assistantBubble),
      ).toBeLessThan(AA_SMALL_TEXT);
    },
  );

  it.each(themes)(
    "meets AA small-text contrast with bubbleTextOnGray on assistantBubble (%s)",
    (_name, palette) => {
      expect(
        contrastRatio(palette.bubbleTextOnGray, palette.assistantBubble),
      ).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
    },
  );

  it("renders the badge with the passing token pair at small-text size", () => {
    const source = readFileSync(
      join(__dirname, "..", "src", "navigation", "screens", "Logs.tsx"),
      "utf8",
    );

    const badgeBlock = source.slice(
      source.indexOf("backgroundColor: palette.assistantBubble"),
    );
    expect(badgeBlock.slice(0, 260)).toContain("palette.bubbleTextOnGray");
    expect(badgeBlock.slice(0, 260)).not.toContain("palette.userBubble");

    // 12pt is below the WCAG large-text threshold, so 4.5:1 is the bar above.
    const methodTextBlock = source.slice(source.indexOf("methodText: {"));
    expect(methodTextBlock.slice(0, 120)).toContain("fontSize: 12");
  });
});
