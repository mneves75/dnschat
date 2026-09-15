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

// Maps each top-level job to its `run:` commands in order. The workflow keeps
// jobs at two-space indentation and single-line run commands; a job the helper
// cannot see fails the assertions below instead of passing vacuously.
function runCommandsByJob(content: string): Map<string, string[]> {
  const jobs = new Map<string, string[]>();
  let inJobs = false;
  let current: string[] | null = null;
  for (const line of content.split("\n")) {
    if (/^jobs:\s*$/.test(line)) {
      inJobs = true;
      continue;
    }
    if (!inJobs) continue;
    const job = /^ {2}([\w-]+):\s*$/.exec(line);
    if (job) {
      current = [];
      jobs.set(job[1]!, current);
      continue;
    }
    const run = /^\s+(?:-\s+)?run:\s*(\S.*)$/.exec(line);
    if (run && current) current.push(run[1]!.trim());
  }
  return jobs;
}

const DRIFTING_GATES = ["pnpm audit", "pnpm run verify:expo-doctor"];

function driftGatesBlockingTests(content: string): string[] {
  const testJob = runCommandsByJob(content).get("test") ?? [];
  const testIndex = testJob.findIndex((command) =>
    command.startsWith("pnpm run test"),
  );
  if (testIndex === -1) return ["test job has no unit test step"];
  return testJob
    .slice(0, testIndex)
    .filter((command) => DRIFTING_GATES.includes(command));
}

describe("repo policy: CI configuration exists and matches spec", () => {
  it("keeps drifting network gates from skipping lint and unit tests", () => {
    // Positive control: the pre-4.4.5 order, where a new advisory or an Expo
    // API hiccup stopped the job before Lint and Test ran.
    const blocking = [
      "jobs:",
      "  test:",
      "    steps:",
      "      - run: pnpm audit",
      "      - run: pnpm run verify:expo-doctor",
      "      - run: pnpm run test --bail",
    ].join("\n");
    expect(driftGatesBlockingTests(blocking)).toEqual(DRIFTING_GATES);

    const workflow = read(".github/workflows/ci.yml");
    expect(driftGatesBlockingTests(workflow)).toEqual([]);

    // The gates still run, in a job of their own.
    const allCommands = [...runCommandsByJob(workflow).values()].flat();
    for (const gate of DRIFTING_GATES) {
      expect(allCommands).toContain(gate);
    }
  });

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

    // Recursive, matching the testMatch glob: a spec added in a subdirectory
    // must be covered too, or this gate reintroduces the blind spot it exists
    // to remove. The dns-native workspace has its own jest config and is
    // deliberately outside this root config's discovery.
    const onDisk = fs
      .readdirSync("__tests__", { recursive: true, encoding: "utf8" })
      .filter((entry) => /\.spec\.(ts|tsx|js)$/.test(entry))
      .map((entry) => nodePath.join("__tests__", entry));

    expect(onDisk.length).toBeGreaterThan(0);
    expect(onDisk.filter((file) => !discovered.has(file))).toEqual([]);
  });
});
