const path = require("node:path");

const { resolveJava17Home, buildAndroidEnv } = require("../scripts/run-android");

describe("run-android: Java 17 detection", () => {
  it("prefers valid JAVA_HOME when set", () => {
    const result = resolveJava17Home({
      platform: "darwin",
      env: { JAVA_HOME: "/custom/jdk17" },
      existsSyncImpl: (p: string) => p === "/custom/jdk17",
      execFileSyncImpl: () => "/usr/libexec/java_home/should-not-be-called",
    });

    expect(result).toEqual({ source: "JAVA_HOME", dir: "/custom/jdk17" });
  });

  it("uses macOS /usr/libexec/java_home -v 17 when available", () => {
    const result = resolveJava17Home({
      platform: "darwin",
      env: {},
      existsSyncImpl: (p: string) =>
        p === "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home",
      execFileSyncImpl: () => " /Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home \n",
    });

    expect(result).toEqual({
      source: "/usr/libexec/java_home -v 17",
      dir: "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home",
    });
  });

  it("falls back to Homebrew Java 17 locations", () => {
    const existing = "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home";

    const result = resolveJava17Home({
      platform: "linux",
      env: {},
      existsSyncImpl: (p: string) => p === existing,
      execFileSyncImpl: () => {
        throw new Error("should not be called");
      },
    });

    expect(result).toEqual({ source: "homebrew openjdk@17", dir: existing });
  });

  it("buildAndroidEnv prefixes PATH with JAVA_HOME/bin", () => {
    const env = buildAndroidEnv({
      baseEnv: { PATH: "/usr/bin" },
      javaHomeResult: { source: "test", dir: "/jdk17" },
    });

    const expectedPrefix = path.join("/jdk17", "bin");
    expect(env.JAVA_HOME).toBe("/jdk17");
    expect(env.PATH.split(path.delimiter)[0]).toBe(expectedPrefix);
  });
});
