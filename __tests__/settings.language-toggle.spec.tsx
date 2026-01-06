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
  const { TouchableOpacity } = require("react-native");
  const Placeholder = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  );
  type FormItemProps = {
    children?: React.ReactNode;
    rightContent?: React.ReactNode;
    testID?: string;
    onPress?: () => void;
  };
  type ChildrenOnlyProps = { children?: React.ReactNode };
  const FormItem = ({ children, rightContent, testID, onPress }: FormItemProps) => (
    <TouchableOpacity testID={testID} onPress={onPress}>
      {children}
      {rightContent}
    </TouchableOpacity>
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

const { GlassSettings: Settings } = require("../src/navigation/screens/GlassSettings");

type SettingsValue = {
  dnsServer: string;
  updateDnsServer: jest.Mock;
  enableMockDNS: boolean;
  updateEnableMockDNS: jest.Mock;
  allowExperimentalTransports: boolean;
  updateAllowExperimentalTransports: jest.Mock;
  enableHaptics: boolean;
  updateEnableHaptics: jest.Mock;
  locale: string;
  systemLocale: string;
  preferredLocale: string | null;
  availableLocales: Array<{ locale: string; label: string }>;
  updateLocale: jest.Mock;
  accessibility: {
    fontSize: string;
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  updateAccessibility: jest.Mock;
  loading: boolean;
};

const baseSettingsValue: SettingsValue = {
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
};
const createSettingsValue = (
  overrides: Partial<typeof baseSettingsValue> = {},
) => ({
  ...baseSettingsValue,
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
