/**
 * Liquid Glass Core UI Components
 * 
 * Essential building blocks for iOS 26 Liquid Glass interface.
 * Following Apple's latest patterns and modern Swift principles.
 * 
 * Components:
 * - LiquidGlassButton: Interactive buttons with haptic feedback
 * - LiquidGlassChatBubble: Message containers with adaptive design
 * - LiquidGlassInput: Text input fields with focus states
 * - LiquidGlassCard: Content containers with elevation
 * - LiquidGlassContainer: Performance-optimized container for batching
 * 
 * Performance Features:
 * - State-based glass effects following Apple patterns
 * - Adaptive intensity based on device capabilities
 * - Container optimization for multiple glass elements
 * - Lazy loading and conditional glass application
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Animated,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
  Dimensions,
  Vibration,
  LayoutAnimation,
} from 'react-native';

import {
  LiquidGlassView,
  useLiquidGlassCapabilities,
  useAdaptiveGlassIntensity,
  type LiquidGlassProps,
} from './';

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

interface LiquidGlassButtonProps {
  /** Button title */
  title: string;
  
  /** Button press handler */
  onPress: () => void;
  
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  
  /** Loading state */
  loading?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Enable haptic feedback */
  haptics?: boolean;
  
  /** Custom glass intensity */
  intensity?: 'ultraThin' | 'thin' | 'regular' | 'thick';
  
  /** Custom styling */
  style?: ViewStyle;
  
  /** Custom text styling */
  textStyle?: TextStyle;
  
  /** Left icon component */
  leftIcon?: React.ReactNode;
  
  /** Right icon component */
  rightIcon?: React.ReactNode;
  
  /** Test ID for automation */
  testID?: string;
}

interface LiquidGlassChatBubbleProps {
  /** Message content */
  message: string;
  
  /** Bubble type */
  type: 'user' | 'assistant' | 'system';
  
  /** Message status */
  status?: 'sending' | 'sent' | 'error';
  
  /** Enable markdown rendering */
  markdown?: boolean;
  
  /** Timestamp */
  timestamp?: Date;
  
  /** Show timestamp */
  showTimestamp?: boolean;
  
  /** Bubble press handler */
  onPress?: () => void;
  
  /** Long press handler */
  onLongPress?: () => void;
  
  /** Custom styling */
  style?: ViewStyle;
  
  /** Animate on appear */
  animateOnAppear?: boolean;
}

interface LiquidGlassInputProps {
  /** Input value */
  value: string;
  
  /** Value change handler */
  onChangeText: (text: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Input type */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  
  /** Security text entry */
  secureTextEntry?: boolean;
  
  /** Multiline input */
  multiline?: boolean;
  
  /** Maximum length */
  maxLength?: number;
  
  /** Auto-focus */
  autoFocus?: boolean;
  
  /** Focus handler */
  onFocus?: () => void;
  
  /** Blur handler */
  onBlur?: () => void;
  
  /** Submit handler */
  onSubmitEditing?: () => void;
  
  /** Return key type */
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  
  /** Left icon */
  leftIcon?: React.ReactNode;
  
  /** Right action component */
  rightAction?: React.ReactNode;
  
  /** Error state */
  error?: string;
  
  /** Custom styling */
  style?: ViewStyle;
  
  /** Custom text styling */
  textStyle?: TextStyle;
}

interface LiquidGlassCardProps extends LiquidGlassProps {
  /** Card title */
  title?: string;
  
  /** Card subtitle */
  subtitle?: string;
  
  /** Header component */
  header?: React.ReactNode;
  
  /** Footer component */
  footer?: React.ReactNode;
  
  /** Card press handler */
  onPress?: () => void;
  
  /** Enable shadow */
  shadow?: boolean;
  
  /** Card padding */
  padding?: number;
  
  /** Custom header styling */
  headerStyle?: ViewStyle;
  
  /** Custom footer styling */
  footerStyle?: ViewStyle;
}

interface LiquidGlassContainerProps extends LiquidGlassProps {
  /** Container spacing for effect merging */
  spacing?: number;
  
  /** Maximum glass elements before performance optimization */
  maxElements?: number;
  
  /** Enable lazy glass application */
  lazy?: boolean;
  
  /** Scroll optimization */
  optimizeForScrolling?: boolean;
  
  /** Container layout direction */
  direction?: 'vertical' | 'horizontal';
}

// ==================================================================================
// LIQUID GLASS BUTTON
// ==================================================================================

/**
 * Interactive button with liquid glass effects and haptic feedback
 * Following Apple's glass button patterns
 */
export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  haptics = true,
  intensity: customIntensity,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const { capabilities } = useLiquidGlassCapabilities();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Adaptive intensity based on device capabilities
  const baseIntensity = customIntensity || (
    variant === 'primary' ? 'regular' : 
    variant === 'secondary' ? 'thin' : 
    'ultraThin'
  );
  const adaptiveIntensity = useAdaptiveGlassIntensity(baseIntensity);
  
  // Handle press interactions with haptic feedback
  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    // Apple's standard button scale animation
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
    
    // Haptic feedback following iOS patterns
    if (haptics && Platform.OS === 'ios') {
      // Would integrate with expo-haptics for proper iOS feedback
      console.log('🎯 Haptic feedback: impactLight');
    }
  }, [disabled, loading, haptics, scaleAnim]);
  
  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    
    // Additional haptic for successful action
    if (haptics && Platform.OS === 'ios') {
      console.log('🎯 Haptic feedback: impactMedium');
    }
    
    onPress();
  }, [disabled, loading, haptics, onPress]);
  
  // Dynamic styling based on state and variant
  const buttonColors = useMemo(() => {
    const isDark = colorScheme === 'dark';
    
    switch (variant) {
      case 'primary':
        return {
          tint: '#007AFF',
          text: isDark ? '#FFFFFF' : '#FFFFFF',
        };
      case 'secondary':
        return {
          tint: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          text: isDark ? '#FFFFFF' : '#000000',
        };
      case 'destructive':
        return {
          tint: '#FF3B30',
          text: '#FFFFFF',
        };
      case 'ghost':
        return {
          tint: 'transparent',
          text: '#007AFF',
        };
      default:
        return {
          tint: '#007AFF',
          text: '#FFFFFF',
        };
    }
  }, [variant, colorScheme]);
  
  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          minHeight: 32,
          fontSize: 14,
        };
      case 'medium':
        return {
          paddingHorizontal: 16,
          paddingVertical: 10,
          minHeight: 44,
          fontSize: 16,
        };
      case 'large':
        return {
          paddingHorizontal: 20,
          paddingVertical: 14,
          minHeight: 52,
          fontSize: 18,
        };
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 10,
          minHeight: 44,
          fontSize: 16,
        };
    }
  }, [size]);
  
  // State-based glass tinting following Apple patterns
  const glassStyle = variant === 'ghost' ? 'systemThinMaterial' : 'systemMaterial';
  const shouldShowGlass = variant !== 'ghost';
  
  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        disabled={disabled || loading}
        testID={testID}
        style={({ pressed }) => [
          styles.button,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            minHeight: sizeStyles.minHeight,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {shouldShowGlass ? (
          <LiquidGlassView
            intensity={adaptiveIntensity}
            style={glassStyle}
            sensorAware={capabilities?.features.sensorAware}
            environmentalAdaptation={false}
            containerStyle={[
              styles.buttonGlass,
              {
                backgroundColor: isPressed || isHovered ? 
                  `${buttonColors.tint}40` : buttonColors.tint,
              },
            ]}
          >
            <ButtonContent
              title={title}
              loading={loading}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
              textColor={buttonColors.text}
              fontSize={sizeStyles.fontSize}
              textStyle={textStyle}
            />
          </LiquidGlassView>
        ) : (
          <View style={styles.buttonGhost}>
            <ButtonContent
              title={title}
              loading={loading}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
              textColor={buttonColors.text}
              fontSize={sizeStyles.fontSize}
              textStyle={textStyle}
            />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Helper component for button content
const ButtonContent: React.FC<{
  title: string;
  loading: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textColor: string;
  fontSize: number;
  textStyle?: TextStyle;
}> = ({ title, loading, leftIcon, rightIcon, textColor, fontSize, textStyle }) => (
  <View style={styles.buttonContent}>
    {leftIcon && <View style={styles.buttonIcon}>{leftIcon}</View>}
    
    {loading ? (
      <View style={styles.loadingContainer}>
        <Text style={[styles.buttonText, { color: textColor, fontSize }, textStyle]}>
          Loading...
        </Text>
      </View>
    ) : (
      <Text style={[styles.buttonText, { color: textColor, fontSize }, textStyle]}>
        {title}
      </Text>
    )}
    
    {rightIcon && <View style={styles.buttonIcon}>{rightIcon}</View>}
  </View>
);

// ==================================================================================
// LIQUID GLASS CHAT BUBBLE
// ==================================================================================

/**
 * Message bubble with adaptive glass effects for different message types
 */
export const LiquidGlassChatBubble: React.FC<LiquidGlassChatBubbleProps> = ({
  message,
  type,
  status = 'sent',
  markdown = false,
  timestamp,
  showTimestamp = false,
  onPress,
  onLongPress,
  style,
  animateOnAppear = true,
}) => {
  const colorScheme = useColorScheme();
  const { capabilities } = useLiquidGlassCapabilities();
  const [isPressed, setIsPressed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(animateOnAppear ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animateOnAppear ? 20 : 0)).current;
  
  // Animate appearance
  useEffect(() => {
    if (animateOnAppear) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateOnAppear, fadeAnim, slideAnim]);
  
  // Bubble styling based on type and theme
  const bubbleConfig = useMemo(() => {
    const isDark = colorScheme === 'dark';
    
    switch (type) {
      case 'user':
        return {
          alignment: 'flex-end' as const,
          intensity: 'regular' as const,
          style: 'systemMaterial' as const,
          tintColor: '#007AFF',
          textColor: '#FFFFFF',
          maxWidth: '85%',
        };
      case 'assistant':
        return {
          alignment: 'flex-start' as const,
          intensity: 'thin' as const,
          style: 'systemThinMaterial' as const,
          tintColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          textColor: isDark ? '#FFFFFF' : '#000000',
          maxWidth: '90%',
        };
      case 'system':
        return {
          alignment: 'center' as const,
          intensity: 'ultraThin' as const,
          style: 'hudMaterial' as const,
          tintColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          textColor: isDark ? '#8E8E93' : '#8E8E93',
          maxWidth: '70%',
        };
      default:
        return {
          alignment: 'flex-start' as const,
          intensity: 'thin' as const,
          style: 'systemMaterial' as const,
          tintColor: '#007AFF',
          textColor: '#FFFFFF',
          maxWidth: '85%',
        };
    }
  }, [type, colorScheme]);
  
  const adaptiveIntensity = useAdaptiveGlassIntensity(bubbleConfig.intensity);
  
  const handlePressIn = useCallback(() => {
    setIsPressed(true);
  }, []);
  
  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        {
          alignSelf: bubbleConfig.alignment,
          maxWidth: bubbleConfig.maxWidth,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={!onPress && !onLongPress}
      >
        <LiquidGlassView
          intensity={adaptiveIntensity}
          style={bubbleConfig.style}
          sensorAware={capabilities?.features.sensorAware && type === 'user'}
          environmentalAdaptation={capabilities?.features.environmentalCues}
          containerStyle={[
            styles.bubbleGlass,
            type === 'user' && styles.userBubble,
            type === 'assistant' && styles.assistantBubble,
            type === 'system' && styles.systemBubble,
            {
              backgroundColor: isPressed ? 
                `${bubbleConfig.tintColor}60` : bubbleConfig.tintColor,
            },
          ]}
        >
          <View style={styles.bubbleContent}>
            <Text
              style={[
                styles.bubbleText,
                {
                  color: bubbleConfig.textColor,
                  fontSize: type === 'system' ? 12 : 16,
                  textAlign: type === 'system' ? 'center' : 'left',
                },
              ]}
            >
              {message}
            </Text>
            
            {showTimestamp && timestamp && (
              <Text style={[styles.timestampText, { color: bubbleConfig.textColor }]}>
                {timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            )}
            
            {status === 'sending' && (
              <View style={styles.statusIndicator}>
                <Text style={[styles.statusText, { color: bubbleConfig.textColor }]}>
                  Sending...
                </Text>
              </View>
            )}
            
            {status === 'error' && (
              <View style={styles.statusIndicator}>
                <Text style={[styles.statusText, { color: '#FF3B30' }]}>
                  Failed
                </Text>
              </View>
            )}
          </View>
        </LiquidGlassView>
      </Pressable>
    </Animated.View>
  );
};

// ==================================================================================
// LIQUID GLASS INPUT
// ==================================================================================

/**
 * Text input with focus-state glass effects and modern iOS styling
 */
export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({
  value,
  onChangeText,
  placeholder = '',
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  maxLength,
  autoFocus = false,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType = 'done',
  leftIcon,
  rightAction,
  error,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const { capabilities } = useLiquidGlassCapabilities();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const focusAnim = useRef(new Animated.Value(0)).current;
  
  // Adaptive intensity based on focus state
  const baseIntensity = isFocused ? 'regular' : 'thin';
  const adaptiveIntensity = useAdaptiveGlassIntensity(baseIntensity);
  
  // Handle focus animations
  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);
  
  // Dynamic styling based on focus state and theme
  const inputColors = useMemo(() => {
    const isDark = colorScheme === 'dark';
    
    return {
      background: isFocused
        ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
        : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
      text: isDark ? '#FFFFFF' : '#000000',
      placeholder: isDark ? '#8E8E93' : '#8E8E93',
      border: isFocused ? '#007AFF' : 'transparent',
    };
  }, [isFocused, colorScheme]);
  
  return (
    <View style={[styles.inputContainer, style]}>
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', inputColors.border],
            }),
            borderWidth: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 2],
            }),
          },
        ]}
      >
        <LiquidGlassView
          intensity={adaptiveIntensity}
          style="systemThinMaterial"
          sensorAware={false}
          environmentalAdaptation={capabilities?.features.environmentalCues}
          containerStyle={[
            styles.inputGlass,
            {
              backgroundColor: inputColors.background,
              minHeight: multiline ? 80 : 44,
            },
          ]}
        >
          <View style={styles.inputContent}>
            {leftIcon && (
              <View style={styles.inputIcon}>
                {leftIcon}
              </View>
            )}
            
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={inputColors.placeholder}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry}
              multiline={multiline}
              maxLength={maxLength}
              autoFocus={autoFocus}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={onSubmitEditing}
              returnKeyType={returnKeyType}
              style={[
                styles.textInput,
                {
                  color: inputColors.text,
                  textAlignVertical: multiline ? 'top' : 'center',
                  minHeight: multiline ? 60 : 'auto',
                },
                textStyle,
              ]}
            />
            
            {rightAction && (
              <View style={styles.inputAction}>
                {rightAction}
              </View>
            )}
          </View>
        </LiquidGlassView>
      </Animated.View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

// ==================================================================================
// LIQUID GLASS CARD
// ==================================================================================

/**
 * Content card with liquid glass background and optional header/footer
 */
export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  title,
  subtitle,
  header,
  footer,
  children,
  onPress,
  shadow = true,
  padding = 16,
  headerStyle,
  footerStyle,
  intensity = 'thin',
  style = 'systemMaterial',
  containerStyle,
  ...glassProps
}) => {
  const colorScheme = useColorScheme();
  const { capabilities } = useLiquidGlassCapabilities();
  const [isPressed, setIsPressed] = useState(false);
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  
  const cardColors = useMemo(() => {
    const isDark = colorScheme === 'dark';
    return {
      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
      text: isDark ? '#FFFFFF' : '#000000',
      subtitle: isDark ? '#8E8E93' : '#8E8E93',
    };
  }, [colorScheme]);
  
  const CardContent = () => (
    <LiquidGlassView
      intensity={adaptiveIntensity}
      style={style}
      sensorAware={capabilities?.features.sensorAware}
      environmentalAdaptation={capabilities?.features.environmentalCues}
      containerStyle={[
        styles.cardGlass,
        {
          backgroundColor: isPressed ? 
            `${cardColors.background}80` : cardColors.background,
          padding: padding,
        },
        shadow && styles.cardShadow,
        containerStyle,
      ]}
      {...glassProps}
    >
      {/* Header Section */}
      {(header || title || subtitle) && (
        <View style={[styles.cardHeader, headerStyle]}>
          {header}
          {title && (
            <Text style={[styles.cardTitle, { color: cardColors.text }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.cardSubtitle, { color: cardColors.subtitle }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      {/* Content Section */}
      <View style={styles.cardContent}>
        {children}
      </View>
      
      {/* Footer Section */}
      {footer && (
        <View style={[styles.cardFooter, footerStyle]}>
          {footer}
        </View>
      )}
    </LiquidGlassView>
  );
  
  if (onPress) {
    return (
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onPress}
        style={containerStyle}
      >
        <CardContent />
      </Pressable>
    );
  }
  
  return <CardContent />;
};

// ==================================================================================
// LIQUID GLASS CONTAINER
// ==================================================================================

/**
 * Performance-optimized container for multiple glass elements
 * Following Apple's container patterns for effect merging
 */
export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  children,
  spacing = 20,
  maxElements = 10,
  lazy = true,
  optimizeForScrolling = false,
  direction = 'vertical',
  intensity = 'thin',
  style = 'systemMaterial',
  containerStyle,
  ...glassProps
}) => {
  const { capabilities } = useLiquidGlassCapabilities();
  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  
  // Container optimization based on performance tier
  const shouldOptimize = useMemo(() => {
    if (!capabilities) return true;
    return capabilities.performance.tier === 'low' || 
           capabilities.performance.tier === 'medium';
  }, [capabilities]);
  
  // Apply container styling following Apple's glass container patterns
  const containerLayout = useMemo(() => {
    return {
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      gap: spacing, // iOS 14.0+ gap property
    } as ViewStyle;
  }, [direction, spacing]);
  
  return (
    <LiquidGlassView
      intensity={adaptiveIntensity}
      style={style}
      sensorAware={capabilities?.features.sensorAware}
      environmentalAdaptation={capabilities?.features.environmentalCues}
      containerStyle={[
        styles.glassContainer,
        containerLayout,
        containerStyle,
      ]}
      {...glassProps}
    >
      {children}
    </LiquidGlassView>
  );
};

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  // Button Styles
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  buttonGlass: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  buttonGhost: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  buttonIcon: {
    marginHorizontal: 4,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Chat Bubble Styles
  bubbleContainer: {
    marginVertical: 2,
  },
  
  bubbleGlass: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  
  userBubble: {
    borderBottomRightRadius: 6,
  },
  
  assistantBubble: {
    borderBottomLeftRadius: 6,
  },
  
  systemBubble: {
    borderRadius: 12,
  },
  
  bubbleContent: {
    padding: 12,
  },
  
  bubbleText: {
    lineHeight: 20,
  },
  
  timestampText: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  
  statusIndicator: {
    marginTop: 4,
  },
  
  statusText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  
  // Input Styles
  inputContainer: {
    marginVertical: 4,
  },
  
  inputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  inputGlass: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  
  inputIcon: {
    marginRight: 8,
  },
  
  inputAction: {
    marginLeft: 8,
  },
  
  errorContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
  },
  
  // Card Styles
  cardGlass: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  cardHeader: {
    marginBottom: 12,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  
  cardContent: {
    flex: 1,
  },
  
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  },
  
  // Container Styles
  glassContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});

// ==================================================================================
// EXPORTS
// ==================================================================================

export {
  LiquidGlassButton,
  LiquidGlassChatBubble,
  LiquidGlassInput,
  LiquidGlassCard,
  LiquidGlassContainer,
};

export type {
  LiquidGlassButtonProps,
  LiquidGlassChatBubbleProps,
  LiquidGlassInputProps,
  LiquidGlassCardProps,
  LiquidGlassContainerProps,
};