/**
 * Material Glass View - Enhanced Android Material Design 3 Glass Effects
 * 
 * This component provides sophisticated glass and acrylic effects for Android,
 * designed to complement iOS Liquid Glass while maintaining Material Design principles.
 * 
 * Features:
 * - Material 3 elevated surfaces with proper tinting
 * - Glass morphism effects with backdrop blur (when supported)
 * - Dynamic color integration for Android 12+
 * - Performance-optimized rendering
 * - Proper elevation and shadow handling
 * - Cross-platform compatibility
 * 
 * @author DNSChat Team
 * @since v2.2.0 (Material 3 Glass System)
 */

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
  Animated,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useMaterialTheme, Material3Colors } from '../../context/MaterialThemeContext';

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

export type MaterialGlassIntensity = 'ultraLight' | 'light' | 'regular' | 'heavy' | 'ultraHeavy';

export type MaterialGlassVariant = 
  | 'surface'        // Standard elevated surface
  | 'surfaceVariant' // Subtle surface variant
  | 'container'      // Primary container
  | 'card'          // Card-like surface
  | 'modal'         // Modal/dialog surface
  | 'navigation'    // Navigation surface
  | 'toast'         // Toast/snackbar surface
  | 'acrylic';      // Acrylic-style glass effect

export interface MaterialGlassProps {
  /** Children components to render with glass effect */
  children: React.ReactNode;
  
  /** Glass effect intensity */
  intensity?: MaterialGlassIntensity;
  
  /** Material glass variant */
  variant?: MaterialGlassVariant;
  
  /** Custom container styling */
  style?: ViewStyle;
  
  /** Enable backdrop blur (when supported) */
  enableBlur?: boolean;
  
  /** Elevation level (0-5) */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  
  /** Corner radius size */
  cornerRadius?: 'none' | 'small' | 'medium' | 'large' | 'extraLarge';
  
  /** Enable dynamic color tinting */
  enableDynamicTint?: boolean;
  
  /** Enable animation effects */
  animated?: boolean;
  
  /** Performance mode */
  performanceMode?: 'auto' | 'high' | 'battery';
  
  /** Debug mode - shows surface information */
  debug?: boolean;
  
  /** Callback when glass effect is applied */
  onGlassEffectApplied?: (variant: MaterialGlassVariant, colors: Material3Colors) => void;
}

interface GlassConfiguration {
  opacity: number;
  blurRadius: number;
  tintOpacity: number;
  borderOpacity: number;
  surfaceColor: string;
  borderColor: string;
}

// ==================================================================================
// GLASS EFFECT CONFIGURATIONS
// ==================================================================================

/**
 * Get glass configuration based on intensity and theme
 */
const getGlassConfiguration = (
  intensity: MaterialGlassIntensity,
  colors: Material3Colors,
  isDark: boolean
): GlassConfiguration => {
  const baseConfigs: Record<MaterialGlassIntensity, GlassConfiguration> = {
    ultraLight: {
      opacity: 0.3,
      blurRadius: 5,
      tintOpacity: 0.1,
      borderOpacity: 0.2,
      surfaceColor: colors.surface,
      borderColor: colors.outline,
    },
    light: {
      opacity: 0.5,
      blurRadius: 10,
      tintOpacity: 0.15,
      borderOpacity: 0.3,
      surfaceColor: colors.surface,
      borderColor: colors.outline,
    },
    regular: {
      opacity: 0.7,
      blurRadius: 15,
      tintOpacity: 0.2,
      borderOpacity: 0.4,
      surfaceColor: colors.surface,
      borderColor: colors.outline,
    },
    heavy: {
      opacity: 0.85,
      blurRadius: 20,
      tintOpacity: 0.25,
      borderOpacity: 0.5,
      surfaceColor: colors.surface,
      borderColor: colors.outline,
    },
    ultraHeavy: {
      opacity: 0.95,
      blurRadius: 30,
      tintOpacity: 0.3,
      borderOpacity: 0.6,
      surfaceColor: colors.surface,
      borderColor: colors.outline,
    },
  };
  
  return baseConfigs[intensity];
};

/**
 * Get variant-specific styling
 */
const getVariantStyle = (
  variant: MaterialGlassVariant,
  colors: Material3Colors,
  isDark: boolean
): Partial<ViewStyle> => {
  const variants: Record<MaterialGlassVariant, Partial<ViewStyle>> = {
    surface: {
      backgroundColor: colors.surface,
    },
    surfaceVariant: {
      backgroundColor: colors.surfaceVariant,
    },
    container: {
      backgroundColor: colors.primaryContainer,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    modal: {
      backgroundColor: colors.surface,
      borderRadius: 16,
    },
    navigation: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    toast: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    acrylic: {
      backgroundColor: colors.glassBackground,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
  };
  
  return variants[variant];
};

// ==================================================================================
// PERFORMANCE DETECTION
// ==================================================================================

/**
 * Simple device performance tier detection
 */
const getDevicePerformanceTier = (): 'high' | 'medium' | 'low' => {
  const { width, height } = Dimensions.get('window');
  const screenSize = width * height;
  
  // Simple heuristic based on screen size and platform
  if (Platform.OS === 'android') {
    if (screenSize > 2000000) return 'high';    // High-end Android devices
    if (screenSize > 1000000) return 'medium';  // Mid-range devices
    return 'low';                               // Budget devices
  }
  
  return 'high'; // iOS devices generally have good performance
};

// ==================================================================================
// MAIN COMPONENT
// ==================================================================================

export const MaterialGlassView: React.FC<MaterialGlassProps> = ({
  children,
  intensity = 'regular',
  variant = 'surface',
  style,
  enableBlur = true,
  elevation = 2,
  cornerRadius = 'medium',
  enableDynamicTint = true,
  animated = false,
  performanceMode = 'auto',
  debug = false,
  onGlassEffectApplied,
}) => {
  const { theme, colors, isDark, getElevationStyle } = useMaterialTheme();
  const colorScheme = useColorScheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [performanceTier] = useState(() => getDevicePerformanceTier());
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  
  // Determine effective performance mode
  const effectivePerformanceMode = useMemo(() => {
    if (performanceMode !== 'auto') return performanceMode;
    return performanceTier === 'low' ? 'battery' : 'high';
  }, [performanceMode, performanceTier]);
  
  // Adjust glass configuration based on performance
  const adjustedIntensity = useMemo(() => {
    if (effectivePerformanceMode === 'battery') {
      const intensityMap: Record<MaterialGlassIntensity, MaterialGlassIntensity> = {
        ultraHeavy: 'heavy',
        heavy: 'regular',
        regular: 'light',
        light: 'ultraLight',
        ultraLight: 'ultraLight',
      };
      return intensityMap[intensity];
    }
    return intensity;
  }, [intensity, effectivePerformanceMode]);
  
  // Get glass configuration
  const glassConfig = useMemo(() => 
    getGlassConfiguration(adjustedIntensity, colors, isDark),
    [adjustedIntensity, colors, isDark]
  );
  
  // Get variant styling
  const variantStyle = useMemo(() => 
    getVariantStyle(variant, colors, isDark),
    [variant, colors, isDark]
  );
  
  // Get elevation styling
  const elevationStyle = useMemo(() => 
    getElevationStyle(`level${elevation}` as keyof typeof theme.elevationLevels),
    [elevation, getElevationStyle, theme.elevationLevels]
  );
  
  // Create final glass style
  const glassStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.cornerRadius[cornerRadius],
      overflow: 'hidden',
      ...variantStyle,
      ...elevationStyle,
    };
    
    // Apply glass effect modifications
    if (variant === 'acrylic' || enableBlur) {
      baseStyle.backgroundColor = `rgba(${isDark ? '16, 19, 24' : '254, 251, 255'}, ${glassConfig.opacity})`;
      
      if (enableBlur && Platform.OS === 'ios') {
        // @ts-ignore - backdropFilter is iOS-specific
        baseStyle.backdropFilter = `blur(${glassConfig.blurRadius}px)`;
      }
      
      if (enableDynamicTint) {
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = `rgba(${isDark ? '143, 144, 153' : '117, 119, 127'}, ${glassConfig.borderOpacity})`;
      }
    }
    
    // Apply performance optimizations
    if (effectivePerformanceMode === 'battery') {
      // Reduce complex styling for battery mode
      delete baseStyle.shadowColor;
      delete baseStyle.shadowOffset;
      delete baseStyle.shadowOpacity;
      delete baseStyle.shadowRadius;
      if (Platform.OS === 'android') {
        baseStyle.elevation = Math.min(baseStyle.elevation || 0, 2);
      }
    }
    
    return baseStyle;
  }, [
    theme.cornerRadius,
    cornerRadius,
    variantStyle,
    elevationStyle,
    variant,
    enableBlur,
    isDark,
    glassConfig,
    enableDynamicTint,
    effectivePerformanceMode,
  ]);
  
  // Animation effect
  useEffect(() => {
    if (animated) {
      setIsLoading(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsLoading(false);
      });
    }
  }, [animated, fadeAnim]);
  
  // Notify callback
  useEffect(() => {
    if (onGlassEffectApplied) {
      onGlassEffectApplied(variant, colors);
    }
  }, [variant, colors, onGlassEffectApplied]);
  
  const containerStyle = [
    styles.container,
    glassStyle,
    style,
  ];
  
  if (animated) {
    return (
      <Animated.View style={[containerStyle, { opacity: fadeAnim }]}>
        {debug && (
          <View style={styles.debugBadge}>
            <View style={[styles.debugIndicator, { backgroundColor: colors.primary }]} />
          </View>
        )}
        {children}
      </Animated.View>
    );
  }
  
  return (
    <View style={containerStyle}>
      {debug && (
        <View style={styles.debugBadge}>
          <View style={[styles.debugIndicator, { backgroundColor: colors.primary }]} />
        </View>
      )}
      {children}
    </View>
  );
};

// ==================================================================================
// SPECIALIZED COMPONENTS
// ==================================================================================

/**
 * Material Card with glass effects
 */
export const MaterialGlassCard: React.FC<Omit<MaterialGlassProps, 'variant'>> = (props) => (
  <MaterialGlassView {...props} variant="card" elevation={1} cornerRadius="large" />
);

/**
 * Material Modal with glass effects
 */
export const MaterialGlassModal: React.FC<Omit<MaterialGlassProps, 'variant'>> = (props) => (
  <MaterialGlassView {...props} variant="modal" elevation={3} cornerRadius="extraLarge" />
);

/**
 * Material Navigation surface with glass effects
 */
export const MaterialGlassNavigation: React.FC<Omit<MaterialGlassProps, 'variant'>> = (props) => (
  <MaterialGlassView {...props} variant="navigation" elevation={2} cornerRadius="none" />
);

/**
 * Material Toast with glass effects
 */
export const MaterialGlassToast: React.FC<Omit<MaterialGlassProps, 'variant'>> = (props) => (
  <MaterialGlassView {...props} variant="toast" elevation={3} cornerRadius="small" animated />
);

/**
 * Material Acrylic surface
 */
export const MaterialAcrylicView: React.FC<Omit<MaterialGlassProps, 'variant'>> = (props) => (
  <MaterialGlassView 
    {...props} 
    variant="acrylic" 
    enableBlur={true} 
    intensity="regular"
    elevation={2}
  />
);

// ==================================================================================
// HOOKS
// ==================================================================================

/**
 * Hook for creating custom glass effects
 */
export const useMaterialGlassStyle = (
  intensity: MaterialGlassIntensity = 'regular',
  variant: MaterialGlassVariant = 'surface'
) => {
  const { colors, isDark, theme, getElevationStyle } = useMaterialTheme();
  
  return useMemo(() => {
    const glassConfig = getGlassConfiguration(intensity, colors, isDark);
    const variantStyle = getVariantStyle(variant, colors, isDark);
    const elevationStyle = getElevationStyle('level2');
    
    return {
      ...variantStyle,
      ...elevationStyle,
      borderRadius: theme.cornerRadius.medium,
      backgroundColor: `${colors.surface}${Math.round(glassConfig.opacity * 255).toString(16).padStart(2, '0')}`,
      borderWidth: 1,
      borderColor: `${colors.outline}${Math.round(glassConfig.borderOpacity * 255).toString(16).padStart(2, '0')}`,
    };
  }, [intensity, variant, colors, isDark, theme, getElevationStyle]);
};

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  
  debugBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1000,
  },
  
  debugIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default MaterialGlassView;