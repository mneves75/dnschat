import { chromium } from "playwright";
import TurndownService from "turndown";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import fs from "fs/promises";
import path from "path";
import sanitize from "sanitize-filename";

const startUrl =
  process.argv[2] ||
  "https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass";
const maxDepth = Number(process.argv[3] || 2);
const outDir = process.argv[4] || "out";

function normalizeUrl(href, base) {
  try {
    const u = new URL(href, base);
    u.hash = "";
    // Limit scope to Apple Developer docs/videos to keep it tidy
    const okHost = u.hostname === "developer.apple.com";
    const okPath =
      u.pathname.startsWith("/documentation") ||
      u.pathname.startsWith("/videos");
    return okHost && okPath ? u.toString() : null;
  } catch {
    return null;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function fileNameFor(urlStr) {
  const { pathname } = new URL(urlStr);
  const base = pathname.replace(/\/+/g, "_").replace(/^_+|_+$/g, "") || "index";
  return sanitize(base) + ".md";
}

async function extractAndSave(page, urlStr, turndown) {
  await page.goto(urlStr, { waitUntil: "networkidle", timeout: 60000 });

  // Try to wait for meaningful content
  await page
    .waitForSelector("main, article, body", { timeout: 15000 })
    .catch(() => {});

  const html = await page.evaluate(() => document.documentElement.outerHTML);
  const dom = new JSDOM(html, { url: urlStr });
  const reader = new Readability(dom.window.document);
  const parsed = reader.parse();

  const title = (
    parsed?.title ||
    dom.window.document.title ||
    "Untitled"
  ).trim();
  const contentHtml =
    parsed?.content ||
    dom.window.document.querySelector("main, article")?.outerHTML ||
    dom.window.document.body?.outerHTML ||
    "";

  const mdBody = turndown.turndown(contentHtml);
  const header = `# ${title}\n\n> Source: ${urlStr}\n> Fetched: ${new Date().toISOString()}\n\n`;
  const md = header + mdBody;

  const fname = fileNameFor(urlStr);
  await ensureDir(outDir);
  await fs.writeFile(path.join(outDir, fname), md, "utf8");

  // Collect links for crawling
  const links = Array.from(dom.window.document.querySelectorAll("a[href]"))
    .map((a) => a.getAttribute("href"))
    .map((h) => normalizeUrl(h, urlStr))
    .filter(Boolean);

  return Array.from(new Set(links));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "en-US",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  const queue = [{ url: startUrl, depth: 0 }];
  const seen = new Set();

  while (queue.length) {
    const { url, depth } = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    console.log(`→ [${depth}] ${url}`);
    let nextLinks = [];
    try {
      nextLinks = await extractAndSave(page, url, turndown);
    } catch (e) {
      console.warn(`   ! Failed ${url}: ${e.message}`);
      continue;
    }
    if (depth < maxDepth) {
      for (const nxt of nextLinks) {
        if (!seen.has(nxt)) queue.push({ url: nxt, depth: depth + 1 });
      }
    }
  }

  await browser.close();
  console.log(`✔ Done. Markdown saved in: ${path.resolve(outDir)}`);
})();
