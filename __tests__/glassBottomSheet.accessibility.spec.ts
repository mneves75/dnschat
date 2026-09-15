import React from "react";
import { StyleSheet } from "react-native";
import { act } from "react-test-renderer";
import type {
  ReactTestInstance,
  ReactTestRenderer,
  TestRendererOptions,
} from "react-test-renderer";
import type { ReactElement } from "react";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";
import { createWithNodeMock } from "./utils/accessibilityHarness";

const h = React.createElement;

let mockPlatformOS = "ios";
jest.mock("react-native", () => {
  const ReactModule = jest.requireActual<typeof import("react")>("react");
  const actual = jest.requireActual("./mocks/react-native");
  const noop = () => undefined;
  const stub = (name: string) => {
    const Component = (props: { children?: React.ReactNode }) =>
      ReactModule.createElement(name, props, props.children ?? null);
    Component.displayName = name;
    return Component;
  };
  return {
    ...actual,
    Platform: {
      ...actual.Platform,
      get OS() {
        return mockPlatformOS;
      },
    },
    TouchableWithoutFeedback: stub("TouchableWithoutFeedback"),
    Animated: {
      Value: class AnimatedValue {
        setValue = noop;
        interpolate = () => 0;
      },
      View: stub("Animated.View"),
      timing: () => ({ start: noop, stop: noop }),
      parallel: () => ({
        start: (done?: (result: { finished: boolean }) => void) =>
          done?.({ finished: true }),
        stop: noop,
      }),
      multiply: () => 0,
    },
  };
});

// Records whether GlassBottomSheet pulls in the native sheet/gesture stacks that
// widened the build-47 startup crash surface. A factory only runs on require.
const mockLoadedNativeSheetModules: string[] = [];
jest.mock("@expo/ui/community/bottom-sheet", () => {
  mockLoadedNativeSheetModules.push("@expo/ui/community/bottom-sheet");
  return {};
});
jest.mock("react-native-gesture-handler", () => {
  mockLoadedNativeSheetModules.push("react-native-gesture-handler");
  return {};
});

jest.mock("../src/i18n", () =>
  require("./utils/accessibilityHarness").englishI18nModule(),
);
jest.mock("../src/ui/theme/imessagePalette", () =>
  require("./utils/accessibilityHarness").tokenPaletteModule(),
);
jest.mock("../src/context/AccessibilityContext", () =>
  require("./utils/accessibilityHarness").accessibilityContextModule(),
);
jest.mock("../src/components/LiquidGlassWrapper", () =>
  require("./utils/accessibilityHarness").liquidGlassWrapperModule(),
);
jest.mock("../src/components/glass/GlassForm", () =>
  require("./utils/accessibilityHarness").glassFormModule(),
);
jest.mock("../src/ui/theme/resolvedColorScheme", () => ({
  useResolvedColorScheme: () => "light",
}));

const mockSettings = {
  dnsServer: "llm.pieter.com",
  updateDnsServer: jest.fn(async () => undefined),
  enableMockDNS: false,
  updateEnableMockDNS: jest.fn(async () => undefined),
  enableHaptics: true,
  updateEnableHaptics: jest.fn(async () => undefined),
  updateAccessibility: jest.fn(async () => undefined),
  locale: "en-US",
  systemLocale: "en-US",
  preferredLocale: null,
  availableLocales: [{ locale: "en-US", label: "English" }],
  updateLocale: jest.fn(async () => undefined),
  themePreference: "system",
  updateThemePreference: jest.fn(async () => undefined),
  loading: false,
};
jest.mock("../src/context/SettingsContext", () => ({
  SettingsContext: jest.requireActual("react").createContext(undefined),
  useSettings: () => mockSettings,
  useLocale: () => "en-US",
}));
jest.mock("../src/context/OnboardingContext", () => ({
  useOnboarding: () => ({ resetOnboarding: jest.fn() }),
}));
jest.mock("../src/context/ChatContext", () => ({
  useChat: () => ({ loadChats: jest.fn(async () => undefined) }),
}));
jest.mock("../src/ui/hooks/useTransportTestThrottle", () => ({
  useTransportTestThrottle: () => ({
    checkChainAvailability: () => null,
    checkForcedAvailability: () => null,
    registerChainRun: () => undefined,
    registerForcedRun: () => undefined,
  }),
}));
jest.mock("../src/ui/hooks/useScreenEntrance", () => ({
  useScreenEntrance: () => ({ animatedStyle: {} }),
}));
jest.mock("../src/ui/hooks/useStaggeredList", () => ({
  ...jest.requireActual("../src/ui/hooks/useStaggeredList"),
  useStaggeredListValues: () => ({ opacities: [], translates: [] }),
}));
jest.mock("../src/services/dnsService", () => ({
  DNSService: { testTransport: jest.fn(), queryLLM: jest.fn() },
}));
const mockQueryLogs: unknown[] = [];
jest.mock("../src/services/dnsLogService", () => ({
  DNSLogService: {
    initialize: jest.fn(async () => undefined),
    getLogs: () => mockQueryLogs,
    subscribe: () => () => undefined,
    formatDuration: (ms: number) => `${ms}ms`,
    getStatusIcon: () => "",
    getMethodColor: () => "#000000",
    clearLogs: jest.fn(async () => undefined),
  },
}));
jest.mock("../src/components/skeletons/LogsSkeleton", () => ({
  LogsSkeleton: () => null,
}));
jest.mock("../src/components/EmptyState", () => ({ EmptyState: () => null }));
jest.mock("../src/utils/haptics", () => ({
  HapticFeedback: new Proxy({}, { get: () => () => undefined }),
  persistHapticsPreference: jest.fn(async () => undefined),
  toggleSwitch: jest.fn(),
}));

const recordedTabOptions: Array<{
  tabBarIcon: (props: { color: string }) => ReactElement;
}> = [];
jest.mock("expo-router/js-tabs", () => {
  const Tabs = ({ children }: { children?: React.ReactNode }) => children;
  Tabs.Screen = ({ options }: { options: (typeof recordedTabOptions)[0] }) => {
    recordedTabOptions.push(options);
    return null;
  };
  return { Tabs };
});
jest.mock("../src/assets/newspaper.png", () => 1);
jest.mock("../src/assets/logs-icon.png", () => 2);
jest.mock("../src/assets/info-icon.png", () => 3);

const { GlassBottomSheet, GlassActionSheet, useGlassBottomSheet } =
  require("../src/components/glass/GlassBottomSheet") as typeof import("../src/components/glass/GlassBottomSheet");
const nativeSheetModulesLoadedByGlassBottomSheet = [
  ...mockLoadedNativeSheetModules,
];
const { CloseIcon } =
  require("../src/components/icons/CloseIcon") as typeof import("../src/components/icons/CloseIcon");
const { CheckmarkIcon } =
  require("../src/components/icons/CheckmarkIcon") as typeof import("../src/components/icons/CheckmarkIcon");

type Props = Record<string, unknown>;
const byType = (type: string) => (node: ReactTestInstance) =>
  node.type === type;
const byProps = (expected: Props) => (node: ReactTestInstance) =>
  typeof node.type === "string" &&
  Object.entries(expected).every(([key, value]) => node.props[key] === value);
const flatStyle = (node: ReactTestInstance) =>
  StyleSheet.flatten(node.props["style"]) as Props;

let trees: ReactTestRenderer[] = [];
const track = (tree: ReactTestRenderer) => {
  trees.push(tree);
  return tree;
};
const render = (element: ReactElement) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = track(createWithSuppressedWarnings(element));
  });
  return tree;
};

afterEach(() => {
  act(() => trees.forEach((tree) => tree.unmount()));
  trees = [];
  mockPlatformOS = "ios";
});

const sheet = (props: Props = {}) =>
  h(
    GlassBottomSheet,
    {
      visible: true,
      onClose: jest.fn(),
      title: "Choose resolver",
      subtitle: "Queries are visible to the network",
      testID: "sheet-scroll",
      ...props,
    } as unknown as React.ComponentProps<typeof GlassBottomSheet>,
    h("Text", { testID: "sheet-child" }, "Body"),
  );

describe("GlassBottomSheet accessibility behavior", () => {
  it("presents an open native sheet as a modal accessibility scope with a hidden backdrop", () => {
    const tree = render(sheet());

    const modal = tree.root.find(byType("Modal"));
    expect(modal.props["accessibilityViewIsModal"]).toBe(true);
    const backdrop = tree.root
      .find(byType("TouchableWithoutFeedback"))
      .find(byType("Animated.View"));
    expect(backdrop.props["accessible"]).toBe(false);
    expect(backdrop.props["accessibilityElementsHidden"]).toBe(true);
    expect(backdrop.props["importantForAccessibility"]).toBe(
      "no-hide-descendants",
    );
  });

  describe("on web", () => {
    type FakeElement = {
      name: string;
      focus: () => void;
      hasAttribute: () => boolean;
      getAttribute: () => string | null;
    };
    type KeyEvent = {
      key: string;
      shiftKey?: boolean;
      preventDefault: jest.Mock;
    };
    type KeyListener = (event: KeyEvent) => void;

    let listeners: Set<KeyListener>;
    let frames: FrameRequestCallback[];
    let activeElement: FakeElement | null;
    let trigger: FakeElement;
    let firstControl: FakeElement;
    let lastControl: FakeElement;
    const globals = globalThis as unknown as Record<string, unknown>;

    const element = (name: string): FakeElement => {
      const el = Object.assign(
        new (globals["HTMLElement"] as new () => object)(),
        {
          name,
          focus: () => {
            activeElement = el;
          },
          hasAttribute: () => false,
          getAttribute: () => null,
        },
      );
      return el;
    };

    const createNodeMock: TestRendererOptions["createNodeMock"] = (node) =>
      (node.props as Props)["role"] === "dialog"
        ? {
            querySelectorAll: () => [firstControl, lastControl],
            focus: () => undefined,
          }
        : null;

    const renderWeb = (props: Props) => {
      let tree!: ReactTestRenderer;
      act(() => {
        tree = track(createWithNodeMock(sheet(props), createNodeMock));
      });
      return tree;
    };

    const press = (key: string, shiftKey = false) => {
      const event = { key, shiftKey, preventDefault: jest.fn() };
      act(() => listeners.forEach((listener) => listener(event)));
      return event;
    };

    beforeEach(() => {
      mockPlatformOS = "web";
      listeners = new Set();
      frames = [];
      globals["HTMLElement"] = class HTMLElement {};
      trigger = element("trigger");
      firstControl = element("first");
      lastControl = element("last");
      activeElement = trigger;
      globals["document"] = {
        get activeElement() {
          return activeElement;
        },
        addEventListener: (type: string, listener: KeyListener) => {
          if (type === "keydown") listeners.add(listener);
        },
        removeEventListener: (type: string, listener: KeyListener) => {
          if (type === "keydown") listeners.delete(listener);
        },
      };
      globals["requestAnimationFrame"] = (callback: FrameRequestCallback) =>
        frames.push(callback);
      globals["cancelAnimationFrame"] = () => undefined;
    });

    afterEach(() => {
      act(() => trees.forEach((tree) => tree.unmount()));
      trees = [];
      delete globals["document"];
      delete globals["HTMLElement"];
      delete globals["requestAnimationFrame"];
      delete globals["cancelAnimationFrame"];
    });

    it("exposes a modal dialog and moves focus to its first control", () => {
      const tree = renderWeb({});

      const dialog = tree.root.find(byProps({ role: "dialog" }));
      expect(dialog.props["aria-modal"]).toBe(true);
      expect(activeElement).toBe(trigger);
      act(() => frames.splice(0).forEach((frame) => frame(0)));
      expect(activeElement).toBe(firstControl);
    });

    it("closes on Escape through the latest onClose without re-registering the key listener", () => {
      const staleClose = jest.fn();
      const latestClose = jest.fn();
      const tree = renderWeb({ onClose: staleClose });
      const registered = [...listeners];

      act(() => tree.update(sheet({ onClose: latestClose })));
      expect([...listeners]).toEqual(registered);

      const escape = press("Escape");
      expect(escape.preventDefault).toHaveBeenCalled();
      expect(latestClose).toHaveBeenCalledTimes(1);
      expect(staleClose).not.toHaveBeenCalled();
    });

    it("wraps Tab and Shift+Tab focus inside the dialog", () => {
      renderWeb({});

      activeElement = lastControl;
      const tab = press("Tab");
      expect(tab.preventDefault).toHaveBeenCalled();
      expect(activeElement).toBe(firstControl);

      const shiftTab = press("Tab", true);
      expect(shiftTab.preventDefault).toHaveBeenCalled();
      expect(activeElement).toBe(lastControl);
    });

    it("releases the keyboard trap and restores focus to the opener when closed", () => {
      const onClose = jest.fn();
      const tree = renderWeb({ onClose });
      act(() => frames.splice(0).forEach((frame) => frame(0)));
      expect(listeners.size).toBe(1);

      act(() => tree.update(sheet({ onClose, visible: false })));

      expect(listeners.size).toBe(0);
      expect(activeElement).toBe(trigger);
      press("Escape");
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it("keeps constrained sheet content inside a scroll view that preserves taps and bottom padding", () => {
    const tree = render(sheet());

    const scroll = tree.root.find(byProps({ testID: "sheet-scroll" }));
    expect(scroll.type).toBe("ScrollView");
    expect(scroll.props["keyboardShouldPersistTaps"]).toBe("handled");
    expect(
      StyleSheet.flatten(scroll.props["contentContainerStyle"]).paddingBottom,
    ).toBe(20);
    expect(scroll.findAll(byProps({ testID: "sheet-child" }))).toHaveLength(1);
  });

  it("drives sheet visibility through show, hide and toggle", () => {
    const Probe = () => h("Probe", useGlassBottomSheet());
    const tree = render(h(Probe));
    const controls = () =>
      tree.root.find(byType("Probe")).props as ReturnType<
        typeof useGlassBottomSheet
      >;

    expect(controls().visible).toBe(false);
    act(() => controls().show());
    expect(controls().visible).toBe(true);
    act(() => controls().hide());
    expect(controls().visible).toBe(false);
    act(() => controls().toggle());
    expect(controls().visible).toBe(true);
    act(() => controls().toggle());
    expect(controls().visible).toBe(false);
  });

  it("loads no native bottom-sheet or gesture module and mounts nothing until opened", () => {
    expect(nativeSheetModulesLoadedByGlassBottomSheet).toEqual([]);

    const onClose = jest.fn();
    const closed = render(sheet({ visible: false, onClose }));
    expect(closed.toJSON()).toBeNull();

    const open = render(sheet({ onClose }));
    act(() =>
      open.root.find(byType("TouchableWithoutFeedback")).props["onPress"](),
    );
    expect(onClose).toHaveBeenCalledTimes(1);

    const pinned = jest.fn();
    const undismissable = render(
      sheet({ onClose: pinned, disableBackdropDismiss: true }),
    );
    act(() =>
      undismissable.root
        .find(byType("TouchableWithoutFeedback"))
        .props["onPress"](),
    );
    expect(pinned).not.toHaveBeenCalled();
  });

  it("gives the close control and action sheet rows accessible button metadata", () => {
    const onClose = jest.fn();
    const closeTree = render(sheet({ onClose }));
    const close = closeTree.root.find(
      byProps({ accessibilityLabel: "Close", accessibilityRole: "button" }),
    );
    act(() => close.props["onPress"]());
    expect(onClose).toHaveBeenCalledTimes(1);

    const share = jest.fn();
    const remove = jest.fn();
    const onSheetClose = jest.fn();
    const actionTree = render(
      h(GlassActionSheet, {
        visible: true,
        onClose: onSheetClose,
        title: "Conversation",
        actions: [
          { title: "Share", onPress: share, disabled: true },
          {
            title: "Delete",
            accessibilityLabel: "Delete conversation",
            onPress: remove,
            style: "destructive",
          },
        ],
      }),
    );

    const disabledRow = actionTree.root.find(
      byProps({ accessibilityLabel: "Share" }),
    );
    expect(disabledRow.props["accessibilityRole"]).toBe("button");
    expect(disabledRow.props["accessibilityState"]).toEqual({ disabled: true });
    act(() => disabledRow.props["onPress"]());
    expect(share).not.toHaveBeenCalled();

    const deleteRow = actionTree.root.find(
      byProps({ accessibilityLabel: "Delete conversation" }),
    );
    expect(deleteRow.props["accessibilityRole"]).toBe("button");
    expect(deleteRow.props["accessibilityState"]).toEqual({
      disabled: undefined,
    });
    act(() => deleteRow.props["onPress"]());
    expect(remove).toHaveBeenCalledTimes(1);
    expect(onSheetClose).toHaveBeenCalledTimes(1);
  });

  it("draws the close glyph as a fixed-size vector icon with no scalable text", () => {
    const tree = render(sheet());
    const close = tree.root.find(byProps({ accessibilityLabel: "Close" }));

    expect(close.findAllByType(CloseIcon)).toHaveLength(1);
    expect(close.findByType(CloseIcon).props["size"]).toBe(16);
    expect(close.findAll(byType("Text"))).toHaveLength(0);
  });

  it("colors sheet text and actions from shared palette tokens", () => {
    const tree = render(
      h(GlassActionSheet, {
        visible: true,
        onClose: jest.fn(),
        title: "Conversation",
        message: "Choose an action",
        actions: [
          { title: "Open", onPress: jest.fn() },
          { title: "Delete", onPress: jest.fn(), style: "destructive" },
          { title: "Muted", onPress: jest.fn(), disabled: true },
        ],
      }),
    );
    const colorOf = (label: string) =>
      flatStyle(
        tree.root.find(
          (node) => byType("Text")(node) && node.props["children"] === label,
        ),
      )["color"];

    expect(colorOf("Conversation")).toBe("token:textPrimary");
    expect(colorOf("Choose an action")).toBe("token:textSecondary");
    expect(colorOf("Open")).toBe("token:userBubble");
    expect(colorOf("Delete")).toBe("token:destructive");
    expect(colorOf("Muted")).toBe("token:textTertiary");
  });
});

describe("shared interactive control accessibility behavior", () => {
  it("labels the error-boundary recovery action and recovers when it is pressed", () => {
    const { ErrorBoundary } =
      require("../src/components/ErrorBoundary") as typeof import("../src/components/ErrorBoundary");
    let shouldThrow = true;
    const Bomb = () => {
      if (shouldThrow) throw new Error("boom");
      return h("Text", { testID: "recovered" }, "ok");
    };
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const tree = render(h(ErrorBoundary, null, h(Bomb)));

    const reset = tree.root.find(
      byProps({ accessibilityRole: "button", accessibilityLabel: "Reset" }),
    );
    shouldThrow = false;
    act(() => reset.props["onPress"]());
    consoleError.mockRestore();

    expect(tree.root.findAll(byProps({ testID: "recovered" }))).toHaveLength(1);
  });

  it.each([
    ["error", "alert", "assertive", 4],
    ["success", undefined, "polite", 2],
  ] as const)(
    "announces %s toasts with role %s and a %s live region, bounded to %i message lines",
    (variant, role, liveRegion, messageLines) => {
      const { Toast } =
        require("../src/components/ui/Toast") as typeof import("../src/components/ui/Toast");
      const tree = render(
        h(Toast, {
          visible: true,
          variant,
          title: "DNS",
          message: "Resolver unreachable",
          actionLabel: "Retry",
          onAction: jest.fn(),
          onDismiss: jest.fn(),
          duration: 0,
        }),
      );

      const announcement = tree.root.find(
        byProps({ accessibilityLabel: "DNS Resolver unreachable" }),
      );
      expect(announcement.props["accessibilityRole"]).toBe(role);
      expect(announcement.props["accessibilityLiveRegion"]).toBe(liveRegion);
      expect(
        tree.root.findAll(
          (node) =>
            typeof node.type === "string" &&
            node.props["accessibilityLiveRegion"] === "assertive",
        ),
      ).toHaveLength(variant === "error" ? 1 : 0);
      expect(
        tree.root.find(
          (node) =>
            byType("Text")(node) &&
            node.props["children"] === "Resolver unreachable",
        ).props["numberOfLines"],
      ).toBe(messageLines);

      const glyph = tree.root.find(
        (node) =>
          byType("View")(node) &&
          node.props["importantForAccessibility"] === "no-hide-descendants",
      );
      expect(glyph.props["accessibilityElementsHidden"]).toBe(true);

      // The action sits under the message in the text column. Beside it, on a
      // narrow Android screen a longer label ("Tentar de novo") squeezed the
      // message to a few characters per line.
      const hasNode = (
        root: ReactTestInstance,
        predicate: (node: ReactTestInstance) => boolean,
      ) => root.findAll(predicate).length > 0;
      const textColumns = tree.root.findAll(
        (node) =>
          byType("View")(node) &&
          flatStyle(node)["flex"] === 1 &&
          hasNode(
            node,
            (child) =>
              child.props["accessibilityLabel"] === "DNS Resolver unreachable",
          ) &&
          hasNode(
            node,
            (child) =>
              child.props["accessibilityLabel"] === "Retry" &&
              child.props["accessibilityRole"] === "button",
          ),
      );
      expect(textColumns.length).toBeGreaterThan(0);
      const card = tree.root.find(
        (node) =>
          byType("View")(node) && flatStyle(node)["maxHeight"] !== undefined,
      );
      expect(flatStyle(card)["maxHeight"]).toBe(208);
    },
  );

  const renderSettings = async () => {
    const { GlassSettings } =
      require("../src/navigation/screens/GlassSettings") as typeof import("../src/navigation/screens/GlassSettings");
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = track(createWithSuppressedWarnings(h(GlassSettings)));
    });
    return tree;
  };

  it("names forced transport actions by their effect, not just by transport value", async () => {
    const tree = await renderSettings();

    const expected = {
      native: "Native",
      udp: "UDP",
      tcp: "TCP",
    } as const;
    for (const [key, transport] of Object.entries(expected)) {
      const button = tree.root.find(
        byProps({ testID: `settings-force-${key}` }),
      );
      expect(button.props["accessibilityRole"]).toBe("button");
      expect(button.props["accessibilityLabel"]).toBe(
        `Force ${transport} transport`,
      );
      expect(button.props["accessibilityHint"]).toBe(
        `Runs the DNS test using only the ${transport} transport`,
      );
    }
  });

  it("announces transport test results politely and errors assertively", async () => {
    const { DNSService } = jest.requireMock("../src/services/dnsService") as {
      DNSService: { testTransport: jest.Mock };
    };
    const tree = await renderSettings();
    const forceUdp = () =>
      tree.root.find(byProps({ testID: "settings-force-udp" }));

    DNSService.testTransport.mockResolvedValueOnce("pong");
    await act(async () => {
      await forceUdp().props["onPress"]();
    });
    const result = tree.root.find(
      byProps({ accessibilityLiveRegion: "polite" }),
    );
    expect(JSON.stringify(result.find(byType("Text")).props)).toContain("pong");

    DNSService.testTransport.mockRejectedValueOnce(new Error("timeout"));
    await act(async () => {
      await forceUdp().props["onPress"]();
    });
    const failure = tree.root.find(
      byProps({ accessibilityLiveRegion: "assertive" }),
    );
    expect(failure.props["accessibilityRole"]).toBe("alert");
    expect(JSON.stringify(failure.find(byType("Text")).props)).toContain(
      "timeout",
    );
    expect(
      tree.root.findAll(byProps({ accessibilityLiveRegion: "polite" })),
    ).toHaveLength(0);
  });

  it("merges log status into the row label and hides the status pill from assistive tech", async () => {
    mockQueryLogs.splice(0, mockQueryLogs.length, {
      id: "q1",
      query: "redacted",
      startTime: new Date("2026-09-15T12:00:00Z"),
      totalDuration: 120,
      finalStatus: "success",
      finalMethod: "udp",
      entries: [],
    });
    const { Logs } =
      require("../src/navigation/screens/Logs") as typeof import("../src/navigation/screens/Logs");
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = track(createWithSuppressedWarnings(h(Logs)));
    });

    const row = tree.root.find(byProps({ testID: "logs-entry-q1" }));
    expect(row.props["accessibilityRole"]).toBe("button");
    expect(row.props["accessibilityLabel"]).toContain("Status: Succeeded.");
    expect(row.props["accessibilityLabel"]).toContain("Method: UDP.");
    expect(row.props["accessibilityLabel"]).toContain("Duration: 120ms.");

    let pill: ReactTestInstance | null = row.findByType(CheckmarkIcon).parent;
    while (pill && pill.props["importantForAccessibility"] === undefined) {
      pill = pill.parent;
    }
    expect(pill?.props["importantForAccessibility"]).toBe(
      "no-hide-descendants",
    );
    expect(pill?.props["accessible"]).toBe(false);
    expect(row.findAll(byProps({ accessibilityRole: "image" }))).toHaveLength(
      0,
    );
  });

  it("marks web tab icons decorative because tab labels provide the names", () => {
    recordedTabOptions.length = 0;
    const TabsLayout = (
      require("../app/(tabs)/_layout.web") as typeof import("../app/(tabs)/_layout.web")
    ).default;
    render(h(TabsLayout));

    expect(recordedTabOptions).toHaveLength(3);
    for (const options of recordedTabOptions) {
      const icon = render(options.tabBarIcon({ color: "blue" })).root.find(
        byType("Image"),
      );
      expect(icon.props["accessible"]).toBe(false);
      expect(icon.props["accessibilityElementsHidden"]).toBe(true);
      expect(icon.props["importantForAccessibility"]).toBe(
        "no-hide-descendants",
      );
    }
  });
});
