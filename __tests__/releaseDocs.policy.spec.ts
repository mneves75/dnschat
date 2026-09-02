import fs from "node:fs";

const androidReleasePath = "docs/ANDROID_RELEASE.md";
const playStorePath = "docs/ANDROID_GOOGLE_PLAY_STORE.md";
const testFlightPath = "docs/App_store/Apple_App_Store/TESTFLIGHT.md";
const appStorePath = "docs/App_store/Apple_App_Store/AppStoreConnect.md";

const androidRelease = fs.readFileSync(androidReleasePath, "utf8");
const playStore = fs.readFileSync(playStorePath, "utf8");
const testFlight = fs.readFileSync(testFlightPath, "utf8");
const appStore = fs.readFileSync(appStorePath, "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
  version: string;
};
const appJson = JSON.parse(fs.readFileSync("app.json", "utf8")) as {
  expo: { ios: { buildNumber: string } };
};

describe("release documentation policy", () => {
  const repositoryTarget = `\`${packageJson.version}\` build \`${appJson.expo.ios.buildNumber}\``;

  it("separates repository targets, validated artifacts, and production state", () => {
    expect(androidRelease).toContain(
      `Repository target:** ${repositoryTarget}`,
    );
    expect(playStore).toContain(`Repository target:** ${repositoryTarget}`);
    expect(testFlight).toContain(`Repository target:** ${repositoryTarget}`);
    expect(appStore).toContain(`Repository target:** ${repositoryTarget}`);

    expect(testFlight).toContain(
      `Latest validated TestFlight artifact:** ${repositoryTarget}`,
    );
    expect(appStore).toContain(
      `Latest validated TestFlight artifact:** ${repositoryTarget}`,
    );
    expect(androidRelease).toContain("Latest production release:** unverified");
    expect(playStore).toContain(
      "Latest production Google Play release:** unverified",
    );
    expect(testFlight).toContain(
      "Latest production App Store release:** unverified",
    );
    expect(appStore).toContain(
      "Latest production App Store release:** unverified",
    );
  });

  it("does not revive stale current-version labels", () => {
    const combined = [androidRelease, playStore, testFlight, appStore].join(
      "\n",
    );

    expect(combined).not.toMatch(/\*\*Current Version\*\*:/);
    expect(combined).not.toMatch(/Current TestFlight release is/);
    expect(combined).not.toMatch(/Current v\d+\.\d+\.\d+ distribution/);
    expect(combined).not.toContain(
      "Latest local release target: `v4.1.5` build `72`",
    );
  });

  it("documents only signing and submit inputs supported by the repository", () => {
    expect(androidRelease).not.toContain("MYAPP_UPLOAD_");
    expect(testFlight).not.toMatch(/eas submit[^\n]*--profile/);
  });

  it("keeps cleanup scoped to the runbook-owned Derived Data directory", () => {
    expect(testFlight).not.toContain("rm -rf");
    expect(testFlight).not.toContain("~/Library/Developer/Xcode/DerivedData");
    expect(testFlight).toContain(
      "-derivedDataPath /tmp/dnschat-testflight-derived-data",
    );
  });

  it("gates age and content ratings on provider and adversarial evidence", () => {
    expect(appStore).toContain("Pending evidence");
    expect(appStore).toContain("representative adversarial");
    expect(appStore).not.toMatch(/\*\*4\+\*\*|Age Rating\*\*: 4\+/);

    expect(playStore).toContain("provider's enforceable content safeguards");
    expect(playStore).toContain("representative adversarial prompts");
    expect(playStore).toContain("Expected rating:** unverified");
    expect(playStore).not.toMatch(/PEGI 3|Everyone/);
  });
});
