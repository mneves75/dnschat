import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  useColorScheme,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import {
  getLiquidGlassCapabilities,
  type GlassIntensity,
  type LiquidGlassCapabilities,
} from "../../utils/liquidGlass";

export interface LiquidGlassProps extends ViewProps {
  /**
   * Preferred intensity for the glass effect. The hook may adjust this value
   * when running on lower capability devices.
   */
  intensity?: GlassIntensity;

  /** Optional style applied to the underlying glass container. */
  containerStyle?: StyleProp<ViewStyle>;

  /** Allows call sites to opt into sensor-aware styling when available. */
  sensorAware?: boolean;

  /** Allows call sites to opt into environmental adaptation when available. */
  environmentalAdaptation?: boolean;
}

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 16,
    borderWidth: Platform.OS === "ios" ? StyleSheet.hairlineWidth : 0,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  darkContainer: {
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(28,28,30,0.38)",
  },
  modalContainer: {
    padding: 16,
    borderRadius: 20,
  },
  navigationContainer: {
    height: 56,
    justifyContent: "center",
  },
  cardContainer: {
    padding: 20,
  },
  sidebarContainer: {
    width: 320,
  },
});

const combineStyles = (
  base: GlassIntensity,
  colorScheme: "light" | "dark",
): StyleProp<ViewStyle> => {
  const opacity = base === "ultraThin" ? 0.04 : base === "thin" ? 0.06 : 0.1;
  const backgroundColor =
    colorScheme === "dark"
      ? `rgba(28,28,30,${0.35 + opacity})`
      : `rgba(248,248,250,${0.2 + opacity})`;

  return [
    styles.baseContainer,
    colorScheme === "dark" ? styles.darkContainer : null,
    { backgroundColor },
  ];
};

export const LiquidGlassView: React.FC<LiquidGlassProps> = ({
  children,
  intensity = "regular",
  containerStyle,
  style,
  ...rest
}) => {
  const colorScheme = useColorScheme() ?? "light";
  return (
    <View
      {...rest}
      style={[combineStyles(intensity, colorScheme), containerStyle, style]}
    >
      {children}
    </View>
  );
};

export const LiquidGlassNavigation: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassView
    intensity={props.intensity ?? "regular"}
    containerStyle={[styles.navigationContainer, props.containerStyle]}
    {...props}
  />
);

export const LiquidGlassModal: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassView
    intensity={props.intensity ?? "thick"}
    containerStyle={[styles.modalContainer, props.containerStyle]}
    {...props}
  />
);

export const LiquidGlassCard: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassView
    intensity={props.intensity ?? "regular"}
    containerStyle={[styles.cardContainer, props.containerStyle]}
    {...props}
  />
);

export const LiquidGlassSidebar: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassView
    intensity={props.intensity ?? "thin"}
    containerStyle={[styles.sidebarContainer, props.containerStyle]}
    {...props}
  />
);

interface CapabilityState {
  capabilities: LiquidGlassCapabilities | null;
  loading: boolean;
}

export const useLiquidGlassCapabilities = () => {
  const [state, setState] = useState<CapabilityState>({
    capabilities: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const caps = await getLiquidGlassCapabilities();
        if (!cancelled) {
          setState({ capabilities: caps, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("LiquidGlass: capability detection failed", error);
          setState({ capabilities: null, loading: false });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const isSupported = Boolean(state.capabilities?.isSupported);
  const supportsSwiftUIGlass = Boolean(
    state.capabilities?.platform === "ios" &&
      (state.capabilities?.apiLevel ?? 0) >= 260,
  );

  return {
    ...state,
    isSupported,
    supportsSwiftUIGlass,
  };
};

export const useAdaptiveGlassIntensity = (
  baseIntensity: GlassIntensity = "regular",
) => {
  const { capabilities } = useLiquidGlassCapabilities();

  return useMemo<GlassIntensity>(() => {
    if (!capabilities) return baseIntensity;

    if (capabilities.performance.tier === "low") {
      return baseIntensity === "ultraThin" ? "ultraThin" : "thin";
    }

    if (capabilities.performance.tier === "medium") {
      return baseIntensity === "ultraThick" ? "thick" : baseIntensity;
    }

    return baseIntensity;
  }, [baseIntensity, capabilities]);
};

export const LiquidGlassNavigationPlaceholder = LiquidGlassNavigation;
export const LiquidGlassModalPlaceholder = LiquidGlassModal;

export default LiquidGlassView;
