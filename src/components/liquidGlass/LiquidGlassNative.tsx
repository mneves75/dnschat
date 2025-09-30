import React, { forwardRef, useImperativeHandle } from "react";
import { View, ViewProps } from "react-native";
import type { GlassIntensity } from "../../utils/liquidGlass";

export interface LiquidGlassNativeProps extends ViewProps {
  intensity?: GlassIntensity;
  showsSensorEffects?: boolean;
}

export interface LiquidGlassNativeHandle {
  refresh: () => void;
}

export const LiquidGlassNative = forwardRef<LiquidGlassNativeHandle, LiquidGlassNativeProps>(
  ({ children, intensity = "regular", style, ...rest }, ref) => {
    useImperativeHandle(ref, () => ({ refresh: () => undefined }), []);

    return (
      <View {...rest} style={style} accessibilityHint={`glass-intensity-${intensity}`}>
        {children}
      </View>
    );
  },
);

LiquidGlassNative.displayName = "LiquidGlassNative";

export const useLiquidGlassNative = () => ({
  isAvailable: false,
  intensity: "regular" as GlassIntensity,
});

export const useLiquidGlassPerformance = () => ({
  frameRate: 60,
  droppedFrames: 0,
});

export const useLiquidGlassEnvironment = () => ({
  ambientLight: 1,
  deviceFamily: "iPhone" as const,
});

export const isNativeGlassAvailable = () => false;

export const getOptimalNativeConfig = () => ({
  intensity: "regular" as GlassIntensity,
});
