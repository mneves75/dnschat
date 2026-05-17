import fs from "node:fs";

const MAIN_MANIFEST = "android/app/src/main/AndroidManifest.xml";
const DEBUG_OPTIMIZED_MANIFEST = "android/app/src/debugOptimized/AndroidManifest.xml";

function read(path: string): string {
  return fs.readFileSync(path, "utf8");
}

function extractXmlResourceRefs(manifest: string): string[] {
  const refs = manifest.matchAll(/@xml\/([A-Za-z0-9_]+)/g);
  return Array.from(refs, (match) => match[1]).filter(
    (name): name is string => typeof name === "string" && name.length > 0,
  );
}

describe("android manifest policy", () => {
  it("does not request stale broad release permissions", () => {
    const manifest = read(MAIN_MANIFEST);
    const forbidden = [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.SYSTEM_ALERT_WINDOW",
    ];

    const offenders = forbidden.filter((permission) =>
      manifest.includes(permission),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps referenced XML resources present", () => {
    const manifest = read(MAIN_MANIFEST);
    const missing = extractXmlResourceRefs(manifest)
      .map((name) => `android/app/src/main/res/xml/${name}.xml`)
      .filter((path) => !fs.existsSync(path));

    expect(missing).toEqual([]);
  });

  it("disables app backup for local encrypted chat history", () => {
    const manifest = read(MAIN_MANIFEST);
    expect(manifest).toContain('android:allowBackup="false"');
  });

  it("keeps debugOptimized free of release-risk permissions and cleartext overrides", () => {
    const manifest = read(DEBUG_OPTIMIZED_MANIFEST);
    expect(manifest).not.toContain("android.permission.SYSTEM_ALERT_WINDOW");
    expect(manifest).not.toContain("android:usesCleartextTraffic");
  });

  it("excludes SecureStore from Android backup and device transfer", () => {
    const backupRules = read(
      "android/app/src/main/res/xml/secure_store_backup_rules.xml",
    );
    const extractionRules = read(
      "android/app/src/main/res/xml/secure_store_data_extraction_rules.xml",
    );

    expect(backupRules).toContain('domain="sharedpref" path="SecureStore"');
    expect(extractionRules).toContain('domain="sharedpref" path="SecureStore"');
    expect(extractionRules).toContain("<cloud-backup>");
    expect(extractionRules).toContain("<device-transfer>");
  });
});
