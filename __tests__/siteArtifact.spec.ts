import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const {
  extractLocalReferences,
  findMissingLocalReferences,
  findUncoveredSourceReferences,
  generatedAssets,
  assertSafeOutputDirectory,
} = require("../scripts/build-site-artifact") as {
  extractLocalReferences: (html: string) => string[];
  findMissingLocalReferences: (html: string, artifactRoot: string) => string[];
  findUncoveredSourceReferences: (html: string) => string[];
  generatedAssets: Record<string, string>;
  assertSafeOutputDirectory: (outputDir: string) => void;
};

describe("static site artifact contract", () => {
  const siteHtml = fs.readFileSync("site/index.html", "utf8");

  it("keeps the React Doctor exception tied to the HTML script entrypoint", () => {
    expect(siteHtml).toContain('<script src="script.js" defer></script>');

    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      reactDoctor?: { ignore?: { overrides?: unknown[] } };
    };
    expect(packageJson.reactDoctor?.ignore?.overrides).toEqual([
      {
        files: ["site/script.js"],
        rules: ["deslop/unused-file"],
      },
    ]);
  });

  it("covers every local src, href, and poster with a static or generated asset", () => {
    expect(findUncoveredSourceReferences(siteHtml)).toEqual([]);

    const localReferences = extractLocalReferences(siteHtml);
    expect(localReferences).toContain("assets/videos/dnschat-launch.mp4");
    expect(localReferences).toContain("assets/videos/dnschat-tutorial.mp4");
    expect(Object.keys(generatedAssets).sort()).toEqual([
      "assets/posters/dnschat-launch-poster.png",
      "assets/posters/dnschat-tutorial-poster.png",
      "assets/videos/dnschat-launch.mp4",
      "assets/videos/dnschat-tutorial.mp4",
    ]);

    const videoPackage = JSON.parse(
      fs.readFileSync("marketing/video/package.json", "utf8"),
    ) as { scripts?: Record<string, string> };
    const renderScripts = Object.values(videoPackage.scripts ?? {}).join("\n");
    for (const sourcePath of Object.values(generatedAssets)) {
      const relativeOutput = path.relative("marketing/video", sourcePath);
      expect(renderScripts).toContain(relativeOutput);
    }
  });

  it("fails when a local reference is absent from an artifact", () => {
    expect(
      findMissingLocalReferences(
        '<img src="assets/missing-positive-control.png">',
        "site",
      ),
    ).toEqual(["assets/missing-positive-control.png"]);

    expect(
      findMissingLocalReferences(
        '<video poster="assets/missing-poster-positive-control.png"></video>',
        "site",
      ),
    ).toEqual(["assets/missing-poster-positive-control.png"]);
  });

  it("restricts destructive artifact replacement to the dedicated output", () => {
    expect(() => assertSafeOutputDirectory(".site-dist")).not.toThrow();
    expect(() =>
      assertSafeOutputDirectory(
        path.join(process.cwd(), "..", "unrelated-site"),
      ),
    ).toThrow(/Refusing unsafe site artifact directory/);
    expect(() => assertSafeOutputDirectory("site")).toThrow(
      /Refusing unsafe site artifact directory/,
    );
  });

  it("deploys only by explicit dispatch and uploads the verified artifact", () => {
    const workflow = fs.readFileSync(".github/workflows/pages.yml", "utf8");

    expect(workflow).toMatch(/^\s*workflow_dispatch:\s*$/m);
    expect(workflow).not.toMatch(/^\s*push:\s*$/m);
    expect(workflow).toContain("pnpm run verify:video");
    expect(workflow).toContain("pnpm --filter @dnschat/video run render");
    expect(workflow).toContain("pnpm --filter @dnschat/video run stills");
    expect(workflow).toContain(
      "node scripts/build-site-artifact.js --output .site-dist",
    );
    expect(workflow).not.toContain("cache: pnpm");
    expect(workflow).toMatch(/path:\s*\.site-dist/);
  });

  it("does not claim frame protection from a meta-delivered CSP", () => {
    expect(siteHtml).toContain('http-equiv="Content-Security-Policy"');
    expect(siteHtml).not.toContain("frame-ancestors");

    const securityPolicy = fs.readFileSync("SECURITY.md", "utf8");
    expect(securityPolicy).toMatch(
      /The CSP\s+standard ignores [`']?frame-ancestors[`']? in a meta element/,
    );
  });

  it("keeps documented React Native versions aligned with package.json", () => {
    const version = (
      JSON.parse(fs.readFileSync("package.json", "utf8")) as {
        dependencies: { "react-native": string };
      }
    ).dependencies["react-native"];

    for (const file of [
      "AGENTS.md",
      "README.md",
      "docs/INSTALL.md",
      "docs/architecture/SYSTEM-ARCHITECTURE.md",
    ]) {
      const content = fs.readFileSync(file, "utf8");
      expect(content).toContain(version);
      expect(content).not.toContain("0.86.0");
    }
  });

  it("switches video caption tracks to the selected locale", () => {
    const script = fs.readFileSync("site/script.js", "utf8");
    const buttonListeners = new Map<string, () => void>();

    const makeTrack = (language: string, isDefault: boolean) => ({
      default: isDefault,
      srclang: language,
      track: { mode: isDefault ? "showing" : "disabled" },
      getAttribute: (name: string) => (name === "srclang" ? language : null),
    });

    const tracks = [
      makeTrack("pt-BR", true),
      makeTrack("en-US", false),
      makeTrack("pt-BR", true),
      makeTrack("en-US", false),
    ];
    const videos = [
      { querySelectorAll: () => tracks.slice(0, 2) },
      { querySelectorAll: () => tracks.slice(2) },
    ];
    const buttons = ["pt-BR", "en-US"].map((language) => ({
      dataset: { language },
      setAttribute: () => undefined,
      addEventListener: (_event: string, listener: () => void) => {
        buttonListeners.set(language, listener);
      },
    }));
    const document = {
      documentElement: { lang: "pt-BR" },
      title: "",
      querySelector: () => ({ setAttribute: () => undefined }),
      querySelectorAll: (selector: string) => {
        if (selector === "[data-language]") return buttons;
        if (selector === "video") return videos;
        return [];
      },
    };

    const context = vm.createContext({ document, module: { exports: {} } });
    vm.runInContext(script, context);

    buttonListeners.get("en-US")?.();

    expect(document.documentElement.lang).toBe("en-US");
    expect(tracks.map((track) => track.default)).toEqual([
      false,
      true,
      false,
      true,
    ]);
    expect(tracks.map((track) => track.track.mode)).toEqual([
      "disabled",
      "showing",
      "disabled",
      "showing",
    ]);
  });
});
