/**
 * Regression coverage for the screenshot-mode detection bug.
 *
 * The custom `ScreenshotModeModule` was never added to the Xcode build, so
 * `NativeModules.ScreenshotModeModule` was always undefined and the old
 * detection always returned false — every pre-fix App Store screenshot was an
 * empty-state screen. Detection now relies on the `-SCREENSHOT_MODE 1` launch
 * argument, persisted to NSUserDefaults and read synchronously via RN's
 * Settings module (which IS in the build), surfaced as 1, "1", or true.
 */
const globals = globalThis as Record<string, unknown>;

type SettingsMock = { get: (key: string) => unknown } | undefined;

// `react-native` is module-mapped to a mock whose `Settings` is captured at load
// time by screenshotMode.ts. Re-evaluate both in an isolated registry so the
// Settings surface can be controlled per test.
function loadIsScreenshotMode(settings: SettingsMock): () => boolean {
  let fn: (() => boolean) | undefined;
  jest.isolateModules(() => {
    const rn = require("react-native") as { Settings?: SettingsMock };
    rn.Settings = settings;
    fn = (require("../src/utils/screenshotMode") as typeof import("../src/utils/screenshotMode"))
      .isScreenshotMode;
  });
  if (!fn) throw new Error("failed to load screenshotMode module");
  return fn;
}

describe("isScreenshotMode", () => {
  afterEach(() => {
    delete globals["__SCREENSHOT_MODE__"];
  });

  it.each([1, "1", true])(
    "returns true when Settings reports the launch argument as %p",
    (value) => {
      const isScreenshotMode = loadIsScreenshotMode({
        get: (key) => (key === "SCREENSHOT_MODE" ? value : undefined),
      });
      expect(isScreenshotMode()).toBe(true);
    },
  );

  it("returns false when the launch argument is absent (production)", () => {
    const isScreenshotMode = loadIsScreenshotMode({ get: () => undefined });
    expect(isScreenshotMode()).toBe(false);
  });

  it("does not crash and returns false when the Settings module is unavailable", () => {
    const isScreenshotMode = loadIsScreenshotMode(undefined);
    expect(isScreenshotMode()).toBe(false);
  });

  it("treats an unrelated Settings value (e.g. \"0\") as off", () => {
    const isScreenshotMode = loadIsScreenshotMode({
      get: (key) => (key === "SCREENSHOT_MODE" ? "0" : undefined),
    });
    expect(isScreenshotMode()).toBe(false);
  });
});
