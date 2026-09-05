import { execFileSync } from "node:child_process";
import fs from "node:fs";

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

  it("discovers at least 60 test files", () => {
    const output = execFileSync(
      process.execPath,
      [require.resolve("jest/bin/jest"), "--listTests", "--json"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const testPaths = JSON.parse(output) as string[];

    expect(testPaths.length).toBeGreaterThanOrEqual(60);
  });
});
