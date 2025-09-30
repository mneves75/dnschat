/**
 * Universal Glass View Component
 *
 * Chooses the best glass implementation based on platform capabilities:
 * - iOS 26+: expo-glass-effect native view
 * - Other platforms / versions: LiquidGlassWrapper fallback system
 */

import React from "react";
import { Platform, ViewProps } from "react-native";
import { GlassView } from "expo-glass-effect";
import { LiquidGlassWrapper } from "../LiquidGlassWrapper";
import { useLiquidGlassAvailability } from "./GlassCapabilityBridge";

export interface UniversalGlassViewProps extends ViewProps {
  variant?: "regular" | "prominent" | "interactive";
  shape?: "rect" | "roundedRect" | "capsule";
  cornerRadius?: number;
  tintColor?: string;
  isInteractive?: boolean;
  children?: React.ReactNode;
}

const getLiquidGlassVariant = (
  variant: UniversalGlassViewProps["variant"],
): "regular" | "prominent" | "interactive" => {
  if (variant === "prominent" || variant === "interactive") {
    return variant;
  }
  return "regular";
};

const getLiquidGlassShape = (
  shape: UniversalGlassViewProps["shape"],
): "capsule" | "rect" | "roundedRect" => {
  if (shape === "capsule" || shape === "rect") {
    return shape;
  }
  return "roundedRect";
};

export const UniversalGlassView: React.FC<UniversalGlassViewProps> = ({
  variant = "regular",
  shape = "roundedRect",
  cornerRadius,
  tintColor,
  isInteractive,
  children,
  style,
  ...props
}) => {
  const { available, version } = useLiquidGlassAvailability();

  if (Platform.OS === "ios" && available && version === "ios26") {
    return (
      <GlassView glassEffectStyle="regular" style={style} {...props}>
        {children}
      </GlassView>
    );
  }

  return (
    <LiquidGlassWrapper
      {...props}
      variant={getLiquidGlassVariant(variant)}
      shape={getLiquidGlassShape(shape)}
      cornerRadius={cornerRadius}
      tintColor={tintColor}
      isInteractive={isInteractive}
      style={style}
    >
      {children}
    </LiquidGlassWrapper>
  );
};

