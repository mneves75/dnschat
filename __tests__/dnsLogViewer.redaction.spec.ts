import fs from "node:fs";

describe("DNS log UI redaction policy", () => {
  it("does not render stored query or response payload fields directly", () => {
    const viewer = fs.readFileSync("src/components/DNSLogViewer.tsx", "utf8");
    const logsScreen = fs.readFileSync("src/navigation/screens/Logs.tsx", "utf8");

    expect(viewer).not.toContain("{log.chatTitle || log.query}");
    expect(viewer).not.toContain("{log.response}");
    expect(viewer).toContain('t("components.dnsLogViewer.redactedTitle")');
    expect(viewer).toContain('t("components.dnsLogViewer.redactedResponse")');

    expect(logsScreen).not.toContain("{item.chatTitle || item.query");
    expect(logsScreen).not.toContain("{item.response ||");
    expect(logsScreen).toContain('t("screen.logs.labels.redactedQuery")');
    expect(logsScreen).toContain('t("screen.logs.labels.redactedResponse")');
  });
});
