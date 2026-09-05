import React from "react";
import type { ReactTestRenderer } from "react-test-renderer";
import { act } from "react-test-renderer";
import { TouchableOpacity } from "react-native";
import { DNSService } from "../src/services/dnsService";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

const mockUseSettings = jest.fn();

jest.mock("../src/context/SettingsContext", () => {
  const ReactModule = jest.requireActual<typeof import("react")>("react");
  return {
    SettingsContext: ReactModule.createContext(undefined),
    useSettings: () => mockUseSettings(),
  };
});

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
  useHighContrast: () => ({ isHighContrast: false }),
  useMotionReduction: () => ({
    shouldReduceMotion: false,
    animationDuration: undefined,
  }),
  useScreenReader: () => ({ isEnabled: false, announce: () => undefined }),
  useFontSize: () => ({ scale: 1.0 }),
}));

jest.mock("../src/components/glass/GlassForm", () => {
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
  const FormItem = ({
    children,
    rightContent,
    testID,
    onPress,
  }: FormItemProps) => (
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
    useGlassBottomSheet: () => ({
      show: jest.fn(),
      hide: jest.fn(),
      visible: false,
    }),
    LiquidGlassWrapper: Placeholder,
  };
});

jest.mock("../src/components/glass/GlassBottomSheet", () =>
  jest.requireMock("../src/components/glass/GlassForm"),
);

jest.mock("../src/components/LiquidGlassWrapper", () =>
  jest.requireMock("../src/components/glass/GlassForm"),
);

jest.mock("../src/utils/haptics", () => ({
  persistHapticsPreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/ui/hooks/useScreenEntrance", () => ({
  useScreenEntrance: () => ({ animatedStyle: {} }),
}));

// react-native-reanimated is mapped to a shared, complete mock via
// jest.config.js `moduleNameMapper` — no per-suite stub needed.

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: jest
      .requireActual("../src/i18n")
      .createTranslator(mockUseSettings().locale),
  }),
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    setOptions: jest.fn(),
    navigate: jest.fn(),
  }),
  useTheme: () => ({
    colors: {
      text: "#000",
      border: "#444",
      background: "#fff",
      card: "#fafafa",
    },
  }),
}));

const {
  GlassSettings: Settings,
} = require("../src/navigation/screens/GlassSettings");

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
  accessibility: {
    fontSize: "medium",
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
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

  afterEach(() => {
    jest.restoreAllMocks();
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
      (node) =>
        node.props?.["testID"] === "language-option-en-US" &&
        node.type === TouchableOpacity,
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
      (node) =>
        node.props?.["testID"] === "language-option-system" &&
        node.type === TouchableOpacity,
    );

    await act(async () => {
      await option.props["onPress"]();
    });

    expect(value.updateLocale).toHaveBeenCalledWith(null);
  });
  it.each([
    [
      "en-US",
      "Wait a moment before testing again.",
      "Wait a moment before testing this transport again.",
    ],
    [
      "pt-BR",
      "Aguarde um instante antes de testar novamente.",
      "Aguarde um instante antes de testar este transporte novamente.",
    ],
  ])(
    "translates throttled transport tests in %s",
    async (locale, chainMessage, forcedMessage) => {
      mockUseSettings.mockReturnValue(createSettingsValue({ locale }));
      jest.spyOn(Date, "now").mockReturnValue(10_000);
      const chainQuery = jest
        .spyOn(DNSService, "queryLLM")
        .mockResolvedValue("ok");
      const forcedQuery = jest
        .spyOn(DNSService, "testTransport")
        .mockResolvedValue("ok");
      let tree: ReactTestRenderer | null = null;
      await act(async () => {
        tree = createWithSuppressedWarnings(<Settings />);
      });
      if (!tree) throw new Error("Failed to render Settings");
      const renderedTree = tree as ReactTestRenderer;

      for (const [testID, message, query] of [
        ["settings-transport-test", chainMessage, chainQuery],
        ["settings-force-native", forcedMessage, forcedQuery],
      ] as const) {
        const button = renderedTree.root.findAllByProps({ testID })[0];
        if (!button) throw new Error(`Missing button: ${testID}`);
        await act(async () => {
          await button.props["onPress"]();
        });
        expect(query).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(renderedTree.toJSON())).not.toContain(message);
        await act(async () => {
          await button.props["onPress"]();
        });
        expect(query).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(renderedTree.toJSON())).toContain(message);
      }
      await act(async () => {
        renderedTree.unmount();
      });
    },
  );
});
