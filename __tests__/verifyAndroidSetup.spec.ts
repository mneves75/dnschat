import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  checkAdbReverse,
  checkAndroidReleaseSigningPolicy,
  checkMetroPort,
  isSupportedAndroidJavaMajor,
  checkMainApplicationKt,
  isValidTcpPort,
  parseJavaMajorVersion,
  parseJavaProperties,
  resolveAndroidSdkDir,
} = require("../scripts/verify-android-setup.js") as {
  checkAdbReverse: (options?: {
    env?: Record<string, string | undefined>;
    execFileSyncImpl?: (...args: unknown[]) => string;
  }) => boolean;
  checkAndroidReleaseSigningPolicy: () => boolean;
  checkMetroPort: (options?: {
    env?: Record<string, string | undefined>;
    execFileSyncImpl?: (...args: unknown[]) => string;
  }) => boolean;
  isSupportedAndroidJavaMajor: (major: number | null) => boolean;
  checkMainApplicationKt: () => boolean;
  isValidTcpPort: (value: string) => boolean;
  parseJavaMajorVersion: (raw: string) => number | null;
  parseJavaProperties: (raw: string) => Record<string, string>;
  resolveAndroidSdkDir: (args: {
    projectRoot: string;
    env?: Record<string, string | undefined>;
    homedir?: string;
  }) => {
    ok: boolean;
    sdkDir: string | null;
    source: string | null;
    localPropertiesPath: string;
    localSdkDirIsInvalid: boolean;
    localSdkDir: string | null;
  };
};

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-android-verify-"));
}

describe("scripts/verify-android-setup.js helpers", () => {
  it("parses local.properties style key/value pairs", () => {
    const parsed = parseJavaProperties(`
      # comment
      sdk.dir=/Users/me/Library/Android/sdk
      key.with.colon: value
      escaped=hello\\ world
    `);

    expect(parsed["sdk.dir"]).toBe("/Users/me/Library/Android/sdk");
    expect(parsed["key.with.colon"]).toBe("value");
    expect(parsed["escaped"]).toBe("hello world");
  });

  it("resolves SDK from ANDROID_SDK_ROOT when local.properties is invalid", () => {
    const root = makeTempDir();
    const androidDir = path.join(root, "android");
    fs.mkdirSync(androidDir, { recursive: true });
    fs.writeFileSync(
      path.join(androidDir, "local.properties"),
      "sdk.dir=/does/not/exist\n",
      "utf8",
    );

    const realSdk = path.join(root, "fake-android-sdk");
    fs.mkdirSync(realSdk, { recursive: true });

    const result = resolveAndroidSdkDir({
      projectRoot: root,
      env: { ANDROID_SDK_ROOT: realSdk },
      homedir: "/nonexistent-home",
    });

    expect(result.ok).toBe(true);
    expect(result.sdkDir).toBe(path.resolve(realSdk));
    expect(result.source).toBe("ANDROID_SDK_ROOT");
    expect(result.localSdkDirIsInvalid).toBe(true);
  });

  it("fails when no SDK location is discoverable", () => {
    const root = makeTempDir();
    const androidDir = path.join(root, "android");
    fs.mkdirSync(androidDir, { recursive: true });

    const result = resolveAndroidSdkDir({
      projectRoot: root,
      env: {},
      homedir: "/nonexistent-home",
    });

    expect(result.ok).toBe(false);
    expect(result.sdkDir).toBeNull();
  });

  it("parses Java major version and validates supported range", () => {
    expect(parseJavaMajorVersion('openjdk version "21.0.9" 2025-10-21 LTS')).toBe(21);
    expect(parseJavaMajorVersion('openjdk version "25.0.2" 2026-01-20 LTS')).toBe(25);
    expect(parseJavaMajorVersion("invalid")).toBeNull();
    expect(isSupportedAndroidJavaMajor(17)).toBe(true);
    expect(isSupportedAndroidJavaMajor(21)).toBe(true);
    expect(isSupportedAndroidJavaMajor(25)).toBe(false);
    expect(isSupportedAndroidJavaMajor(null)).toBe(false);
  });

  it("rejects invalid Metro ports before launching a process", () => {
    const execFileSyncImpl = jest.fn(() => "123\n");

    expect(isValidTcpPort("8081")).toBe(true);
    expect(isValidTcpPort("0")).toBe(false);
    expect(isValidTcpPort("65536")).toBe(false);
    expect(isValidTcpPort("8081;invalid")).toBe(false);
    expect(
      checkMetroPort({
        env: { RCT_METRO_PORT: "8081;invalid" },
        execFileSyncImpl,
      }),
    ).toBe(false);
    expect(execFileSyncImpl).not.toHaveBeenCalled();
  });

  it("passes Metro and ADB values as argument arrays", () => {
    const execFileSyncImpl = jest.fn((command: unknown, args: unknown) => {
      if (command === "lsof") return "123\n";
      if (command === "adb" && Array.isArray(args) && args[0] === "devices") {
        return "List of devices attached\nemulator-5554\tdevice\n";
      }
      if (command === "adb") return "emulator-5554 tcp:8081 tcp:8081\n";
      throw new Error("unexpected command");
    });

    expect(
      checkMetroPort({ env: { RCT_METRO_PORT: "8081" }, execFileSyncImpl }),
    ).toBe(true);
    expect(
      checkAdbReverse({ env: { RCT_METRO_PORT: "8081" }, execFileSyncImpl }),
    ).toBe(true);
    expect(execFileSyncImpl).toHaveBeenCalledWith(
      "lsof",
      ["-ti", ":8081"],
      expect.objectContaining({ encoding: "utf8" }),
    );
    expect(execFileSyncImpl).toHaveBeenCalledWith(
      "adb",
      ["-s", "emulator-5554", "reverse", "--list"],
      expect.objectContaining({ encoding: "utf8" }),
    );
  });

  it("validates current MainApplication registration policy", () => {
    expect(checkMainApplicationKt()).toBe(true);
  });

  it("validates current Android release signing policy", () => {
    expect(checkAndroidReleaseSigningPolicy()).toBe(true);
  });
});
