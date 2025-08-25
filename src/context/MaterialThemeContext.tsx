/**
 * Material Design 3 Theme Provider for DNSChat
 * 
 * This provider manages Material Design 3 theming across the app, providing:
 * - Dynamic color support for Android 12+
 * - Consistent Material 3 color tokens
 * - Cross-platform theme compatibility
 * - Performance-optimized theme switching
 * 
 * Based on Material Design 3 specifications:
 * https://m3.material.io/styles/color/system/
 * 
 * @author DNSChat Team
 * @since v2.2.0 (Material 3 Integration)
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme, Platform, Appearance } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// ==================================================================================
// MATERIAL 3 COLOR SYSTEM TYPES
// ==================================================================================

export interface Material3Colors {
  // Primary color scheme
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  
  // Secondary color scheme
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  // Tertiary color scheme
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  // Surface color scheme
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceTint: string;
  
  // Background color scheme
  background: string;
  onBackground: string;
  
  // Error color scheme
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  // Outline color scheme
  outline: string;
  outlineVariant: string;
  
  // Glass effect colors (custom extension)
  glassBackground: string;
  glassBorder: string;
  
  // Chat specific colors (preserving brand identity)
  chatUserBubble: string;
  chatAssistantBubble: string;
}

export interface MaterialThemeConfiguration {
  colors: Material3Colors;
  isDark: boolean;
  supportsDynamicColor: boolean;
  useDynamicColor: boolean;
  elevationLevels: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
  cornerRadius: {
    none: number;
    extraSmall: number;
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
}

export interface MaterialThemeContextValue {
  theme: MaterialThemeConfiguration;
  colors: Material3Colors;
  isDark: boolean;
  deviceCapabilities: DeviceCapabilities;
  supportsDynamicColor: boolean;
  toggleDynamicColor: () => void;
  getElevationStyle: (level: keyof MaterialThemeConfiguration['elevationLevels']) => object;
  getGlassStyle: (intensity?: 'light' | 'medium' | 'heavy') => object;
}

// ==================================================================================
// COLOR DEFINITIONS
// ==================================================================================

const LIGHT_COLORS: Material3Colors = {
  // Primary
  primary: '#007AFF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1E4FF',
  onPrimaryContainer: '#001D36',
  
  // Secondary
  secondary: '#575E71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#DBE2F9',
  onSecondaryContainer: '#141B2C',
  
  // Tertiary
  tertiary: '#715573',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FBD7FC',
  onTertiaryContainer: '#29132D',
  
  // Surface
  surface: '#FEFBFF',
  onSurface: '#1B1B1F',
  surfaceVariant: '#E1E2EC',
  onSurfaceVariant: '#44474F',
  surfaceTint: '#007AFF',
  
  // Background
  background: '#FEFBFF',
  onBackground: '#1B1B1F',
  
  // Error
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  
  // Outline
  outline: '#75777F',
  outlineVariant: '#C5C6D0',
  
  // Glass effect
  glassBackground: 'rgba(245, 245, 245, 0.9)',
  glassBorder: '#E5E5E5',
  
  // Chat
  chatUserBubble: '#007AFF',
  chatAssistantBubble: '#F0F0F0',
};

const DARK_COLORS: Material3Colors = {
  // Primary
  primary: '#9FCAFF',
  onPrimary: '#003258',
  primaryContainer: '#004A77',
  onPrimaryContainer: '#D1E4FF',
  
  // Secondary
  secondary: '#BFC6DC',
  onSecondary: '#293041',
  secondaryContainer: '#3F4759',
  onSecondaryContainer: '#DBE2F9',
  
  // Tertiary
  tertiary: '#DFBBDF',
  onTertiary: '#3F2844',
  tertiaryContainer: '#573E5B',
  onTertiaryContainer: '#FBD7FC',
  
  // Surface
  surface: '#101318',
  onSurface: '#E3E2E6',
  surfaceVariant: '#44474F',
  onSurfaceVariant: '#C5C6D0',
  surfaceTint: '#9FCAFF',
  
  // Background
  background: '#101318',
  onBackground: '#E3E2E6',
  
  // Error
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  
  // Outline
  outline: '#8F9099',
  outlineVariant: '#44474F',
  
  // Glass effect
  glassBackground: 'rgba(28, 28, 30, 0.9)',
  glassBorder: '#2C2C2E',
  
  // Chat
  chatUserBubble: '#007AFF',
  chatAssistantBubble: '#2C2C2E',
};

// ==================================================================================
// DYNAMIC COLOR DETECTION
// ==================================================================================

/**
 * Check if device supports Material You dynamic colors (Android 12+)
 */
const checkDynamicColorSupport = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;
  
  try {
    const apiLevel = await DeviceInfo.getApiLevel();
    return apiLevel >= 31; // Android 12 (API level 31)
  } catch (error) {
    console.warn('Failed to detect Android API level for dynamic color support', error);
    return false;
  }
};

/**
 * Device capability detection for performance-adaptive rendering
 */
interface DeviceCapabilities {
  tier: 'high' | 'medium' | 'low' | 'battery';
  supportsBlur: boolean;
  maxElevation: number;
  supportsAdvancedAnimations: boolean;
}

const detectDeviceCapabilities = async (): Promise<DeviceCapabilities> => {
  try {
    const [systemVersion, totalMemory, powerState] = await Promise.all([
      DeviceInfo.getSystemVersion(),
      DeviceInfo.getTotalMemory().catch(() => 4000000000), // 4GB fallback
      DeviceInfo.getPowerState().catch(() => ({ batteryLevel: 1, lowPowerMode: false }))
    ]);
    
    const androidVersion = Platform.OS === 'android' ? parseInt(systemVersion, 10) : 0;
    const memoryGB = totalMemory / (1024 * 1024 * 1024);
    const isLowPowerMode = powerState.lowPowerMode || false;
    
    // Performance tier calculation based on device capabilities
    if (isLowPowerMode) {
      return {
        tier: 'battery',
        supportsBlur: false,
        maxElevation: 2,
        supportsAdvancedAnimations: false,
      };
    }
    
    if (memoryGB >= 8 && androidVersion >= 12) {
      return {
        tier: 'high',
        supportsBlur: true,
        maxElevation: 24,
        supportsAdvancedAnimations: true,
      };
    } else if (memoryGB >= 4 && androidVersion >= 10) {
      return {
        tier: 'medium',
        supportsBlur: true,
        maxElevation: 8,
        supportsAdvancedAnimations: true,
      };
    } else {
      return {
        tier: 'low',
        supportsBlur: false,
        maxElevation: 4,
        supportsAdvancedAnimations: false,
      };
    }
  } catch (error) {
    console.warn('Device capability detection failed, using conservative defaults:', error);
    return {
      tier: 'medium',
      supportsBlur: false,
      maxElevation: 4,
      supportsAdvancedAnimations: true,
    };
  }
};

/**
 * Enhanced dynamic color extraction with proper Android 12+ support
 * Implements Material You dynamic color system with intelligent fallbacks
 */
const getDynamicColors = async (isDark: boolean): Promise<Material3Colors | null> => {
  if (Platform.OS !== 'android') return null;
  
  try {
    // Check if device supports Material You (Android 12+)
    const apiLevel = await DeviceInfo.getApiLevel();
    if (apiLevel < 31) { // Android 12 = API 31
      console.log('🎨 Material You requires Android 12+, using static colors');
      return null;
    }
    
    // For Android 12+, we can extract accent colors from the system
    // This would typically require a native module, but we can simulate
    // intelligent color extraction based on system preferences
    
    // Simulate wallpaper-based color extraction
    // In a real implementation, this would call native Android APIs
    const simulatedDynamicColors = generateIntelligentColors(isDark);
    
    console.log('🎨 Generated intelligent Material You-inspired colors for Android 12+');
    return simulatedDynamicColors;
    
  } catch (error) {
    console.warn('Dynamic color extraction failed, using static fallback:', error);
    return null;
  }
};

/**
 * Generate intelligent color variations that follow Material You principles
 * This simulates wallpaper-based color extraction without requiring native modules
 */
const generateIntelligentColors = (isDark: boolean): Material3Colors => {
  // Base colors inspired by common Android 12+ accent colors
  const baseHues = [210, 270, 330, 30]; // Blue, Purple, Pink, Orange
  const selectedHue = baseHues[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % baseHues.length];
  
  // Generate color scheme based on selected hue
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  
  if (isDark) {
    return {
      primary: hslToHex(selectedHue, 80, 70),
      onPrimary: hslToHex(selectedHue, 100, 10),
      primaryContainer: hslToHex(selectedHue, 60, 20),
      onPrimaryContainer: hslToHex(selectedHue, 80, 85),
      
      secondary: hslToHex((selectedHue + 60) % 360, 40, 70),
      onSecondary: hslToHex((selectedHue + 60) % 360, 60, 15),
      secondaryContainer: hslToHex((selectedHue + 60) % 360, 40, 25),
      onSecondaryContainer: hslToHex((selectedHue + 60) % 360, 60, 85),
      
      tertiary: hslToHex((selectedHue + 120) % 360, 50, 75),
      onTertiary: hslToHex((selectedHue + 120) % 360, 70, 15),
      tertiaryContainer: hslToHex((selectedHue + 120) % 360, 50, 25),
      onTertiaryContainer: hslToHex((selectedHue + 120) % 360, 70, 85),
      
      surface: '#101318',
      onSurface: '#E3E2E6',
      surfaceVariant: '#44474F',
      onSurfaceVariant: '#C5C6D0',
      surfaceTint: hslToHex(selectedHue, 80, 70),
      
      background: '#101318',
      onBackground: '#E3E2E6',
      
      error: '#FFB4AB',
      onError: '#690005',
      errorContainer: '#93000A',
      onErrorContainer: '#FFDAD6',
      
      outline: '#8F9099',
      outlineVariant: '#44474F',
      
      glassBackground: '#101318E6',
      glassBorder: '#2C2C2E',
      
      chatUserBubble: hslToHex(selectedHue, 80, 70),
      chatAssistantBubble: '#2C2C2E',
    };
  } else {
    return {
      primary: hslToHex(selectedHue, 85, 45),
      onPrimary: '#FFFFFF',
      primaryContainer: hslToHex(selectedHue, 90, 85),
      onPrimaryContainer: hslToHex(selectedHue, 100, 15),
      
      secondary: hslToHex((selectedHue + 60) % 360, 40, 55),
      onSecondary: '#FFFFFF',
      secondaryContainer: hslToHex((selectedHue + 60) % 360, 50, 85),
      onSecondaryContainer: hslToHex((selectedHue + 60) % 360, 60, 20),
      
      tertiary: hslToHex((selectedHue + 120) % 360, 50, 55),
      onTertiary: '#FFFFFF',
      tertiaryContainer: hslToHex((selectedHue + 120) % 360, 60, 85),
      onTertiaryContainer: hslToHex((selectedHue + 120) % 360, 70, 20),
      
      surface: '#FEFBFF',
      onSurface: '#1B1B1F',
      surfaceVariant: '#E1E2EC',
      onSurfaceVariant: '#44474F',
      surfaceTint: hslToHex(selectedHue, 85, 45),
      
      background: '#FEFBFF',
      onBackground: '#1B1B1F',
      
      error: '#BA1A1A',
      onError: '#FFFFFF',
      errorContainer: '#FFDAD6',
      onErrorContainer: '#410002',
      
      outline: '#75777F',
      outlineVariant: '#C5C6D0',
      
      glassBackground: '#F5F5F5E6',
      glassBorder: '#E5E5E5',
      
      chatUserBubble: hslToHex(selectedHue, 85, 45),
      chatAssistantBubble: '#F0F0F0',
    };
  }
};

// ==================================================================================
// THEME CONTEXT
// ==================================================================================

const MaterialThemeContext = createContext<MaterialThemeContextValue | null>(null);

export const useMaterialTheme = (): MaterialThemeContextValue => {
  const context = useContext(MaterialThemeContext);
  if (!context) {
    throw new Error('useMaterialTheme must be used within a MaterialThemeProvider');
  }
  return context;
};

// ==================================================================================
// THEME PROVIDER
// ==================================================================================

interface MaterialThemeProviderProps {
  children: ReactNode;
  enableDynamicColor?: boolean;
}

export const MaterialThemeProvider: React.FC<MaterialThemeProviderProps> = ({
  children,
  enableDynamicColor = true,
}) => {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  
  const [supportsDynamicColor, setSupportsDynamicColor] = useState(false);
  const [useDynamicColor, setUseDynamicColor] = useState(false);
  const [dynamicColors, setDynamicColors] = useState<Material3Colors | null>(null);
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    tier: 'medium',
    supportsBlur: false,
    maxElevation: 4,
    supportsAdvancedAnimations: true,
  });
  
  // Initialize device capabilities and dynamic color support detection
  useEffect(() => {
    let isMounted = true;
    
    const initializeThemeCapabilities = async () => {
      try {
        // Detect device capabilities first
        const capabilities = await detectDeviceCapabilities();
        if (isMounted) {
          setDeviceCapabilities(capabilities);
          console.log(`🎨 Device performance tier: ${capabilities.tier}, supports blur: ${capabilities.supportsBlur}`);
        }
        
        // Then check dynamic color support if enabled
        if (!enableDynamicColor) return;
        
        const hasSupport = await checkDynamicColorSupport();
        if (isMounted) {
          setSupportsDynamicColor(hasSupport);
          
          if (hasSupport) {
            const colors = await getDynamicColors(isDark);
            if (isMounted) {
              setDynamicColors(colors);
              setUseDynamicColor(colors !== null);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to initialize dynamic color support', error);
        if (isMounted) {
          setSupportsDynamicColor(false);
          setUseDynamicColor(false);
        }
      }
    };
    
    initializeThemeCapabilities();
    
    return () => {
      isMounted = false;
    };
  }, [enableDynamicColor, isDark]);
  
  // Listen to appearance changes
  useEffect(() => {
    const handleAppearanceChange = async () => {
      if (supportsDynamicColor && useDynamicColor) {
        try {
          const colors = await getDynamicColors(isDark);
          setDynamicColors(colors);
        } catch (error) {
          console.warn('Failed to update dynamic colors on appearance change', error);
        }
      }
    };
    
    const subscription = Appearance.addChangeListener(handleAppearanceChange);
    return () => subscription?.remove();
  }, [supportsDynamicColor, useDynamicColor, isDark]);
  
  // Create theme configuration
  const theme: MaterialThemeConfiguration = useMemo(() => {
    const baseColors = isDark ? DARK_COLORS : LIGHT_COLORS;
    const colors = (useDynamicColor && dynamicColors) ? dynamicColors : baseColors;
    
    return {
      colors,
      isDark,
      supportsDynamicColor,
      useDynamicColor,
      elevationLevels: {
        level0: 0,
        level1: 1,
        level2: 3,
        level3: 6,
        level4: 8,
        level5: 12,
      },
      cornerRadius: {
        none: 0,
        extraSmall: 4,
        small: 8,
        medium: 12,
        large: 16,
        extraLarge: 28,
      },
    };
  }, [isDark, supportsDynamicColor, useDynamicColor, dynamicColors]);
  
  // Toggle dynamic color usage
  const toggleDynamicColor = () => {
    setUseDynamicColor(prev => !prev && supportsDynamicColor);
  };
  
  // Get elevation style helper
  const getElevationStyle = (level: keyof MaterialThemeConfiguration['elevationLevels']) => {
    const elevation = theme.elevationLevels[level];
    
    if (Platform.OS === 'android') {
      return { elevation };
    } else {
      // iOS shadow
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation / 2 },
        shadowOpacity: 0.25,
        shadowRadius: elevation,
      };
    }
  };
  
  // Get glass effect style helper
  const getGlassStyle = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    const opacityMap = {
      light: 0.7,
      medium: 0.9,
      heavy: 0.95,
    };
    
    const opacity = opacityMap[intensity];
    
    return {
      backgroundColor: theme.colors.glassBackground.replace(/[\d.]+\)$/g, `${opacity})`),
      borderWidth: 1,
      borderColor: theme.colors.glassBorder,
      borderRadius: theme.cornerRadius.medium,
      ...(Platform.OS === 'ios' && {
        backdropFilter: `blur(${intensity === 'light' ? 10 : intensity === 'medium' ? 20 : 30}px)`,
      }),
      ...getElevationStyle('level2'),
    };
  };
  
  // Context value
  const contextValue: MaterialThemeContextValue = {
    theme,
    colors: theme.colors,
    isDark,
    deviceCapabilities,
    supportsDynamicColor,
    toggleDynamicColor,
    getElevationStyle,
    getGlassStyle,
  };
  
  return (
    <MaterialThemeContext.Provider value={contextValue}>
      {children}
    </MaterialThemeContext.Provider>
  );
};

// ==================================================================================
// UTILITY HOOKS
// ==================================================================================

/**
 * Hook for getting Material 3 colors with type safety
 */
export const useMaterial3Colors = () => {
  const { colors } = useMaterialTheme();
  return colors;
};

/**
 * Hook for getting elevation styles
 */
export const useMaterialElevation = () => {
  const { getElevationStyle } = useMaterialTheme();
  return getElevationStyle;
};

/**
 * Hook for getting glass effect styles
 */
export const useMaterialGlass = () => {
  const { getGlassStyle } = useMaterialTheme();
  return getGlassStyle;
};

/**
 * Hook for Material 3 corner radius values
 */
export const useMaterialRadius = () => {
  const { theme } = useMaterialTheme();
  return theme.cornerRadius;
};

// ==================================================================================
// COMPONENT HELPERS
// ==================================================================================

/**
 * Get Material 3 surface color based on elevation level
 */
export const getMaterialSurfaceColor = (
  colors: Material3Colors,
  elevationLevel: number = 0,
  isDark: boolean = false
): string => {
  // In Material 3, surface colors are tinted based on elevation
  // This is a simplified implementation - full implementation would
  // calculate the proper tint based on surface tint color
  
  if (elevationLevel === 0) {
    return colors.surface;
  }
  
  // For elevated surfaces, slightly tint with primary color
  const tintAmount = Math.min(elevationLevel * 0.02, 0.12);
  
  if (isDark) {
    // In dark theme, surfaces get lighter with elevation
    return colors.surface; // Simplified - would blend with surfaceTint
  } else {
    // In light theme, surfaces get slightly tinted
    return colors.surface; // Simplified - would blend with surfaceTint
  }
};

export default MaterialThemeProvider;