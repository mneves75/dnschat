import React from "react";
import TestRenderer, { act, ReactTestRenderer, ReactTestInstance } from "react-test-renderer";
import { Switch } from "react-native";
import * as HapticsUtils from "../src/utils/haptics";


const mockUseSettings = jest.fn();

jest.mock("../src/context/SettingsContext", () => ({
  useSettings: () => mockUseSettings(),
}));

jest.mock("../src/context/OnboardingContext", () => ({
  useOnboarding: () => ({ resetOnboarding: jest.fn() }),
}));

jest.mock("../src/context/AccessibilityContext", () => ({
  useAccessibility: () => ({
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    highContrastEnabled: false,
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useTheme: () => ({
    colors: {
      text: "#000",
      border: "#444",
      background: "#fff",
      card: "#fafafa",
    },
  }),
}));

jest.mock("../src/components/glass", () => {
  const React = require("react");
  const Placeholder = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  );
  const FormItem = ({ children, rightContent }: any) => (
    <>
      {children}
      {rightContent}
    </>
  );
  const FormSection = ({ children }: any) => <>{children}</>;
  const FormList = ({ children }: any) => <>{children}</>;

  return {
    Form: {
      List: FormList,
      Section: FormSection,
      Item: FormItem,
    },
    GlassBottomSheet: Placeholder,
    GlassActionSheet: Placeholder,
    useGlassBottomSheet: () => ({ show: jest.fn(), hide: jest.fn() }),
    LiquidGlassWrapper: Placeholder,
  };
});

jest.mock("../src/ui/hooks/useTransportTestThrottle", () => ({
  useTransportTestThrottle: () => ({
    checkChainAvailability: () => null,
    checkForcedAvailability: () => null,
    registerChainRun: jest.fn(),
    registerForcedRun: jest.fn(),
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: jest.fn(), setOptions: jest.fn(), navigate: jest.fn() }),
  useTheme: () => ({
    colors: {
      text: "#000",
      border: "#444",
      background: "#fff",
      card: "#fafafa",
    },
  }),
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params?.language) {
        return `${key}:${params.language}`;
      }
      if (typeof params?.count !== "undefined") {
        return `${key}:${params.count}`;
      }
      return key;
    },
  }),
}));

const { Settings } = require("../src/navigation/screens/Settings");
const toggleSwitchMock = jest
  .spyOn(HapticsUtils, "toggleSwitch")
  .mockImplementation(jest.fn());

const createSettingsValue = (overrides: Partial<Record<string, any>> = {}) => ({
  dnsServer: "ch.at",
  updateDnsServer: jest.fn().mockResolvedValue(undefined),
  preferDnsOverHttps: false,
  updatePreferDnsOverHttps: jest.fn().mockResolvedValue(undefined),
  dnsMethodPreference: "automatic",
  updateDnsMethodPreference: jest.fn().mockResolvedValue(undefined),
  enableMockDNS: false,
  updateEnableMockDNS: jest.fn().mockResolvedValue(undefined),
  enableHaptics: true,
  updateEnableHaptics: jest.fn().mockResolvedValue(undefined),
  locale: "en-US",
  systemLocale: "en-US",
  preferredLocale: null,
  availableLocales: [{ locale: "en-US", label: "English" }],
  updateLocale: jest.fn().mockResolvedValue(undefined),
  loading: false,
  ...overrides,
});

describe("Enable Haptics toggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("wires the classic Settings switch into the updater + tactile ping", async () => {
    const value = createSettingsValue();
    mockUseSettings.mockReturnValue(value);

    let tree: ReactTestRenderer | null = null;
    await act(async () => {
      tree = TestRenderer.create(<Settings />);
    });
    if (!tree) {
      throw new Error("Failed to render Settings");
    }
    const renderedTree = tree as ReactTestRenderer;
    const switches = renderedTree.root.findAllByType(Switch) as ReactTestInstance[];
    const hapticsSwitch = switches.find((node) => node.props.value === true);
    expect(hapticsSwitch).toBeDefined();

    await act(async () => {
      await hapticsSwitch!.props.onValueChange(false);
    });

    expect(value.updateEnableHaptics).toHaveBeenCalledWith(false);
    expect(toggleSwitchMock).toHaveBeenCalledTimes(1);
  });

  it("persists via helper for the Glass Settings pathway", async () => {
    const setTempValue = jest.fn();
    const setSaving = jest.fn();
    const updateEnableHaptics = jest.fn().mockResolvedValue(undefined);

    await HapticsUtils.persistHapticsPreference(false, {
      loading: false,
      setSaving,
      setTempValue,
      updateEnableHaptics,
      logLabel: "Glass enable haptics",
    });

    expect(setTempValue).toHaveBeenCalledWith(false);
    expect(setSaving).toHaveBeenNthCalledWith(1, true);
    expect(setSaving).toHaveBeenLastCalledWith(false);
    expect(updateEnableHaptics).toHaveBeenCalledWith(false);
    expect(toggleSwitchMock).toHaveBeenCalledTimes(1);
  });
});
