/**
 * Material Design 3 Text Input Component
 * 
 * Implements Material 3 text field specifications with proper theming,
 * floating labels, and interaction states.
 * 
 * @author DNSChat Team
 * @since v2.2.0 (Material 3 Components)
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useMaterialTheme } from '../../context/MaterialThemeContext';

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

export type MaterialTextInputVariant = 
  | 'filled'     // Filled text field
  | 'outlined';  // Outlined text field

export interface MaterialTextInputProps extends Omit<TextInputProps, 'style'> {
  /** Input variant style */
  variant?: MaterialTextInputVariant;
  
  /** Label text */
  label?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Error text (shows error state) */
  errorText?: string;
  
  /** Leading icon */
  leadingIcon?: React.ReactNode;
  
  /** Trailing icon */
  trailingIcon?: React.ReactNode;
  
  /** Whether the field is required */
  required?: boolean;
  
  /** Custom container style */
  containerStyle?: ViewStyle;
  
  /** Custom input style */
  inputStyle?: TextStyle;
  
  /** Custom label style */
  labelStyle?: TextStyle;
  
  /** Disable floating label animation */
  disableFloatingLabel?: boolean;
}

// ==================================================================================
// MAIN COMPONENT
// ==================================================================================

export const MaterialTextInput: React.FC<MaterialTextInputProps> = ({
  variant = 'filled',
  label,
  helperText,
  errorText,
  leadingIcon,
  trailingIcon,
  required = false,
  containerStyle,
  inputStyle,
  labelStyle,
  disableFloatingLabel = false,
  value,
  placeholder,
  editable = true,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const { colors, theme } = useMaterialTheme();
  
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnimation = useRef(new Animated.Value(0)).current;
  
  const hasError = Boolean(errorText);
  const hasValue = Boolean(internalValue || value);
  const shouldFloatLabel = !disableFloatingLabel && (hasValue || isFocused || placeholder);
  
  // Animate label
  useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: shouldFloatLabel ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [shouldFloatLabel, labelAnimation]);
  
  // Animate border
  useEffect(() => {
    Animated.timing(borderAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, borderAnimation]);
  
  // Handle focus
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  // Handle blur
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  // Handle text change
  const handleChangeText = (text: string) => {
    setInternalValue(text);
    textInputProps.onChangeText?.(text);
  };
  
  // Get container styling
  const containerStyles = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginVertical: 4,
    };
    
    if (variant === 'filled') {
      return {
        ...baseStyle,
        backgroundColor: hasError 
          ? `${colors.errorContainer}20`
          : `${colors.surfaceVariant}60`,
        borderTopLeftRadius: theme.cornerRadius.small,
        borderTopRightRadius: theme.cornerRadius.small,
        borderBottomWidth: 2,
        borderBottomColor: hasError 
          ? colors.error
          : isFocused 
            ? colors.primary 
            : colors.outline,
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderRadius: theme.cornerRadius.small,
        borderColor: hasError 
          ? colors.error
          : isFocused 
            ? colors.primary 
            : colors.outline,
      };
    }
  }, [variant, hasError, isFocused, colors, theme.cornerRadius]);
  
  // Get input container styling
  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: leadingIcon || trailingIcon ? 12 : 16,
    paddingVertical: variant === 'filled' ? 14 : 12,
    minHeight: 56,
  };
  
  // Get input styling
  const inputStyles: TextStyle = {
    flex: 1,
    fontSize: 16,
    color: editable 
      ? (hasError ? colors.error : colors.onSurface)
      : colors.onSurfaceVariant,
    paddingVertical: 0, // Remove default padding
    paddingHorizontal: leadingIcon ? 8 : 0,
    marginRight: trailingIcon ? 8 : 0,
  };
  
  // Get label styling
  const labelStyles = useMemo(() => {
    const baseSize = 16;
    const smallSize = 12;
    const topPosition = variant === 'filled' ? 8 : 6;
    const centerPosition = variant === 'filled' ? 20 : 18;
    
    return {
      position: 'absolute' as const,
      left: leadingIcon ? 48 : 16,
      fontSize: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [baseSize, smallSize],
      }),
      top: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [centerPosition, topPosition],
      }),
      color: hasError 
        ? colors.error
        : isFocused 
          ? colors.primary 
          : colors.onSurfaceVariant,
      backgroundColor: variant === 'outlined' ? colors.surface : 'transparent',
      paddingHorizontal: variant === 'outlined' ? 4 : 0,
      zIndex: 1,
    };
  }, [
    variant,
    leadingIcon,
    labelAnimation,
    hasError,
    isFocused,
    colors,
  ]);
  
  // Get helper/error text styling
  const helperTextStyle: TextStyle = {
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 16,
    color: hasError ? colors.error : colors.onSurfaceVariant,
  };
  
  return (
    <View style={[containerStyle]}>
      <View style={[containerStyles, styles.inputContainer]}>
        {/* Label */}
        {label && (
          <Animated.Text 
            style={[labelStyles, labelStyle]}
            numberOfLines={1}
          >
            {label}{required && ' *'}
          </Animated.Text>
        )}
        
        <View style={inputContainerStyle}>
          {/* Leading Icon */}
          {leadingIcon && (
            <View style={styles.iconContainer}>
              {React.isValidElement(leadingIcon) 
                ? React.cloneElement(leadingIcon as React.ReactElement, {
                    // @ts-ignore
                    size: 24,
                    color: hasError ? colors.error : colors.onSurfaceVariant,
                  })
                : leadingIcon}
            </View>
          )}
          
          {/* Text Input */}
          <TextInput
            {...textInputProps}
            style={[inputStyles, inputStyle]}
            value={value}
            placeholder={shouldFloatLabel ? undefined : placeholder}
            placeholderTextColor={colors.onSurfaceVariant}
            selectionColor={colors.primary}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
          />
          
          {/* Trailing Icon */}
          {trailingIcon && (
            <View style={styles.iconContainer}>
              {React.isValidElement(trailingIcon) 
                ? React.cloneElement(trailingIcon as React.ReactElement, {
                    // @ts-ignore
                    size: 24,
                    color: hasError ? colors.error : colors.onSurfaceVariant,
                  })
                : trailingIcon}
            </View>
          )}
        </View>
        
        {/* Animated border for outlined variant */}
        {variant === 'outlined' && isFocused && (
          <Animated.View 
            style={[
              styles.animatedBorder,
              {
                borderColor: hasError ? colors.error : colors.primary,
                opacity: borderAnimation,
              }
            ]} 
          />
        )}
      </View>
      
      {/* Helper Text or Error Text */}
      {(helperText || errorText) && (
        <Text style={helperTextStyle}>
          {errorText || helperText}
        </Text>
      )}
    </View>
  );
};

// ==================================================================================
// CONVENIENCE COMPONENTS
// ==================================================================================

export const MaterialFilledTextInput: React.FC<Omit<MaterialTextInputProps, 'variant'>> = (props) => (
  <MaterialTextInput {...props} variant="filled" />
);

export const MaterialOutlinedTextInput: React.FC<Omit<MaterialTextInputProps, 'variant'>> = (props) => (
  <MaterialTextInput {...props} variant="outlined" />
);

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  animatedBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderRadius: 6,
    pointerEvents: 'none',
  },
});

export default MaterialTextInput;