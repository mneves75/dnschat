import { execFileSync } from "node:child_process";
import fs from "node:fs";
import nodePath from "node:path";

function read(path: string): string {
  return fs.readFileSync(path, "utf8");
}

function findMutableActionRefs(content: string): string[] {
  return [...content.matchAll(/^\s*uses:\s*([^\s#]+)@([^\s#]+)/gm)]
    .filter((match) => !/^[a-f0-9]{40}$/.test(match[2] ?? ""))
    .map((match) => `${match[1]}@${match[2]}`);
}

describe("repo policy: CI configuration exists and matches spec", () => {
  it("pins every GitHub Action to an immutable commit SHA", () => {
    expect(findMutableActionRefs("uses: actions/checkout@v6")).toEqual([
      "actions/checkout@v6",
    ]);
    expect(
      findMutableActionRefs(`uses: actions/checkout@${"a".repeat(40)} # v6`),
    ).toEqual([]);

    const offenders = fs
      .readdirSync(".github/workflows")
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .flatMap((file) =>
        findMutableActionRefs(read(`.github/workflows/${file}`)).map(
          (reference) => `${file}: ${reference}`,
        ),
      );

    expect(offenders).toEqual([]);
  });

  it("discovers every spec file that exists on disk", () => {
    // Guards the regression that removing --passWithNoTests was meant to catch:
    // a broken testMatch turns a green run into a run of nothing. A count floor
    // cannot do this job - the previous "at least 60" sat 51 files below the
    // real total, so most of the suite could vanish before it fired. Comparing
    // against the files actually present has no dead zone and needs no upkeep.
    const output = execFileSync(
      process.execPath,
      [require.resolve("jest/bin/jest"), "--listTests", "--json"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const discovered = new Set(
      (JSON.parse(output) as string[]).map((absolute) =>
        nodePath.relative(process.cwd(), absolute),
      ),
    );

    const onDisk = fs
      .readdirSync("__tests__")
      .filter((entry) => /\.spec\.(ts|tsx|js)$/.test(entry))
      .map((entry) => nodePath.join("__tests__", entry));

    expect(onDisk.length).toBeGreaterThan(0);
    expect(onDisk.filter((file) => !discovered.has(file))).toEqual([]);
  });
});
