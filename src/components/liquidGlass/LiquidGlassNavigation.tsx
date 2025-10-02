/**
 * Liquid Glass Navigation Components
 *
 * Enhanced navigation components with iOS 17 Liquid Glass effects.
 * Provides adaptive, sensor-aware navigation interfaces that respond
 * to environmental changes and user interaction patterns.
 *
 * Features:
 * - Dynamic shrinking/expanding tab bars
 * - Environmental light adaptation
 * - Motion-aware transparency
 * - Performance-optimized rendering
 * - Graceful fallbacks for all platforms
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 17 Liquid Glass Support)
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  useColorScheme,
  ViewStyle,
  TextStyle,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  LiquidGlassView,
  LiquidGlassNavigation,
  LiquidGlassModal,
  useLiquidGlassCapabilities,
  useAdaptiveGlassIntensity,
  type LiquidGlassProps,
} from "./";

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

interface LiquidGlassTabBarProps extends BottomTabBarProps {
  /** Enable dynamic shrinking during scroll */
  dynamicShrinking?: boolean;

  /** Blur intensity for the tab bar */
  intensity?: "ultraThin" | "thin" | "regular" | "thick";

  /** Enable haptic feedback on tab press */
  hapticsEnabled?: boolean;

  /** Custom glass style */
  glassStyle?: "footerMaterial" | "systemMaterial" | "hudMaterial";
}

interface LiquidGlassNavigationBarProps {
  /** Navigation title */
  title?: string;

  /** Left navigation button */
  leftButton?: React.ReactNode;

  /** Right navigation button */
  rightButton?: React.ReactNode;

  /** Enable large title mode */
  largeTitleMode?: boolean;

  /** Scroll offset for dynamic transparency */
  scrollOffset?: Animated.Value;

  /** Glass intensity */
  intensity?: "ultraThin" | "thin" | "regular" | "thick";

  /** Custom styling */
  style?: ViewStyle;
}

interface LiquidGlassModalProps extends LiquidGlassProps {
  /** Modal visibility */
  visible: boolean;

  /** Presentation style */
  presentationStyle?:
    | "fullScreen"
    | "pageSheet"
    | "formSheet"
    | "overFullScreen";

  /** Animation type */
  animationType?: "slide" | "fade" | "none";

  /** Callback when modal requests close */
  onRequestClose: () => void;

  /** Modal content */
  children: React.ReactNode;
}

// ==================================================================================
// LIQUID GLASS TAB BAR
// ==================================================================================

/**
 * Enhanced tab bar with iOS 17 Liquid Glass effects and dynamic behavior
 */
export const LiquidGlassTabBar: React.FC<LiquidGlassTabBarProps> = ({
  state,
  descriptors,
  navigation,
  dynamicShrinking = true,
  intensity = "thin",
  hapticsEnabled = true,
  glassStyle = "footerMaterial",
}) => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { capabilities } = useLiquidGlassCapabilities();
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);

  // Animation values
  const shrinkAnim = useRef(new Animated.Value(1)).current;
  const [isShrunken, setIsShrunken] = useState(false);

  // Dynamic shrinking based on scroll events (simulated for now)
  const triggerShrink = useCallback(
    (shouldShrink: boolean) => {
      if (!dynamicShrinking) return;

      const targetValue = shouldShrink ? 0.8 : 1;
      const duration = capabilities?.performance.supports60fps ? 300 : 200;

      Animated.timing(shrinkAnim, {
        toValue: targetValue,
        duration,
        useNativeDriver: true,
      }).start();

      setIsShrunken(shouldShrink);
    },
    [dynamicShrinking, shrinkAnim, capabilities?.performance.supports60fps],
  );

  // Tab press handler with haptic feedback
  const handleTabPress = useCallback(
    (route: any, isFocused: boolean) => {
      // Haptic feedback
      if (hapticsEnabled && Platform.OS === "ios") {
        // Would integrate with react-native-haptic-feedback
        console.log("🎯 Haptic feedback triggered");
      }

      if (!isFocused) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation, hapticsEnabled],
  );

  // Render individual tab
  const renderTab = useCallback(
    (route: any, index: number) => {
      const { options } = descriptors[route.key];
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
            ? options.title
            : route.name;

      const isFocused = state.index === index;

      const color = isFocused
        ? colorScheme === "dark"
          ? "#007AFF"
          : "#007AFF"
        : colorScheme === "dark"
          ? "#8E8E93"
          : "#8E8E93";

      return (
        <TouchableOpacity
          key={route.key}
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel}
          testID={options.tabBarTestID}
          onPress={() => handleTabPress(route, isFocused)}
          style={styles.tab}
        >
          <Animated.View
            style={[
              styles.tabContent,
              {
                transform: [{ scale: shrinkAnim }],
              },
            ]}
          >
            {options.tabBarIcon &&
              options.tabBarIcon({
                focused: isFocused,
                color,
                size: isShrunken ? 20 : 24,
              })}
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    },
    [
      state.index,
      descriptors,
      colorScheme,
      handleTabPress,
      shrinkAnim,
      isShrunken,
    ],
  );

  return (
    <LiquidGlassNavigation
      intensity={adaptiveIntensity}
      style={glassStyle}
      sensorAware={capabilities?.features.sensorAware}
      environmentalAdaptation={capabilities?.features.environmentalCues}
      containerStyle={[
        styles.tabBar,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.tabContainer}>{state.routes.map(renderTab)}</View>
    </LiquidGlassNavigation>
  );
};

// ==================================================================================
// LIQUID GLASS NAVIGATION BAR
// ==================================================================================

/**
 * Enhanced navigation bar with content-aware transparency and large title support
 */
export const LiquidGlassNavigationBar: React.FC<
  LiquidGlassNavigationBarProps
> = ({
  title,
  leftButton,
  rightButton,
  largeTitleMode = false,
  scrollOffset,
  intensity = "thin",
  style,
}) => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { capabilities } = useLiquidGlassCapabilities();
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);

  // Dynamic opacity based on scroll
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const titleScale = useRef(
    new Animated.Value(largeTitleMode ? 1.5 : 1),
  ).current;

  // Listen to scroll offset changes
  useEffect(() => {
    if (!scrollOffset) return;

    const listener = scrollOffset.addListener(({ value }) => {
      // Gradually increase opacity as user scrolls
      const opacity = Math.min(1, Math.max(0.3, value / 100));
      headerOpacity.setValue(opacity);

      // Shrink large title as user scrolls
      if (largeTitleMode) {
        const scale = Math.max(1, 1.5 - value / 200);
        titleScale.setValue(scale);
      }
    });

    return () => {
      scrollOffset.removeListener(listener);
    };
  }, [scrollOffset, headerOpacity, titleScale, largeTitleMode]);

  const titleColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";

  return (
    <Animated.View
      style={[styles.navigationBar, { opacity: headerOpacity }, style]}
    >
      <LiquidGlassNavigation
        intensity={adaptiveIntensity}
        style="headerMaterial"
        sensorAware={capabilities?.features.sensorAware}
        environmentalAdaptation={capabilities?.features.environmentalCues}
        containerStyle={[
          styles.navigationBarContainer,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.navigationContent}>
          <View style={styles.navigationButtons}>{leftButton}</View>

          <Animated.View
            style={[
              styles.titleContainer,
              {
                transform: [{ scale: titleScale }],
              },
            ]}
          >
            <Text
              style={[
                styles.navigationTitle,
                { color: titleColor },
                largeTitleMode && styles.largeTitle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </Animated.View>

          <View style={styles.navigationButtons}>{rightButton}</View>
        </View>
      </LiquidGlassNavigation>
    </Animated.View>
  );
};

// ==================================================================================
// LIQUID GLASS MODAL
// ==================================================================================

/**
 * Enhanced modal with liquid glass background and smooth animations
 */
export const LiquidGlassModalComponent: React.FC<LiquidGlassModalProps> = ({
  visible,
  presentationStyle = "pageSheet",
  animationType = "slide",
  onRequestClose,
  children,
  intensity = "regular",
  ...glassProps
}) => {
  const { capabilities } = useLiquidGlassCapabilities();
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height),
  ).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Animate modal appearance
  useEffect(() => {
    if (visible) {
      const animations = [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ];

      if (animationType === "slide") {
        animations.push(
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        );
      }

      if (presentationStyle === "formSheet") {
        animations.push(
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        );
      }

      Animated.parallel(animations).start();
    } else {
      const animations = [
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ];

      if (animationType === "slide") {
        animations.push(
          Animated.timing(slideAnim, {
            toValue: Dimensions.get("window").height,
            duration: 200,
            useNativeDriver: true,
          }),
        );
      }

      if (presentationStyle === "formSheet") {
        animations.push(
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          }),
        );
      }

      Animated.parallel(animations).start();
    }
  }, [
    visible,
    animationType,
    presentationStyle,
    fadeAnim,
    slideAnim,
    scaleAnim,
  ]);

  if (!visible) {
    return null;
  }

  const modalTransform = [];
  if (animationType === "slide") {
    modalTransform.push({ translateY: slideAnim });
  }
  if (presentationStyle === "formSheet") {
    modalTransform.push({ scale: scaleAnim });
  }

  return (
    <Animated.View
      style={[
        styles.modalOverlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onRequestClose}
      />

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          presentationStyle === "fullScreen" && styles.fullScreenModal,
          presentationStyle === "formSheet" && styles.formSheetModal,
          {
            transform: modalTransform,
          },
        ]}
      >
        <LiquidGlassModal
          intensity={adaptiveIntensity}
          style="popoverMaterial"
          sensorAware={capabilities?.features.sensorAware}
          environmentalAdaptation={capabilities?.features.environmentalCues}
          containerStyle={styles.modalGlassContainer}
          {...glassProps}
        >
          <SafeAreaView style={styles.modalSafeArea}>{children}</SafeAreaView>
        </LiquidGlassModal>
      </Animated.View>
    </Animated.View>
  );
};

// ==================================================================================
// LIQUID GLASS BOTTOM SHEET
// ==================================================================================

interface LiquidGlassBottomSheetProps {
  /** Sheet visibility */
  visible: boolean;

  /** Sheet height as percentage of screen */
  height?: number;

  /** Enable drag to dismiss */
  dragToClose?: boolean;

  /** Callback when sheet requests close */
  onClose: () => void;

  /** Sheet content */
  children: React.ReactNode;

  /** Glass intensity */
  intensity?: "ultraThin" | "thin" | "regular" | "thick";
}

export const LiquidGlassBottomSheet: React.FC<LiquidGlassBottomSheetProps> = ({
  visible,
  height = 0.5,
  dragToClose = true,
  onClose,
  children,
  intensity = "regular",
}) => {
  const { capabilities } = useLiquidGlassCapabilities();
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  const screenHeight = Dimensions.get("window").height;
  const sheetHeight = screenHeight * height;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(sheetHeight)).current;

  // Animate sheet
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: sheetHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, translateAnim, sheetHeight]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.bottomSheetOverlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.bottomSheetBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet Content */}
      <Animated.View
        style={[
          styles.bottomSheetContainer,
          {
            height: sheetHeight,
            transform: [{ translateY: translateAnim }],
          },
        ]}
      >
        <LiquidGlassModal
          intensity={adaptiveIntensity}
          style="systemMaterial"
          sensorAware={capabilities?.features.sensorAware}
          environmentalAdaptation={capabilities?.features.environmentalCues}
          containerStyle={styles.bottomSheetGlass}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Content */}
          <ScrollView style={styles.bottomSheetContent}>{children}</ScrollView>
        </LiquidGlassModal>
      </Animated.View>
    </Animated.View>
  );
};

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  // Tab Bar Styles
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },

  tabContainer: {
    flexDirection: "row",
    height: 49,
    paddingHorizontal: 8,
  },

  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },

  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },

  // Navigation Bar Styles
  navigationBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },

  navigationBarContainer: {
    minHeight: 44,
  },

  navigationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 44,
  },

  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navigationTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },

  largeTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },

  navigationButtons: {
    width: 80,
    alignItems: "flex-start",
  },

  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  fullScreenModal: {
    paddingHorizontal: 0,
  },

  formSheetModal: {
    maxHeight: "80%",
    width: "90%",
    borderRadius: 16,
    overflow: "hidden",
  },

  modalGlassContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 16,
  },

  modalSafeArea: {
    flex: 1,
  },

  // Bottom Sheet Styles
  bottomSheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  bottomSheetBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },

  bottomSheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },

  bottomSheetGlass: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },

  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

// ==================================================================================
// EXPORTS
// ==================================================================================

export {
  LiquidGlassTabBar,
  LiquidGlassNavigationBar,
  LiquidGlassModalComponent as LiquidGlassModal,
  LiquidGlassBottomSheet,
};
