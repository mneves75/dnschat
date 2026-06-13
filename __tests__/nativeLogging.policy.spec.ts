import fs from "node:fs";

const nativeRuntimeFiles = [
  "modules/dns-native/android/DNSResolver.java",
  "modules/dns-native/android/RNDNSModule.java",
  "android/app/src/main/java/com/dnsnative/DNSResolver.java",
  "android/app/src/main/java/com/dnsnative/RNDNSModule.java",
  "modules/dns-native/ios/DNSResolver.swift",
  "ios/DNSNative/DNSResolver.swift",
];

function loggedPayloadExpressions(source: string): string[] {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /(Log\.[dwe]\(|NSLog\()/.test(line))
    .filter((line) => /\b(queryName|message|txtRecords|response|label)\b/.test(line));
}

describe("native runtime logging policy", () => {
  it("does not log DNS prompt, query-name, TXT response, or label payloads", () => {
    const offenders = nativeRuntimeFiles.flatMap((file) => {
      const source = fs.readFileSync(file, "utf8");
      return loggedPayloadExpressions(source).map((line) => `${file}: ${line}`);
    });

    expect(offenders).toEqual([]);
  });
});
