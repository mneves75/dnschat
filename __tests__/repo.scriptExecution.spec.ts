import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let scratch: string;
const repoRoot = process.cwd();

beforeEach(() => {
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-script-proof-"));
});

afterEach(() => {
  fs.rmSync(scratch, { recursive: true, force: true });
});

function copyScript(name: string, root = scratch) {
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  const target = path.join(root, "scripts", name);
  fs.copyFileSync(path.join(repoRoot, "scripts", name), target);
  return target;
}

const gitEnv = {
  ...Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
  ),
  NODE_ENV: process.env.NODE_ENV,
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
};

function git(root: string, ...args: string[]) {
  return execFileSync("git", args, {
    cwd: root,
    env: gitEnv,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

describe("hook installer execution", () => {
  it("creates the default hooks directory after an empty-template init", () => {
    const script = copyScript("install-git-hooks.js");
    git(scratch, "init", "--template=");
    const hooksDir = path.join(scratch, ".git", "hooks");
    expect(fs.existsSync(hooksDir)).toBe(false);

    const result = spawnSync(process.execPath, [script], {
      env: gitEnv,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    const hook = path.join(hooksDir, "pre-commit");
    expect(fs.readFileSync(hook, "utf8")).toContain("pnpm run lint");
    expect(fs.statSync(hook).mode & 0o111).toBe(0o111);
  });

  it("installs in a linked worktree using Git's shared hooks directory", () => {
    const source = path.join(scratch, "source");
    const linked = path.join(scratch, "linked");
    copyScript("install-git-hooks.js", source);
    git(source, "init");
    git(source, "add", "scripts/install-git-hooks.js");
    git(
      source,
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.com",
      "commit",
      "-m",
      "fixture",
    );
    git(source, "worktree", "add", "--detach", linked);

    const result = spawnSync(
      process.execPath,
      ["scripts/install-git-hooks.js"],
      {
        cwd: linked,
        env: gitEnv,
        encoding: "utf8",
      },
    );

    expect(result.stderr).not.toContain("ENOTDIR");
    expect(result.status).toBe(0);
    const hook = path.join(source, ".git", "hooks", "pre-commit");
    expect(fs.readFileSync(hook, "utf8")).toContain("pnpm run test --bail");
    expect(fs.statSync(hook).mode & 0o111).toBe(0o111);
  });

  it("honors core.hooksPath and restores executable mode on reinstall", () => {
    const script = copyScript("install-git-hooks.js");
    git(scratch, "init");
    git(scratch, "config", "core.hooksPath", "custom-hooks");
    fs.mkdirSync(path.join(scratch, "custom-hooks"));
    const hook = path.join(scratch, "custom-hooks", "pre-commit");
    expect(spawnSync(process.execPath, [script], { env: gitEnv }).status).toBe(
      0,
    );
    fs.chmodSync(hook, 0o644);
    const result = spawnSync(process.execPath, [script], {
      env: gitEnv,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(fs.readFileSync(hook, "utf8")).toContain("pnpm run lint");
    expect(fs.statSync(hook).mode & 0o111).toBe(0o111);
    expect(
      fs.existsSync(path.join(scratch, ".git", "hooks", "pre-commit")),
    ).toBe(false);
  });

  it("preserves a foreign pre-commit hook in a shared hooks directory", () => {
    const script = copyScript("install-git-hooks.js");
    git(scratch, "init");
    const hooksDir = path.join(scratch, "shared-hooks");
    git(scratch, "config", "core.hooksPath", hooksDir);
    fs.mkdirSync(hooksDir);
    const hook = path.join(hooksDir, "pre-commit");
    const sentinel = "#!/bin/sh\necho shared-project-policy\n";
    fs.writeFileSync(hook, sentinel, { mode: 0o755 });
    const result = spawnSync(process.execPath, [script], {
      env: gitEnv,
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Preserving existing pre-commit hook");
    expect(fs.readFileSync(hook, "utf8")).toBe(sentinel);
  });

  it("does not install project checks into an empty external shared directory", () => {
    const repository = path.join(scratch, "repository");
    const script = copyScript("install-git-hooks.js", repository);
    git(repository, "init");
    const shared = path.join(scratch, "shared-hooks");
    fs.mkdirSync(shared);
    git(repository, "config", "core.hooksPath", shared);
    const result = spawnSync(process.execPath, [script], {
      env: gitEnv,
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("outside this repository");
    expect(fs.readdirSync(shared)).toEqual([]);
  });

  it("skips an archive without a .git entry", () => {
    const result = spawnSync(
      process.execPath,
      [copyScript("install-git-hooks.js")],
      { encoding: "utf8" },
    );
    expect(result.status).toBe(0);
    expect(result.stderr).toContain("skipping hook install");
    expect(fs.existsSync(path.join(scratch, ".git"))).toBe(false);
  });
});

describe("ast-grep subprocess exit handling", () => {
  it.each([
    ["exit 0", 0],
    ["exit 7", 7],
    ["kill -TERM $$", 1],
  ])("propagates %s without reporting false success", (body, expected) => {
    const script = copyScript("run-ast-grep.js");
    const cliDir = path.join(scratch, "node_modules", "@ast-grep", "cli");
    fs.mkdirSync(cliDir, { recursive: true });
    fs.writeFileSync(path.join(cliDir, "ast-grep"), `#!/bin/sh\n${body}\n`, {
      mode: 0o755,
    });
    const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
    expect(result.status).toBe(expected);
  });
});

describe("Android LOAD alignment verification", () => {
  it.each<[boolean, boolean, boolean, number]>([
    [true, false, true, 1],
    [false, false, true, 1],
    [false, true, true, 1],
    [false, true, false, 0],
  ])(
    "validates each AAB and cleans extraction files (local: %s, valid AAB: %s, empty AAB: %s)",
    (withLocalLibraries, withValidArchive, withEmptyArchive, expectedExit) => {
      const script = copyScript("check-android-16kb.js");
      const sdk = path.join(scratch, "sdk");
      const bin = path.join(
        sdk,
        "ndk",
        "1",
        "toolchains",
        "llvm",
        "prebuilt",
        "test",
        "bin",
      );
      fs.mkdirSync(bin, { recursive: true });
      fs.writeFileSync(
        path.join(bin, "llvm-readelf"),
        `#!${process.execPath}\nconsole.log("LOAD 0 0 0 0 0 R E 0x4000");\n`,
        { mode: 0o755 },
      );
      if (withLocalLibraries) {
        const libs = path.join(
          scratch,
          "android",
          "app",
          "build",
          "intermediates",
          "merged_native_libs",
          "arm64-v8a",
        );
        fs.mkdirSync(libs, { recursive: true });
        fs.writeFileSync(path.join(libs, "fixture.so"), "fixture");
      }
      fs.writeFileSync(
        path.join(scratch, "manifest.txt"),
        "No native libraries",
      );
      const archive = path.join(scratch, "empty.aab");
      execFileSync("zip", ["-q", archive, "manifest.txt"], { cwd: scratch });
      const validArchive = path.join(scratch, "valid.aab");
      if (withValidArchive) {
        const libs = path.join(scratch, "base", "lib", "arm64-v8a");
        fs.mkdirSync(libs, { recursive: true });
        fs.writeFileSync(path.join(libs, "fixture.so"), "fixture");
        execFileSync("zip", ["-qr", validArchive, "base"], { cwd: scratch });
      }
      const archives = [
        ...(withValidArchive ? [validArchive] : []),
        ...(withEmptyArchive ? [archive] : []),
      ];
      const result = spawnSync(process.execPath, [script], {
        env: {
          ...process.env,
          ANDROID_SDK_ROOT: sdk,
          ANDROID_HOME: sdk,
          ANDROID_AAB_PATH: archives.join(","),
          TMPDIR: scratch,
        },
        encoding: "utf8",
      });
      expect(result.status).toBe(expectedExit);
      expect(result.stderr).toBe(
        withEmptyArchive
          ? `[ERROR] No native .so files found in supplied AAB: ${archive}\n`
          : "",
      );
      expect(result.stdout).toBe(
        withEmptyArchive
          ? ""
          : `OK: 0 native libraries + 1 from ${validArchive} have LOAD alignment >= 0x4000\n`,
      );
      expect(
        fs
          .readdirSync(scratch)
          .filter((name) => name.startsWith("dnschat-aab-")),
      ).toEqual([]);
    },
  );

  it.each([
    ["LOAD 0x000000 0x000000 0x000000 0x001000 0x001000 R E 0x4000", 0],
    ["LOAD 0x000000 0x000000 0x000000 0x001000 0x001000 R E 0x1000", 1],
    ["There are no program headers in this file.", 1],
    ["LOAD 0x000000 0x000000 0x000000 0x001000 0x001000 R E invalid", 1],
    ["LOAD 0x000000 0x000000 0x000000 0x001000 0x001000 R E 0x4000junk", 1],
    ["LOAD 0x000000 0x000000 0x000000 0x001000 0x001000 R E 0x4001", 1],
    [
      "LOAD 0x000000 0x000000 0x000000 0x001000 0x001000 R E 0x10000000000001",
      1,
    ],
    [
      "LOAD 0x000000 0x000000 0x000000 0x001000 0x001000 R E 0x4000\nLOAD 0x004000 0x004000 0x004000 0x001000 0x001000 RW 0x1000",
      1,
    ],
  ])("checks readelf output %s", (output, expected) => {
    const script = copyScript("check-android-16kb.js");
    const sdk = path.join(scratch, "sdk");
    const bin = path.join(
      sdk,
      "ndk",
      "1",
      "toolchains",
      "llvm",
      "prebuilt",
      "test",
      "bin",
    );
    fs.mkdirSync(bin, { recursive: true });
    fs.writeFileSync(
      path.join(bin, "llvm-readelf"),
      `#!${process.execPath}\nprocess.stdout.write(${JSON.stringify(output)});\n`,
      { mode: 0o755 },
    );
    const libs = path.join(
      scratch,
      "android",
      "app",
      "build",
      "intermediates",
      "merged_native_libs",
      "arm64-v8a",
    );
    fs.mkdirSync(libs, { recursive: true });
    fs.writeFileSync(path.join(libs, "fixture.so"), "fixture");
    const result = spawnSync(process.execPath, [script], {
      env: {
        ...process.env,
        ANDROID_SDK_ROOT: sdk,
        ANDROID_HOME: sdk,
        ANDROID_AAB_PATH: "",
      },
      encoding: "utf8",
    });
    expect(result.status).toBe(expected);
  });
});
