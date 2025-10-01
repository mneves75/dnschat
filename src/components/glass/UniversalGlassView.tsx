/**
 * Universal Glass View Component
 *
 * @deprecated This component is deprecated and will be removed in v3.0.0.
 * Use LiquidGlassWrapper directly instead.
 *
 * UniversalGlassView was created to wrap expo-glass-effect, but our custom
 * LiquidGlassWrapper implementation is superior:
 * - Environmental adaptation (ambient light, device orientation)
 * - Thermal state monitoring
 * - GlassEffectContainer optimization
 * - Better material variants (regular, prominent, interactive)
 * - Enhanced fallback system for non-iOS platforms
 *
 * Migration guide:
 * ```tsx
 * // Before
 * <UniversalGlassView variant="regular" shape="roundedRect">
 *   {children}
 * </UniversalGlassView>
 *
 * // After
 * <LiquidGlassWrapper variant="regular" shape="roundedRect" enableContainer={true}>
 *   {children}
 * </LiquidGlassWrapper>
 * ```
 */

import React, { useEffect } from "react";
import { ViewProps } from "react-native";
import { LiquidGlassWrapper } from "../LiquidGlassWrapper";

/**
 * @deprecated Use LiquidGlassWrapper instead. This will be removed in v3.0.0
 */
export interface UniversalGlassViewProps extends ViewProps {
  variant?: "regular" | "prominent" | "interactive";
  shape?: "rect" | "roundedRect" | "capsule";
  cornerRadius?: number;
  tintColor?: string;
  isInteractive?: boolean;
  children?: React.ReactNode;
}

/**
 * @deprecated Use LiquidGlassWrapper directly instead.
 * This component will be removed in v3.0.0
 */
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
  useEffect(() => {
    console.warn(
      '[DEPRECATED] UniversalGlassView is deprecated and will be removed in v3.0.0. ' +
      'Use LiquidGlassWrapper instead for superior glass effects with environmental adaptation, ' +
      'thermal monitoring, and GlassEffectContainer optimization. ' +
      'See migration guide in component documentation.'
    );
  }, []);

  return (
    <LiquidGlassWrapper
      {...props}
      variant={variant}
      shape={shape}
      cornerRadius={cornerRadius}
      tintColor={tintColor}
      isInteractive={isInteractive}
      enableContainer={true}
      style={style}
    >
      {children}
    </LiquidGlassWrapper>
  );
};

