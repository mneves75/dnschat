/**
 * LiquidGlassWrapper - Official Expo GlassEffect wrapper (iOS 26+)
 *
 * Maps our lightweight props to Expo's GlassView so the rest of the
 * app can stay unchanged while using the official implementation.
 */

import React from 'react';
import { Platform, View, ViewProps, ViewStyle, useColorScheme } from 'react-native';
import { GlassView } from 'expo-glass-effect';

export interface LiquidGlassProps extends ViewProps {
  variant?: 'regular' | 'prominent' | 'interactive';
  shape?: 'capsule' | 'rect' | 'roundedRect';
  cornerRadius?: number;
  tintColor?: string;
  isInteractive?: boolean;
  children?: React.ReactNode;
}

const isIOS26Plus = (() => {
  if (Platform.OS !== 'ios') return false;
  const v = Platform.Version as string | number;
  const major = typeof v === 'string' ? parseInt(v.split('.')[0], 10) : v;
  return Number(major) >= 26;
})();

export const LiquidGlassWrapper: React.FC<LiquidGlassProps> = ({
  variant = 'regular',
  shape = 'capsule',
  cornerRadius = 12,
  tintColor,
  isInteractive = false,
  children,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const radius = shape === 'rect' ? 0 : shape === 'capsule' ? 999 : cornerRadius;
  const baseStyle: ViewStyle = { borderRadius: radius };

  if (Platform.OS === 'ios' && isIOS26Plus) {
    const glassEffectStyle: 'regular' | 'clear' = variant === 'prominent' ? 'clear' : 'regular';
    return (
      <GlassView
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        isInteractive={!!isInteractive}
        style={[baseStyle, style]}
        {...props}
      >
        {children}
      </GlassView>
    );
  }

  const materialPalette =
    colorScheme === 'dark'
      ? {
          surface: '#1F1B24',
          surfaceContainer: '#211F26',
          surfaceContainerHigh: '#2B2733',
          outline: '#938F99',
          primary: '#D0BCFF',
          onPrimary: '#381E72',
        }
      : {
          surface: '#FFFBFE',
          surfaceContainer: '#F3EDF7',
          surfaceContainerHigh: '#E8DEF8',
          outline: '#79747E',
          primary: '#6750A4',
          onPrimary: '#FFFFFF',
        };

  const materialStyle: ViewStyle = (() => {
    switch (variant) {
      case 'prominent':
        return {
          backgroundColor: materialPalette.surface,
          borderColor: Platform.OS === 'android' ? 'transparent' : materialPalette.outline + '30',
          borderWidth: Platform.OS === 'android' ? 0 : 0.5,
          elevation: Platform.OS === 'android' ? 6 : 0,
          shadowColor: Platform.OS === 'android' ? '#000000' : undefined,
        };
      case 'interactive':
        return {
          backgroundColor:
            Platform.OS === 'android' ? materialPalette.primary + '29' : 'rgba(0, 122, 255, 0.12)',
          borderColor: Platform.OS === 'android' ? 'transparent' : materialPalette.outline + '30',
          borderWidth: Platform.OS === 'android' ? 0 : 0.5,
          elevation: Platform.OS === 'android' ? 4 : 0,
          shadowColor: Platform.OS === 'android' ? '#000000' : undefined,
        };
      case 'regular':
      default:
        return {
          backgroundColor: materialPalette.surfaceContainer,
          borderColor: Platform.OS === 'android' ? 'transparent' : materialPalette.outline + '20',
          borderWidth: Platform.OS === 'android' ? 0 : 0.5,
          elevation: Platform.OS === 'android' ? 2 : 0,
          shadowColor: Platform.OS === 'android' ? '#000000' : undefined,
        };
    }
  })();

  return (
    <View style={[baseStyle, materialStyle, style]} {...props}>
      {children}
    </View>
  );
};

export const useLiquidGlassCapabilities = () => {
  const isSupported = Platform.OS === 'ios' && isIOS26Plus;
  return {
    capabilities: {
      available: isSupported,
      supportsLiquidGlass: isSupported,
      supportsGlassEffectContainer: isSupported,
      supportsEnvironmentalAdaptation: isSupported,
    },
    loading: false,
    isSupported,
    supportsNativeLiquidGlass: isSupported,
    iosVersion: Platform.Version,
  } as const;
};

export const LiquidGlassButton: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper variant="interactive" shape="capsule" isInteractive {...props} />
);

export const LiquidGlassCard: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper variant="regular" shape="roundedRect" cornerRadius={16} {...props} />
);

export const LiquidGlassNavBar: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper variant="prominent" shape="rect" {...props} />
);
