import React from "react";
import type { ReactTestInstance, ReactTestRenderer } from "react-test-renderer";
import { act } from "react-test-renderer";
import { Switch } from "react-native";
import * as HapticsUtils from "../src/utils/haptics";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

const mockUseSettings = jest.fn();

jest.mock("../src/context/SettingsContext", () => ({
  useSettings: () => mockUseSettings(),
}));

jest.mock("../src/context/OnboardingContext", () => ({
  useOnboarding: () => ({ resetOnboarding: jest.fn() }),
}));

jest.mock("../src/context/ChatContext", () => ({
  useChat: () => ({ loadChats: jest.fn() }),
}));

jest.mock("../src/context/AccessibilityContext", () => ({
  useAccessibility: () => ({
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    highContrastEnabled: false,
  }),
}));

jest.mock("../src/components/glass", () => {
  const React = require("react");
  const Placeholder = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  );
  type FormItemProps = {
    children?: React.ReactNode;
    rightContent?: React.ReactNode;
  };
  type ChildrenOnlyProps = { children?: React.ReactNode };
  const FormItem = ({ children, rightContent }: FormItemProps) => (
    <>
      {children}
      {rightContent}
    </>
  );
  const FormSection = ({ children }: ChildrenOnlyProps) => <>{children}</>;
  const FormList = ({ children }: ChildrenOnlyProps) => <>{children}</>;
  const FormLink = ({ children }: ChildrenOnlyProps) => <>{children}</>;

  return {
    Form: {
      List: FormList,
      Section: FormSection,
      Item: FormItem,
      Link: FormLink,
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

jest.mock("../src/ui/hooks/useScreenEntrance", () => ({
  useScreenEntrance: () => ({ animatedStyle: {} }),
}));

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View },
    View,
  };
});

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const language = params?.["language"];
      if (typeof language === "string") {
        return `${key}:${language}`;
      }
      const count = params?.["count"];
      if (typeof count !== "undefined") {
        return `${key}:${String(count)}`;
      }
      return key;
    },
  }),
}));

const { GlassSettings: Settings } = require("../src/navigation/screens/GlassSettings");
const toggleSwitchMock = jest
  .spyOn(HapticsUtils, "toggleSwitch")
  .mockImplementation(jest.fn());

const baseSettingsValue = {
  dnsServer: "ch.at",
  updateDnsServer: jest.fn().mockResolvedValue(undefined),
  allowExperimentalTransports: true,
  updateAllowExperimentalTransports: jest.fn().mockResolvedValue(undefined),
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
};
const createSettingsValue = (
  overrides: Partial<typeof baseSettingsValue> = {},
) => ({
  ...baseSettingsValue,
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
      tree = createWithSuppressedWarnings(<Settings />);
    });
    if (!tree) {
      throw new Error("Failed to render Settings");
    }
    const renderedTree = tree as ReactTestRenderer;
    const switches = renderedTree.root.findAllByType(Switch) as ReactTestInstance[];
    const hapticsSwitch = switches.find((node) => node.props["value"] === true);
    expect(hapticsSwitch).toBeDefined();

    await act(async () => {
      await hapticsSwitch!.props["onValueChange"](false);
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
