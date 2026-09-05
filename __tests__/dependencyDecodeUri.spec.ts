import { spawnSync } from "node:child_process";

describe("query-string fixed decoder integration", () => {
  it("runs the installed consumer through Metro without recursive malformed-input decoding", () => {
    const probe = String.raw`
      const assert = require('node:assert/strict');
      const fs = require('node:fs');
      const vm = require('node:vm');
      const { createRequire } = require('node:module');
      const { getDefaultConfig } = require('@expo/metro-config');
      const worker = require('metro-transform-worker');
      const root = process.cwd();
      const config = getDefaultConfig(root);
      const consumerPath = require.resolve('query-string');
      const consumerRequire = createRequire(consumerPath);
      const decoderPath = consumerRequire.resolve('decode-uri-component');
      let decodeCalls = 0;

      async function load(filename, dependencies = {}) {
        const result = await worker.transform(config.transformer, root, filename,
          fs.readFileSync(filename), {
            dev: false, minify: false, platform: 'ios', type: 'module',
            inlineRequires: false, experimentalImportSupport: true,
            unstable_transformProfile: 'hermes-stable',
            customTransformOptions: { engine: 'hermes', isServer: false },
          });
        const names = result.dependencies.map(dependency => dependency.name);
        let factory;
        vm.runInNewContext(result.output[0].data.code, {
          __d: value => { factory = value; },
          decodeURIComponent: value => { decodeCalls++; return decodeURIComponent(value); },
        });
        const localRequire = createRequire(filename);
        const metroRequire = id => dependencies[names[id]] ?? localRequire(names[id]);
        const importDefault = id => {
          const value = metroRequire(id);
          return value && value.__esModule ? value.default : value;
        };
        const module = { exports: {} };
        factory(globalThis, metroRequire, importDefault, metroRequire,
          module, module.exports, names.map((_, index) => index));
        return module.exports;
      }

      (async () => {
        const decoder = await load(decoderPath);
        const query = await load(consumerPath, { 'decode-uri-component': decoder });
        assert.equal(query.parse('name=hello+world').name, 'hello world');
        assert.equal(query.parse('name=a%C3%A7%C3%A3o').name, 'ação');
        assert.equal(JSON.stringify(query.parse('x=one&x=two').x), '["one","two"]');
        assert.equal(query.stringify({ name: 'hello world' }), 'name=hello%20world');
        assert.equal(query.parse('x=%C2').x, '\uFFFD');
        const malformed = '%FF'.repeat(16);
        decodeCalls = 0;
        assert.equal(query.parse('x=' + malformed).x, malformed);
        assert.ok(decodeCalls > 0, 'decoder positive control did not execute');
        assert.ok(decodeCalls <= malformed.length + 8,
          'malformed input caused recursive decode work: ' + decodeCalls);
        console.log('PASS Metro consumer/decoder export contract and bounded decoding');
      })().catch(error => { console.error(error); process.exitCode = 1; });
    `;
    const result = spawnSync(process.execPath, ["-e", probe], {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 30_000,
    });
    expect({ status: result.status, stderr: result.stderr }).toEqual({
      status: 0,
      stderr: "",
    });
    expect(result.stdout).toContain(
      "PASS Metro consumer/decoder export contract and bounded decoding",
    );
  }, 40_000);
});
