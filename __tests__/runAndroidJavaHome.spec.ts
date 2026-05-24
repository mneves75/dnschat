const path = require("node:path");

const { resolveJava17Home, buildAndroidEnv } = require("../scripts/run-android");

describe("run-android: Java 17 detection", () => {
  function createJavaHomeExecStub() {
    return (cmd: string, args: string[]) => {
      if (cmd === "/usr/libexec/java_home") {
        if (args?.[1] === "17") {
          return " /Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home \n";
        }
        if (args?.[1] === "21") {
          return " /Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home \n";
        }
      }
      throw new Error(`unexpected call: ${cmd} ${(args || []).join(" ")}`);
    };
  }

  function createJavaVersionSpawnStub(outputByJavaBinaryPath: Record<string, string>) {
    return (cmd: string) => {
      const stderr = outputByJavaBinaryPath[cmd];
      if (!stderr) throw new Error(`unexpected spawn: ${cmd}`);
      return {
        status: 0,
        stdout: "",
        stderr,
      };
    };
  }

  it("prefers valid JAVA_HOME when set", () => {
    const result = resolveJava17Home({
      platform: "darwin",
      env: { JAVA_HOME: "/custom/jdk17" },
      existsSyncImpl: (p: string) => p === "/custom/jdk17",
      execFileSyncImpl: createJavaHomeExecStub(),
      spawnSyncImpl: createJavaVersionSpawnStub({
        "/custom/jdk17/bin/java": 'openjdk version "17.0.11" 2024-04-16',
      }),
    });

    expect(result).toEqual({ source: "JAVA_HOME", dir: "/custom/jdk17", major: 17 });
  });

  it("uses macOS /usr/libexec/java_home -v 17 when available", () => {
    const result = resolveJava17Home({
      platform: "darwin",
      env: {},
      existsSyncImpl: (p: string) =>
        p === "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home",
      execFileSyncImpl: createJavaHomeExecStub(),
      spawnSyncImpl: createJavaVersionSpawnStub({
        "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home/bin/java":
          'openjdk version "17.0.11" 2024-04-16',
      }),
    });

    expect(result).toEqual({
      source: "/usr/libexec/java_home -v 17",
      dir: "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home",
      major: 17,
    });
  });

  it("falls back to supported Homebrew Java locations", () => {
    const existing = "/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home";

    const result = resolveJava17Home({
      platform: "linux",
      env: {},
      existsSyncImpl: (p: string) => p === existing,
      execFileSyncImpl: createJavaHomeExecStub(),
      spawnSyncImpl: createJavaVersionSpawnStub({
        "/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home/bin/java":
          'openjdk version "21.0.9" 2025-10-21 LTS',
      }),
    });

    expect(result).toEqual({
      source: "homebrew supported OpenJDK",
      dir: existing,
      major: 21,
    });
  });

  it("ignores unsupported JAVA_HOME and resolves supported fallback", () => {
    const result = resolveJava17Home({
      platform: "darwin",
      env: { JAVA_HOME: "/custom/jdk25" },
      existsSyncImpl: (p: string) =>
        p === "/custom/jdk25" || p === "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home",
      execFileSyncImpl: createJavaHomeExecStub(),
      spawnSyncImpl: createJavaVersionSpawnStub({
        "/custom/jdk25/bin/java": 'openjdk version "25.0.2" 2026-01-20 LTS',
        "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home/bin/java":
          'openjdk version "21.0.9" 2025-10-21 LTS',
      }),
    });

    expect(result).toEqual({
      source: "/usr/libexec/java_home -v 21",
      dir: "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home",
      major: 21,
    });
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
