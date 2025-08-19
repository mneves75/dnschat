/**
 * LiquidGlassWrapper - React Native component for iOS 26 SwiftUI Glass Effects
 * 
 * Provides a simple wrapper around the native LiquidGlassView following
 * Apple's SwiftUI .glassEffect() patterns and modern Swift development.
 * 
 * Usage:
 * <LiquidGlassWrapper variant="regular" shape="capsule">
 *   <Text>Your content</Text>
 * </LiquidGlassWrapper>
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import React from 'react';
import { Platform, ViewProps, View, useColorScheme, NativeModules } from 'react-native';
import { requireNativeComponent, UIManager, findNodeHandle } from 'react-native';

// ==================================================================================
// TYPES AND INTERFACES
// ==================================================================================

interface LiquidGlassProps extends ViewProps {
  /** Glass variant: regular, prominent, interactive */
  variant?: 'regular' | 'prominent' | 'interactive';
  
  /** Glass shape: capsule, rect, roundedRect */
  shape?: 'capsule' | 'rect' | 'roundedRect';
  
  /** Corner radius for rect shapes */
  cornerRadius?: number;
  
  /** Tint color (hex string) */
  tintColor?: string;
  
  /** Interactive response to touch */
  isInteractive?: boolean;
  
  /** Environmental sensor adaptation */
  sensorAware?: boolean;
  
  /** Use GlassEffectContainer for performance */
  enableContainer?: boolean;
  
  /** Container merge distance */
  containerSpacing?: number;
  
  /** Children to render inside glass effect */
  children?: React.ReactNode;
}

// ==================================================================================
// iOS VERSION DETECTION FOR LIQUID GLASS GUARANTEE
// ==================================================================================

/**
 * Checks if the current iOS version supports Liquid Glass (iOS 26+)
 * This provides the GUARANTEE requested for iOS/iPadOS 26+ support
 * Memoized for performance optimization
 */
const isIOS26Plus = (() => {
  if (Platform.OS !== 'ios') return false;
  
  const version = Platform.Version;
  if (typeof version === 'string') {
    const majorVersion = parseInt(version.split('.')[0], 10);
    return majorVersion >= 26;
  } else if (typeof version === 'number') {
    return version >= 26;
  }
  
  return false;
})();

/**
 * Gets native iOS 26+ capabilities from the native module
 */
async function getNativeCapabilities(): Promise<{ available: boolean; supportsLiquidGlass: boolean }> {
  try {
    if (!isIOS26Plus) {
      return { available: false, supportsLiquidGlass: false };
    }
    
    const { LiquidGlassNativeModule } = NativeModules;
    if (!LiquidGlassNativeModule) {
      return { available: false, supportsLiquidGlass: false };
    }
    
    const capabilities = await LiquidGlassNativeModule.getCapabilities();
    return {
      available: true,
      supportsLiquidGlass: capabilities?.supportsLiquidGlass ?? false
    };
  } catch (error) {
    console.warn('🚨 Failed to get native iOS 26+ capabilities:', error);
    return { available: false, supportsLiquidGlass: false };
  }
}

// ==================================================================================
// NATIVE COMPONENT
// ==================================================================================

// Native view component registration for iOS 26+ Liquid Glass (TEMPORARILY DISABLED)
// const NativeLiquidGlassView = requireNativeComponent<LiquidGlassProps>('LiquidGlassView');

// ==================================================================================
// REACT COMPONENT
// ==================================================================================

/**
 * LiquidGlassWrapper - Main React Native component
 */
export const LiquidGlassWrapper: React.FC<LiquidGlassProps> = ({
  variant = 'regular',
  shape = 'capsule',
  cornerRadius = 12,
  tintColor = '',
  isInteractive = false,
  sensorAware = false,
  enableContainer = true,
  containerSpacing = 40,
  children,
  style,
  ...props
}) => {
  const glassViewRef = React.useRef<any>(null);
  
  // IMPORTANT: Always call useColorScheme at the top level to avoid hooks ordering issues
  const colorScheme = useColorScheme();
  
  // Non-iOS platforms get no glass effects
  if (Platform.OS !== 'ios') {
    return <>{children}</>;
  }

  // 🚨 CRITICAL: iOS 26+ NATIVE LIQUID GLASS GUARANTEE
  // TEMPORARY: Using CSS fallback due to native component registration conflict
  if (false && isIOS26Plus) {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }
  
  // Enhanced CSS fallback with glass-like effects
  const isDark = colorScheme === 'dark';
  
  const glassStyle = {
    backgroundColor: (() => {
      if (isDark) {
        switch (variant) {
          case 'prominent': return 'rgba(40, 40, 42, 0.98)'; // More opaque dark gray
          case 'interactive': return 'rgba(255, 69, 58, 0.3)'; // Stronger Notion red accent
          default: return 'rgba(28, 28, 30, 0.95)'; // More opaque system dark
        }
      } else {
        switch (variant) {
          case 'prominent': return 'rgba(255, 255, 255, 0.15)'; // Translucent white glass
          case 'interactive': return 'rgba(0, 122, 255, 0.25)'; // iOS system blue accent
          default: return 'rgba(248, 249, 250, 0.1)'; // Very translucent light glass
        }
      }
    })(),
    borderRadius: (() => {
      switch (shape) {
        case 'capsule': return 24; // More modern radius
        case 'roundedRect': return cornerRadius || 16; // Default 16px
        case 'rect': return 0;
        default: return 12;
      }
    })(),
    borderWidth: isDark ? 2 : 1, // Stronger borders
    borderColor: isDark 
      ? 'rgba(255, 255, 255, 0.2)' // More visible white border in dark
      : 'rgba(0, 0, 0, 0.12)', // More visible dark border in light
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: isDark ? 12 : 8 }, // Larger shadow offset
    shadowOpacity: isDark ? 0.6 : 0.15, // Much stronger shadows
    shadowRadius: isDark ? 24 : 18, // Larger blur radius
    elevation: 12, // Higher Android elevation
    // Add glassmorphism effect
    backdropFilter: 'blur(20px)', // CSS glassmorphism (web/newer RN)
    ...(Platform.OS === 'ios' && {
      // iOS-specific blur enhancement
      overflow: 'hidden',
    }),
    // Modern interaction states with dramatic effects
    ...(isInteractive && {
      backgroundColor: isDark 
        ? 'rgba(255, 69, 58, 0.35)' // Stronger red interaction in dark
        : 'rgba(0, 122, 255, 0.3)', // iOS system blue interaction in light
      shadowOpacity: isDark ? 0.7 : 0.2, // Much stronger interactive shadows
      shadowRadius: isDark ? 28 : 22, // Larger interactive blur
      elevation: 16, // Higher interactive elevation
      borderWidth: isDark ? 3 : 2, // Even stronger borders when interactive
    }),
    // Prominent variant gets dramatic elevation
    ...(variant === 'prominent' && {
      shadowOffset: { width: 0, height: isDark ? 16 : 12 }, // Much larger prominent shadow
      shadowOpacity: isDark ? 0.7 : 0.2, // Stronger prominent shadows
      shadowRadius: isDark ? 32 : 24, // Largest blur radius for prominent
      elevation: 20, // Highest elevation for prominent
      borderWidth: isDark ? 3 : 2, // Stronger borders for prominent
    }),
  };

  return (
    <View style={[glassStyle, style]} {...props}>
      {children}
    </View>
  );
};

// ==================================================================================
// UTILITY HOOKS
// ==================================================================================

/**
 * Hook for accessing native glass capabilities
 */
export const useLiquidGlassCapabilities = () => {
  // Enable glass effects with fallback rendering (avoiding native module)
  const capabilities = {
    available: true,
    platform: "ios",
    fallbackMode: true, // Using CSS-like fallback instead of native
    iosVersion: "26.0"
  };
  const loading = false;
  
  return {
    capabilities,
    loading,
    isSupported: Platform.OS === 'ios', // Enable on iOS
    supportsSwiftUIGlass: false, // Native module disabled
    iosVersion: "26.0",
  };
};

// ==================================================================================
// CONVENIENCE COMPONENTS
// ==================================================================================

/**
 * Pre-configured glass button
 */
export const LiquidGlassButton: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper
    variant="interactive"
    shape="capsule"
    isInteractive={true}
    {...props}
  />
);

/**
 * Pre-configured glass card
 */
export const LiquidGlassCard: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper
    variant="regular"
    shape="roundedRect"
    cornerRadius={16}
    enableContainer={true}
    {...props}
  />
);

/**
 * Pre-configured glass navigation bar
 */
export const LiquidGlassNavBar: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper
    variant="prominent"
    shape="rect"
    enableContainer={true}
    sensorAware={true}
    {...props}
  />
);

// ==================================================================================
// EXPORTS
// ==================================================================================

export default LiquidGlassWrapper;

export type { LiquidGlassProps };