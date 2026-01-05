import React from "react";
import type { ReactTestRenderer } from "react-test-renderer";
import { act } from "react-test-renderer";
import { TouchableOpacity } from "react-native";
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
    useGlassBottomSheet: () => ({ show: jest.fn(), hide: jest.fn(), visible: false }),
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

jest.mock("../src/utils/haptics", () => ({
  persistHapticsPreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params?.["language"]) {
        return `${key}:${params["language"]}`;
      }
      if (typeof params?.["count"] !== "undefined") {
        return `${key}:${params["count"]}`;
      }
      return key;
    },
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

const { Settings } = require("../src/navigation/screens/Settings");

const createSettingsValue = (overrides: Partial<Record<string, any>> = {}) => ({
  dnsServer: "ch.at",
  updateDnsServer: jest.fn().mockResolvedValue(undefined),
  enableMockDNS: false,
  updateEnableMockDNS: jest.fn().mockResolvedValue(undefined),
  allowExperimentalTransports: true,
  updateAllowExperimentalTransports: jest.fn().mockResolvedValue(undefined),
  enableHaptics: true,
  updateEnableHaptics: jest.fn().mockResolvedValue(undefined),
  locale: "en-US",
  systemLocale: "pt-BR",
  preferredLocale: null,
  availableLocales: [
    { locale: "en-US", label: "English" },
    { locale: "pt-BR", label: "Português" },
  ],
  updateLocale: jest.fn().mockResolvedValue(undefined),
  accessibility: { fontSize: "medium", highContrast: false, reduceMotion: false, screenReader: false },
  updateAccessibility: jest.fn(),
  loading: false,
  ...overrides,
});

describe("Settings language picker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("selects explicit locale", async () => {
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
    const option = renderedTree.root.find(
      (node) => node.props?.["testID"] === "language-option-en-US" && node.type === TouchableOpacity,
    );

    await act(async () => {
      await option.props["onPress"]();
    });

    expect(value.updateLocale).toHaveBeenCalledWith("en-US");
  });

  it("selects system default", async () => {
    const value = createSettingsValue({ preferredLocale: "pt-BR" });
    mockUseSettings.mockReturnValue(value);

    let tree: ReactTestRenderer | null = null;
    await act(async () => {
      tree = createWithSuppressedWarnings(<Settings />);
    });
    if (!tree) {
      throw new Error("Failed to render Settings");
    }
    const renderedTree = tree as ReactTestRenderer;
    const option = renderedTree.root.find(
      (node) => node.props?.["testID"] === "language-option-system" && node.type === TouchableOpacity,
    );

    await act(async () => {
      await option.props["onPress"]();
    });

    expect(value.updateLocale).toHaveBeenCalledWith(null);
  });
});
