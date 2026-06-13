import fs from "fs";
import path from "path";

interface DoctorOverride {
  files: string[];
  rules: string[];
}

interface DoctorConfig {
  ignore?: {
    rules?: string[];
    overrides?: DoctorOverride[];
  };
}

const CONFIGS: Array<{ configPath: string; baseDir: string }> = [
  {
    configPath: path.resolve(__dirname, "../doctor.config.json"),
    baseDir: path.resolve(__dirname, ".."),
  },
  {
    configPath: path.resolve(__dirname, "../modules/dns-native/doctor.config.json"),
    baseDir: path.resolve(__dirname, "../modules/dns-native"),
  },
];

const isGlob = (entry: string): boolean => /[*?[\]{}]/.test(entry);

describe("doctor.config.json overrides", () => {
  it.each(CONFIGS.map((c) => [path.relative(process.cwd(), c.configPath), c] as const))(
    "%s: every non-glob files entry resolves to an existing path",
    (_label, { configPath, baseDir }) => {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as DoctorConfig;
      const overrides = config.ignore?.overrides ?? [];
      expect(overrides.length).toBeGreaterThan(0);

      const missing = overrides
        .flatMap((override) => override.files)
        .filter((entry) => !isGlob(entry))
        .filter((entry) => !fs.existsSync(path.resolve(baseDir, entry)));

      // A rename/delete that orphans an exemption must update doctor.config.json too.
      expect(missing).toEqual([]);
    },
  );
});
