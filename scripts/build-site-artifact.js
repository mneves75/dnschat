#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const siteDir = path.join(repoRoot, "site");
const defaultOutputDir = path.join(repoRoot, ".site-dist");

const generatedAssets = Object.freeze({
  "assets/posters/dnschat-launch-poster.png": path.join(
    repoRoot,
    "marketing/video/out/dnschat-launch-poster.png",
  ),
  "assets/posters/dnschat-tutorial-poster.png": path.join(
    repoRoot,
    "marketing/video/out/dnschat-tutorial-poster.png",
  ),
  "assets/videos/dnschat-launch.mp4": path.join(
    repoRoot,
    "marketing/video/out/dnschat-launch.mp4",
  ),
  "assets/videos/dnschat-tutorial.mp4": path.join(
    repoRoot,
    "marketing/video/out/dnschat-tutorial.mp4",
  ),
});

function extractLocalReferences(html) {
  const references = new Set();
  const attributePattern = /\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi;

  for (const match of html.matchAll(attributePattern)) {
    const reference = match[1].split(/[?#]/, 1)[0];
    if (
      reference &&
      !reference.startsWith("#") &&
      !reference.startsWith("//") &&
      !/^[a-z][a-z\d+.-]*:/i.test(reference)
    ) {
      references.add(reference.replace(/^\//, ""));
    }
  }

  return [...references].sort();
}

function findMissingLocalReferences(html, artifactRoot) {
  const root = path.resolve(artifactRoot);

  return extractLocalReferences(html).filter((reference) => {
    const target = path.resolve(root, reference);
    return !target.startsWith(`${root}${path.sep}`) || !fs.existsSync(target);
  });
}

function findUncoveredSourceReferences(html) {
  return extractLocalReferences(html).filter((reference) => {
    return (
      !fs.existsSync(path.join(siteDir, reference)) &&
      !Object.hasOwn(generatedAssets, reference)
    );
  });
}

function parseOutputDirectory(argv) {
  const outputFlag = argv.indexOf("--output");
  if (outputFlag === -1) {
    return defaultOutputDir;
  }
  if (!argv[outputFlag + 1]) {
    throw new Error("--output requires a directory");
  }
  return path.resolve(repoRoot, argv[outputFlag + 1]);
}

function assertSafeOutputDirectory(outputDir) {
  const resolved = path.resolve(outputDir);
  if (resolved !== defaultOutputDir) {
    throw new Error(`Refusing unsafe site artifact directory: ${resolved}`);
  }
}

function buildSiteArtifact(outputDir = defaultOutputDir) {
  const resolvedOutput = path.resolve(outputDir);
  assertSafeOutputDirectory(resolvedOutput);

  const html = fs.readFileSync(path.join(siteDir, "index.html"), "utf8");
  const uncovered = findUncoveredSourceReferences(html);
  if (uncovered.length > 0) {
    throw new Error(`Uncovered local site references: ${uncovered.join(", ")}`);
  }

  for (const [artifactPath, sourcePath] of Object.entries(generatedAssets)) {
    if (!fs.existsSync(sourcePath)) {
      throw new Error(
        `Missing generated asset for ${artifactPath}: ${path.relative(repoRoot, sourcePath)}`,
      );
    }
  }

  fs.rmSync(resolvedOutput, { recursive: true, force: true });
  fs.cpSync(siteDir, resolvedOutput, { recursive: true });

  for (const [artifactPath, sourcePath] of Object.entries(generatedAssets)) {
    const targetPath = path.join(resolvedOutput, artifactPath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }

  const stagedHtml = fs.readFileSync(
    path.join(resolvedOutput, "index.html"),
    "utf8",
  );
  const missing = findMissingLocalReferences(stagedHtml, resolvedOutput);
  if (missing.length > 0) {
    throw new Error(`Missing local site references: ${missing.join(", ")}`);
  }

  return resolvedOutput;
}

if (require.main === module) {
  const outputDir = buildSiteArtifact(
    parseOutputDirectory(process.argv.slice(2)),
  );
  console.log(`Verified site artifact: ${path.relative(repoRoot, outputDir)}`);
}

module.exports = {
  buildSiteArtifact,
  extractLocalReferences,
  findMissingLocalReferences,
  findUncoveredSourceReferences,
  generatedAssets,
  assertSafeOutputDirectory,
};
