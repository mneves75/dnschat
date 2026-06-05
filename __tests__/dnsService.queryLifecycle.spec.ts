import fs from "node:fs";

/**
 * Regression coverage for the query-lifecycle leak fix.
 *
 * DNSLogService.startQuery() registers the raw prompt + chat title in the
 * in-memory `sensitiveValuesByQueryId` map. Before the fix, queryLLM() only
 * called endQuery() on the success or all-servers-failed paths; an early throw
 * from createQueryContext()/addLog() (e.g. an over-length message) escaped
 * without ever finalizing the query, leaking those sensitive values forever.
 *
 * The fix wraps the post-startQuery body in try/finally and finalizes the query
 * in `finally`. endQuery() is a no-op once the query is already finalized, so
 * the guard only fires on the leaked path. This is a source-structure guard
 * (hermetic, no native stack) matching the repo's policy-test idiom.
 */
describe("DNSService.queryLLM lifecycle cleanup", () => {
  const source = fs.readFileSync("src/services/dnsService.ts", "utf8");

  it("registers the query then guards finalization in try/finally", () => {
    const startIndex = source.indexOf(
      "const queryId = DNSLogService.startQuery(message, logContext);",
    );
    expect(startIndex).toBeGreaterThan(-1);

    const tryIndex = source.indexOf("try {", startIndex);
    const finallyIndex = source.indexOf("} finally {", startIndex);
    expect(tryIndex).toBeGreaterThan(startIndex);
    expect(finallyIndex).toBeGreaterThan(tryIndex);
  });

  it("finalizes an abandoned query in the finally block to drop sensitive values", () => {
    const finallyIndex = source.indexOf("} finally {");
    const finallyBlock = source.slice(finallyIndex, finallyIndex + 600);
    expect(finallyBlock).toContain("DNSLogService.endQuery(queryId, false)");
  });
});

/**
 * DNSLogService must clear the sensitive-value map on every lifecycle exit so a
 * raw prompt/title can never outlive the query that produced it.
 */
describe("DNSLogService sensitive-value lifecycle", () => {
  const source = fs.readFileSync("src/services/dnsLogService.ts", "utf8");

  it("drops the sensitive-value entry on endQuery, deleteLog, and clearLogs", () => {
    const deletions = source.match(
      /this\.sensitiveValuesByQueryId\.delete\(/g,
    );
    expect(deletions?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(source).toContain("this.sensitiveValuesByQueryId.clear()");
  });

  it("redacts known DNS queries without lookbehind and with RFC-1035 label bounds", () => {
    // The boundary group + trailing negative class replace the old `\b` form to
    // avoid over-redacting malformed fragments; no lookbehind (Hermes safety).
    expect(source).not.toContain("(?<");
    expect(source).toContain("[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.(?:llm\\.pieter\\.com|ch\\.at)");
  });
});
