import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  parseJavaProperties,
  resolveAndroidSdkDir,
} = require("../scripts/verify-android-setup.js") as {
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
});

