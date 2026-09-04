import { Linking } from "react-native";
import {
  describeExternalUrlTarget,
  isAllowedExternalUrl,
  openExternalUrl,
} from "../src/utils/externalLinks";

describe("external link userinfo spoofing", () => {
  // Model output is untrusted. "https://trusted@evil.example/" parses with
  // host evil.example while reading as the trusted host in a dialog.
  it("rejects URLs carrying userinfo", () => {
    // Positive control first: the same host without userinfo IS allowed, so a
    // pass below cannot come from the whole scheme being blocked.
    expect(isAllowedExternalUrl("https://llm.pieter.com/docs")).toBe(true);

    expect(isAllowedExternalUrl("https://llm.pieter.com@evil.example/")).toBe(
      false,
    );
    // Deliberately single-character userinfo: a realistic-looking
    // "host:password@" literal trips secret scanners on this fixture, and the
    // branch under test only cares that password is non-empty.
    expect(isAllowedExternalUrl("https://a:b@evil.example/")).toBe(false);
    expect(isAllowedExternalUrl("https://user@evil.example/")).toBe(false);
  });

  it("describes the target a tap actually reaches, not the raw href", () => {
    expect(
      describeExternalUrlTarget("https://llm.pieter.com@evil.example/x"),
    ).toBe("https://evil.example");
    expect(
      describeExternalUrlTarget("https://github.com/mneves75/dnschat/issues"),
    ).toBe("https://github.com");
    expect(describeExternalUrlTarget("not a url")).toBe("invalid");
  });

  it("does not open a userinfo URL", async () => {
    const openURL = jest.fn().mockResolvedValue(undefined);
    Linking.openURL = openURL;

    await expect(
      openExternalUrl("https://llm.pieter.com@evil.example/"),
    ).resolves.toBe(false);
    expect(openURL).not.toHaveBeenCalled();

    // Positive control: a clean https URL still opens, proving the assertion
    // above is not passing because openExternalUrl is inert.
    await expect(openExternalUrl("https://llm.pieter.com/")).resolves.toBe(
      true,
    );
    expect(openURL).toHaveBeenCalledTimes(1);
  });
});

describe("external link safety", () => {
  const openURL = jest.fn();

  beforeAll(() => {
    Linking.openURL = openURL;
  });

  beforeEach(() => {
    openURL.mockReset();
    openURL.mockResolvedValue(undefined);
  });

  it("allows only explicit https and mailto URLs", () => {
    expect(isAllowedExternalUrl("https://github.com/mneves75/dnschat")).toBe(
      true,
    );
    expect(
      isAllowedExternalUrl(
        "mailto:support@dnschat.app?subject=DNSChat%20Support",
      ),
    ).toBe(true);
    expect(isAllowedExternalUrl("http://github.com/mneves75/dnschat")).toBe(
      false,
    );
    expect(isAllowedExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedExternalUrl(" https://github.com/mneves75/dnschat")).toBe(
      false,
    );
  });

  it("does not invoke native URL opening for blocked schemes", async () => {
    await expect(openExternalUrl("javascript:alert(1)")).resolves.toBe(false);

    expect(openURL).not.toHaveBeenCalled();
  });

  it("opens allowed URLs and converts native failures into false", async () => {
    await expect(
      openExternalUrl("https://github.com/mneves75/dnschat"),
    ).resolves.toBe(true);
    expect(openURL).toHaveBeenCalledWith("https://github.com/mneves75/dnschat");

    openURL.mockRejectedValueOnce(new Error("No handler"));
    await expect(
      openExternalUrl("mailto:support@dnschat.app?subject=DNSChat%20Support"),
    ).resolves.toBe(false);
  });
});
