/**
 * Material Design 3 Button Component
 * 
 * Implements Material 3 button specifications with proper theming,
 * elevation, and interaction states.
 * 
 * @author DNSChat Team
 * @since v2.2.0 (Material 3 Components)
 */

import React, { useState, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useMaterialTheme } from '../../context/MaterialThemeContext';

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

export type MaterialButtonVariant = 
  | 'filled'           // Primary filled button
  | 'filledTonal'      // Tonal filled button
  | 'outlined'         // Outlined button
  | 'text'            // Text button
  | 'elevated';       // Elevated button

export type MaterialButtonSize = 'small' | 'medium' | 'large';

export interface MaterialButtonProps {
  /** Button text content */
  children: React.ReactNode;
  
  /** Button variant style */
  variant?: MaterialButtonVariant;
  
  /** Button size */
  size?: MaterialButtonSize;
  
  /** Whether button is disabled */
  disabled?: boolean;
  
  /** Whether button is in loading state */
  loading?: boolean;
  
  /** Whether button takes full width */
  fullWidth?: boolean;
  
  /** Custom container style */
  style?: ViewStyle;
  
  /** Custom text style */
  textStyle?: TextStyle;
  
  /** Icon to display (optional) */
  icon?: React.ReactNode;
  
  /** Icon position */
  iconPosition?: 'left' | 'right';
  
  /** Press handler */
  onPress?: () => void;
  
  /** Long press handler */
  onLongPress?: () => void;
  
  /** Test ID for testing */
  testID?: string;
}

// ==================================================================================
// MAIN COMPONENT
// ==================================================================================

export const MaterialButton: React.FC<MaterialButtonProps> = ({
  children,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  onPress,
  onLongPress,
  testID,
}) => {
  const { colors, theme, getElevationStyle } = useMaterialTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  // Get size configuration
  const sizeConfig = useMemo(() => {
    const sizes = {
      small: {
        height: 32,
        paddingHorizontal: 12,
        fontSize: 14,
        iconSize: 16,
      },
      medium: {
        height: 40,
        paddingHorizontal: 16,
        fontSize: 16,
        iconSize: 18,
      },
      large: {
        height: 48,
        paddingHorizontal: 20,
        fontSize: 18,
        iconSize: 20,
      },
    };
    return sizes[size];
  }, [size]);
  
  // Get variant styling
  const variantStyle = useMemo((): { container: ViewStyle; text: TextStyle } => {
    const variants = {
      filled: {
        container: {
          backgroundColor: disabled ? colors.outline : colors.primary,
          borderWidth: 0,
          ...getElevationStyle('level0'),
        },
        text: {
          color: disabled ? colors.onSurface : colors.onPrimary,
          fontWeight: '600' as const,
        },
      },
      filledTonal: {
        container: {
          backgroundColor: disabled ? colors.outline : colors.secondaryContainer,
          borderWidth: 0,
          ...getElevationStyle('level0'),
        },
        text: {
          color: disabled ? colors.onSurface : colors.onSecondaryContainer,
          fontWeight: '600' as const,
        },
      },
      outlined: {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.outline : colors.outline,
          ...getElevationStyle('level0'),
        },
        text: {
          color: disabled ? colors.onSurface : colors.primary,
          fontWeight: '500' as const,
        },
      },
      text: {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 0,
          ...getElevationStyle('level0'),
        },
        text: {
          color: disabled ? colors.onSurface : colors.primary,
          fontWeight: '500' as const,
        },
      },
      elevated: {
        container: {
          backgroundColor: disabled ? colors.outline : colors.surface,
          borderWidth: 0,
          ...getElevationStyle('level1'),
        },
        text: {
          color: disabled ? colors.onSurface : colors.primary,
          fontWeight: '500' as const,
        },
      },
    };
    return variants[variant];
  }, [variant, disabled, colors, getElevationStyle]);
  
  // Handle press interactions
  const handlePressIn = () => {
    setIsPressed(true);
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
  };
  
  // Create press state styling
  const pressedStyle = useMemo((): ViewStyle => {
    if (!isPressed || disabled) return {};
    
    const overlay = {
      opacity: 0.12,
    };
    
    if (variant === 'filled' || variant === 'filledTonal') {
      return {
        backgroundColor: colors.onPrimary,
        ...overlay,
      };
    } else {
      return {
        backgroundColor: colors.primary,
        ...overlay,
      };
    }
  }, [isPressed, disabled, variant, colors]);
  
  // Create container style
  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: theme.cornerRadius.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.38 : 1,
    width: fullWidth ? '100%' : undefined,
    ...variantStyle.container,
  };
  
  // Create text style
  const finalTextStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    textAlign: 'center',
    ...variantStyle.text,
    ...textStyle,
  };
  
  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variantStyle.text.color} 
          style={styles.loadingIndicator}
        />
      );
    }
    
    const textContent = (
      <Text style={finalTextStyle} numberOfLines={1}>
        {children}
      </Text>
    );
    
    if (!icon) {
      return textContent;
    }
    
    const iconElement = React.isValidElement(icon) 
      ? React.cloneElement(icon as React.ReactElement, {
          // @ts-ignore
          size: sizeConfig.iconSize,
          color: variantStyle.text.color,
        })
      : icon;
    
    return (
      <View style={styles.contentContainer}>
        {iconPosition === 'left' && (
          <View style={[styles.iconContainer, styles.iconLeft]}>
            {iconElement}
          </View>
        )}
        {textContent}
        {iconPosition === 'right' && (
          <View style={[styles.iconContainer, styles.iconRight]}>
            {iconElement}
          </View>
        )}
      </View>
    );
  };
  
  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {isPressed && <View style={[StyleSheet.absoluteFill, pressedStyle]} />}
      {renderContent()}
    </TouchableOpacity>
  );
};

// ==================================================================================
// CONVENIENCE COMPONENTS
// ==================================================================================

export const MaterialFilledButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton {...props} variant="filled" />
);

export const MaterialTonalButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton {...props} variant="filledTonal" />
);

export const MaterialOutlinedButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton {...props} variant="outlined" />
);

export const MaterialTextButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton {...props} variant="text" />
);

export const MaterialElevatedButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton {...props} variant="elevated" />
);

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconLeft: {
    marginRight: 8,
  },
  
  iconRight: {
    marginLeft: 8,
  },
  
  loadingIndicator: {
    marginHorizontal: 8,
  },
});

export default MaterialButton;