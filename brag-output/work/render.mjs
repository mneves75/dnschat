// Uso:
//   node render.mjs stills 0.5,1.2,...        → work/stills/t-<t>.png
//   node render.mjs video <out.mp4> [fps] [sub] [workers]
// Cada quadro é função pura do tempo: window.__seek(t) e captura.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
// Playwright is not a repo dependency: point PLAYWRIGHT_MODULE at an installed playwright/index.mjs,
// and optionally CHROMIUM_PATH at a headless Chromium binary.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};
const server = http.createServer((req, res) => {
  const p = path.join(
    ROOT,
    decodeURIComponent(new URL(req.url, "http://x").pathname),
  );
  if (
    !p.startsWith(ROOT) ||
    !fs.existsSync(p) ||
    fs.statSync(p).isDirectory()
  ) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[path.extname(p)] ?? "application/octet-stream",
  });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const URL0 = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: [
    "--force-color-profile=srgb",
    "--disable-lcd-text",
    "--font-render-hinting=none",
  ],
});
async function openPage() {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => {
    console.error("PAGEERROR", e.message);
    process.exitCode = 2;
  });
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      console.error("CONSOLE", m.text());
  });
  await page.goto(URL0);
  await page.waitForFunction(() => window.__ready === true, null, {
    timeout: 30000,
  });
  const cdp = await page.context().newCDPSession(page);
  const shot = async (t) => {
    await page.evaluate(
      (tt) =>
        new Promise((r) => {
          window.__seek(tt);
          requestAnimationFrame(() => requestAnimationFrame(r));
        }),
      t,
    );
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "png",
      optimizeForSpeed: true,
    });
    return Buffer.from(data, "base64");
  };
  return { page, shot };
}

const [mode, arg, fpsArg, subArg, workersArg] = process.argv.slice(2);
if (mode === "stills") {
  const dir = path.join(ROOT, "stills");
  fs.mkdirSync(dir, { recursive: true });
  const { shot } = await openPage();
  for (const t of arg.split(",").map(Number))
    fs.writeFileSync(path.join(dir, `t-${t.toFixed(2)}.png`), await shot(t));
  console.log("stills ok");
} else if (mode === "video") {
  const fps = Number(fpsArg ?? 60),
    sub = Number(subArg ?? 1),
    W = Number(workersArg ?? 4);
  const dur = await (await openPage()).page.evaluate(() => window.__duration);
  const total = Math.round(dur * fps);
  const segDir = path.join(ROOT, "segs");
  fs.mkdirSync(segDir, { recursive: true });
  // Obturador de 180°: sub amostras espalhadas em meio quadro, média via tmix.
  const vf =
    sub > 1
      ? `tmix=frames=${sub},select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/(${fps}*TB)`
      : "null";
  const t0 = Date.now();
  await Promise.all(
    Array.from({ length: W }, async (_, w) => {
      const a = Math.floor((total * w) / W),
        b = Math.floor((total * (w + 1)) / W);
      const { shot } = await openPage();
      const out = path.join(segDir, `seg${w}.mp4`);
      const ff = spawn(
        "ffmpeg",
        [
          "-y",
          "-loglevel",
          "error",
          "-f",
          "image2pipe",
          "-c:v",
          "png",
          "-framerate",
          String(fps * sub),
          "-i",
          "-",
          "-vf",
          vf,
          "-r",
          String(fps),
          "-c:v",
          "libx264",
          "-preset",
          "medium",
          "-crf",
          "10",
          "-pix_fmt",
          "yuv420p",
          "-color_primaries",
          "bt709",
          "-color_trc",
          "bt709",
          "-colorspace",
          "bt709",
          out,
        ],
        { stdio: ["pipe", "inherit", "inherit"] },
      );
      for (let f = a; f < b; f++) {
        for (let s = 0; s < sub; s++) {
          const t = (f + (sub > 1 ? (s / sub - 0.5) * 0.5 : 0)) / fps; // −¼ a +¼ de quadro
          const buf = await shot(Math.max(0, t));
          if (!ff.stdin.write(buf))
            await new Promise((r) => ff.stdin.once("drain", r));
        }
        if (w === 0 && f % 30 === 0)
          console.log(
            `w0 ${f - a}/${b - a} ${((Date.now() - t0) / 1000).toFixed(0)}s`,
          );
      }
      ff.stdin.end();
      await new Promise((r, j) =>
        ff.on("close", (c) => (c ? j(new Error("ffmpeg " + c)) : r())),
      );
    }),
  );
  fs.writeFileSync(
    path.join(segDir, "list.txt"),
    Array.from({ length: W }, (_, w) => `file 'seg${w}.mp4'`).join("\n"),
  );
  await new Promise((r, j) =>
    spawn(
      "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        path.join(segDir, "list.txt"),
        "-c",
        "copy",
        arg,
      ],
      { stdio: "inherit" },
    ).on("close", (c) => (c ? j(new Error("concat")) : r())),
  );
  console.log(`video ok ${arg} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
server.close();
