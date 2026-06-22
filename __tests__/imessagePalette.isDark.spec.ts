/**
 * Locks the semantic `isDark` signal on the palette.
 *
 * SkeletonMessage (and any other consumer) derives light/dark placeholder tints
 * from `palette.isDark` instead of comparing `textPrimary` to a hard-coded hex.
 * The previous hex comparison silently broke under high-contrast palettes; this
 * test guarantees `isDark` stays correct, including when high contrast remaps
 * other color tokens.
 */
import {
  IMESSAGE_LIGHT,
  IMESSAGE_DARK,
  getImessagePalette,
} from "../src/ui/theme/imessagePalette";

describe("imessagePalette isDark signal", () => {
  it("base constants carry the correct scheme flag", () => {
    expect(IMESSAGE_LIGHT.isDark).toBe(false);
    expect(IMESSAGE_DARK.isDark).toBe(true);
  });

  it("getImessagePalette reflects the requested scheme", () => {
    expect(getImessagePalette(false).isDark).toBe(false);
    expect(getImessagePalette(true).isDark).toBe(true);
  });

  it("preserves isDark through the high-contrast spread", () => {
    expect(getImessagePalette(false, { highContrast: true }).isDark).toBe(false);
    expect(getImessagePalette(true, { highContrast: true }).isDark).toBe(true);
  });
});
