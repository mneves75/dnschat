const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

describe("brag renderer asset server", () => {
  it.each([
    ["encoded parent escape", "/%2e%2e%2fwork-sibling%2fprivate.txt", 404],
    ["malformed percent encoding", "/%ZZ", 400],
  ])(
    "rejects %s and continues serving assets",
    (_label, requestPath, statusCode) => {
      const fixture = fs.mkdtempSync(
        path.join(os.tmpdir(), "dnschat-render-http-"),
      );
      const work = path.join(fixture, "work");
      const sibling = path.join(fixture, "work-sibling");
      fs.mkdirSync(work);
      fs.mkdirSync(sibling);
      fs.writeFileSync(path.join(work, "index.html"), "allowed asset");
      fs.writeFileSync(
        path.join(sibling, "private.txt"),
        "outside fixture asset",
      );
      fs.copyFileSync(
        "brag-output/work/render.mjs",
        path.join(work, "render.mjs"),
      );
      const fakeBrowser = path.join(fixture, "fake-browser.mjs");
      fs.writeFileSync(
        fakeBrowser,
        `
      import http from "node:http";
      const request = (url, requestPath) => new Promise((resolve, reject) => {
        const req = http.get(new URL(url).origin + requestPath, (res) => {
          let body = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => { body += chunk; });
          res.on("end", () => resolve({ status: res.statusCode, body }));
        });
        req.on("error", reject);
      });
      export const chromium = {
        launch: async () => ({
          close: async () => {},
          newPage: async () => ({
            on: () => {},
            goto: async (url) => {
              const results = [];
              results.push(await request(url, "/index.html"));
              results.push(await request(url, process.env.RENDER_TEST_PATH));
              results.push(await request(url, "/index.html"));
              console.log("HTTP_RESULTS " + JSON.stringify(results));
            },
            waitForFunction: async () => {},
            evaluate: async () => {},
            context: () => ({ newCDPSession: async () => ({
              send: async () => ({ data: "" }),
            }) }),
          }),
        }),
      };
    `,
      );

      try {
        const result = spawnSync(
          process.execPath,
          [path.join(work, "render.mjs"), "stills", "0"],
          {
            encoding: "utf8",
            timeout: 10_000,
            env: {
              ...process.env,
              PLAYWRIGHT_MODULE: pathToFileURL(fakeBrowser).href,
              RENDER_TEST_PATH: requestPath,
            },
          },
        );
        expect({ status: result.status, stderr: result.stderr }).toEqual({
          status: 0,
          stderr: "",
        });
        const output = result.stdout
          .split("\n")
          .find((line) => line.startsWith("HTTP_RESULTS "));
        expect(output).toBeDefined();
        expect(JSON.parse(output.slice("HTTP_RESULTS ".length))).toEqual([
          { status: 200, body: "allowed asset" },
          { status: statusCode, body: "" },
          { status: 200, body: "allowed asset" },
        ]);
      } finally {
        fs.rmSync(fixture, { recursive: true, force: true });
      }
    },
  );
});
