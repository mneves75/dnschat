import fs from "fs";
import path from "path";

type AxeFeature = {
  id: string;
  name: string;
  expected: string;
  primarySelectors: string[];
  coverage: string[];
};

type AxeManifest = {
  version: number;
  runner: string;
  features: AxeFeature[];
};

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "scripts", "e2e-axe-feature-manifest.json");
const docsPath = path.join(root, "docs", "e2e-axe-feature-coverage.md");
const runnerPath = path.join(root, "scripts", "e2e-axe.js");
const sourceRoots = [
  path.join(root, "app"),
  path.join(root, "src"),
];

const readSourceFiles = (directory: string): string[] => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) return readSourceFiles(child);
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [child] : [];
  });
};

const sourceText = sourceRoots
  .flatMap(readSourceFiles)
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

const selectorBackedBySource = (selector: string): boolean => {
  if (sourceText.includes(selector)) return true;

  if (selector.startsWith("language-option-")) {
    return sourceText.includes("language-option-${option.key}") &&
      sourceText.includes(selector.replace("language-option-", ""));
  }

  if (selector.startsWith("settings-dns-option-")) {
    return sourceText.includes("settings-dns-option-${option.value") &&
      sourceText.includes(selector.replace("settings-dns-option-", "").replace(/-/g, "."));
  }

  if (selector.startsWith("settings-force-")) {
    return sourceText.includes("settings-force-${transportKey}") &&
      sourceText.includes(selector.replace("settings-force-", ""));
  }

  if (selector.startsWith("chat-input-")) {
    return sourceText.includes('testID="chat-input"') &&
      sourceText.includes(`\${testID}-${selector.replace("chat-input-", "")}`);
  }

  return false;
};

describe("AXe feature manifest", () => {
  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf8"),
  ) as AxeManifest;
  const docs = fs.readFileSync(docsPath, "utf8");

  it("keeps every declared feature concrete and uniquely identified", () => {
    expect(manifest.version).toBe(1);
    expect(manifest.runner).toBe("scripts/e2e-axe.js");
    expect(fs.existsSync(runnerPath)).toBe(true);

    const ids = manifest.features.map((feature) => feature.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "F-APP-001",
      "F-APP-002",
      "F-CHAT-001",
      "F-DNS-001",
      "F-SET-001",
      "F-LOG-001",
      "F-UI-001",
      "F-USER-001",
      "F-ERR-001",
      "F-SYS-001",
    ]);

    for (const feature of manifest.features) {
      expect(feature.name.trim().length).toBeGreaterThan(0);
      expect(feature.expected.trim().length).toBeGreaterThan(20);
      expect(feature.primarySelectors.length).toBeGreaterThan(0);
      expect(feature.coverage.length).toBeGreaterThan(0);
    }
  });

  it("keeps the human coverage checklist synchronized with the manifest", () => {
    for (const feature of manifest.features) {
      expect(docs).toContain(feature.id);
      expect(docs).toContain(feature.name);
      for (const selector of feature.primarySelectors) {
        expect(docs).toContain(selector);
      }
    }
  });

  it("backs every manifest selector with an app source selector", () => {
    for (const feature of manifest.features) {
      for (const selector of feature.primarySelectors) {
        expect(selectorBackedBySource(selector)).toBe(true);
      }
    }
  });
});
