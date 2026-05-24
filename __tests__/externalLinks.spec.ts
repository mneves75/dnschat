import { Linking } from "react-native";
import {
  isAllowedExternalUrl,
  openExternalUrl,
} from "../src/utils/externalLinks";

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
    expect(isAllowedExternalUrl("https://github.com/mneves75/dnschat")).toBe(true);
    expect(
      isAllowedExternalUrl("mailto:support@dnschat.app?subject=DNSChat%20Support"),
    ).toBe(true);
    expect(isAllowedExternalUrl("http://github.com/mneves75/dnschat")).toBe(false);
    expect(isAllowedExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedExternalUrl(" https://github.com/mneves75/dnschat")).toBe(false);
  });

  it("does not invoke native URL opening for blocked schemes", async () => {
    await expect(openExternalUrl("javascript:alert(1)")).resolves.toBe(false);

    expect(openURL).not.toHaveBeenCalled();
  });

  it("opens allowed URLs and converts native failures into false", async () => {
    await expect(openExternalUrl("https://github.com/mneves75/dnschat")).resolves.toBe(
      true,
    );
    expect(openURL).toHaveBeenCalledWith("https://github.com/mneves75/dnschat");

    openURL.mockRejectedValueOnce(new Error("No handler"));
    await expect(
      openExternalUrl("mailto:support@dnschat.app?subject=DNSChat%20Support"),
    ).resolves.toBe(false);
  });
});
