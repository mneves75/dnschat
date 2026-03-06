import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act } from "react-test-renderer";
import { SettingsProvider, useSettings } from "../src/context/SettingsContext";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("expo-localization", () => ({
  getLocales: jest.fn(() => [{ languageTag: "en-US", languageCode: "en" }]),
}));

jest.mock("../src/services/dnsLogService", () => ({
  DNSLogService: {
    recordSettingsEvent: jest.fn(async () => undefined),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
let latestSettings: ReturnType<typeof useSettings> | null = null;

function Harness() {
  latestSettings = useSettings();
  return null;
}

describe("SettingsProvider persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestSettings = null;
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  const renderProvider = async () => {
    await act(async () => {
      createWithSuppressedWarnings(
        <SettingsProvider>
          <Harness />
        </SettingsProvider>,
      );
      await Promise.resolve();
    });

    if (!latestSettings) {
      throw new Error("Settings context failed to initialize");
    }

    return latestSettings;
  };

  it("serializes concurrent updates against the latest persisted snapshot", async () => {
    const settings = await renderProvider();

    await act(async () => {
      await Promise.all([
        settings.updateEnableMockDNS(true),
        settings.updateAllowExperimentalTransports(false),
      ]);
    });

    const lastPayload = mockAsyncStorage.setItem.mock.calls.at(-1)?.[1];
    if (!lastPayload) {
      throw new Error("Expected persisted payload");
    }

    const parsed = JSON.parse(lastPayload) as {
      enableMockDNS: boolean;
      allowExperimentalTransports: boolean;
    };

    expect(parsed.enableMockDNS).toBe(true);
    expect(parsed.allowExperimentalTransports).toBe(false);
    expect(latestSettings?.enableMockDNS).toBe(true);
    expect(latestSettings?.allowExperimentalTransports).toBe(false);
  });

  it("does not update in-memory settings when persistence fails", async () => {
    const settings = await renderProvider();
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error("disk full"));

    await expect(settings.updateEnableMockDNS(true)).rejects.toThrow("disk full");
    expect(latestSettings?.enableMockDNS).toBe(false);
  });

  it("applies the onboarding network recommendation atomically", async () => {
    const settings = await renderProvider();

    await act(async () => {
      await settings.applyRecommendedNetworkSettings(false);
    });

    const lastPayload = mockAsyncStorage.setItem.mock.calls.at(-1)?.[1];
    if (!lastPayload) {
      throw new Error("Expected persisted payload");
    }

    const parsed = JSON.parse(lastPayload) as {
      dnsServer: string;
      enableMockDNS: boolean;
      allowExperimentalTransports: boolean;
    };

    expect(parsed.dnsServer).toBe("llm.pieter.com");
    expect(parsed.enableMockDNS).toBe(false);
    expect(parsed.allowExperimentalTransports).toBe(false);
    expect(latestSettings?.dnsServer).toBe("llm.pieter.com");
    expect(latestSettings?.enableMockDNS).toBe(false);
    expect(latestSettings?.allowExperimentalTransports).toBe(false);
  });

  it("queues writes behind hydration so stale storage does not overwrite a user update", async () => {
    let resolveGetItem: ((value: string | null) => void) | null = null;
    mockAsyncStorage.getItem.mockImplementation(
      async () =>
        await new Promise<string | null>((resolve) => {
          resolveGetItem = resolve;
        }),
    );

    await act(async () => {
      createWithSuppressedWarnings(
        <SettingsProvider>
          <Harness />
        </SettingsProvider>,
      );
      await Promise.resolve();
    });

    if (!latestSettings || !resolveGetItem) {
      throw new Error("Settings context failed to initialize");
    }
    const releaseGetItem = resolveGetItem as (value: string | null) => void;

    const pendingUpdate = latestSettings.updateEnableMockDNS(true);
    releaseGetItem(
      JSON.stringify({
        version: 1,
        dnsServer: "llm.pieter.com",
        enableMockDNS: false,
        allowExperimentalTransports: true,
        enableHaptics: true,
        preferredLocale: null,
        accessibility: {
          fontSize: "medium",
          highContrast: false,
          reduceMotion: false,
          screenReader: false,
        },
      }),
    );

    await act(async () => {
      await pendingUpdate;
    });

    expect(latestSettings?.enableMockDNS).toBe(true);
    const lastPayload = mockAsyncStorage.setItem.mock.calls.at(-1)?.[1];
    if (!lastPayload) {
      throw new Error("Expected persisted payload after hydration race");
    }
    expect(JSON.parse(lastPayload).enableMockDNS).toBe(true);
  });
});
