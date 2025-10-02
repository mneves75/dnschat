/**
 * GlassTabBar - Blurry tab backgrounds inspired by Evan Bacon's Glass UI
 *
 * Implements iOS-style tab navigation with translucent glass backgrounds,
 * following Apple's Human Interface Guidelines for tab bars.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 17 Liquid Glass Support + Evan Bacon Glass UI)
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
  ViewStyle,
  TextStyle,
  Dimensions,
  StyleProp,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LiquidGlassWrapper } from "../LiquidGlassWrapper";

// ==================================================================================
// TYPES AND INTERFACES
// ==================================================================================

interface GlassTab {
  /** Unique tab identifier */
  id: string;
  /** Tab title */
  title: string;
  /** Tab icon (React component or string) */
  icon?: React.ReactNode | string;
  /** SF Symbol name for iOS */
  sfSymbol?: string;
  /** Badge count */
  badge?: number;
  /** Disabled state */
  disabled?: boolean;
}

interface GlassTabBarProps {
  /** Array of tab configurations */
  tabs: GlassTab[];
  /** Currently active tab ID */
  activeTabId: string;
  /** Tab selection handler */
  onTabPress: (tabId: string) => void;
  /** Custom tab bar style */
  style?: StyleProp<ViewStyle>;
  /** Hide tab bar */
  hidden?: boolean;
  /** Safe area handling */
  safeAreaInsets?: boolean;
}

interface GlassTabItemProps {
  /** Tab configuration */
  tab: GlassTab;
  /** Is this tab active */
  isActive: boolean;
  /** Press handler */
  onPress: () => void;
  /** Custom item style */
  style?: StyleProp<ViewStyle>;
}

// ==================================================================================
// ADAPTIVE GLASS COLOR SYSTEM
// ==================================================================================

const useGlassTabColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    // Tab bar glass background
    tabBarBackground: isDark
      ? "rgba(25, 25, 25, 0.92)" // Dark translucent
      : "rgba(255, 255, 255, 0.92)", // Light translucent

    // Tab bar border
    tabBarBorder: isDark ? "rgba(84, 84, 88, 0.3)" : "rgba(0, 0, 0, 0.05)",

    // Active tab
    activeTabTint: isDark ? "#007AFF" : "#007AFF", // Blue
    activeTabBackground: isDark
      ? "rgba(0, 122, 255, 0.15)"
      : "rgba(0, 122, 255, 0.08)",

    // Inactive tab
    inactiveTabTint: isDark ? "#8E8E93" : "#8E8E93", // Gray

    // Badge
    badgeBackground: "#FF3B30", // Red
    badgeText: "#FFFFFF",

    // Pressed state
    pressedOverlay: isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(0, 0, 0, 0.04)",
  };
};

// ==================================================================================
// SF SYMBOL FALLBACK SYSTEM
// ==================================================================================

const SFSymbolFallback: React.FC<{
  symbol: string;
  size?: number;
  color?: string;
  isActive?: boolean;
}> = ({ symbol, size = 22, color = "#8E8E93", isActive = false }) => {
  // Map common SF Symbols to Unicode equivalents
  const symbolMap: { [key: string]: string } = {
    house: "🏠",
    "house.fill": "🏠",
    magnifyingglass: "🔍",
    person: "👤",
    "person.fill": "👤",
    gear: "⚙️",
    message: "💬",
    "message.fill": "💬",
    "list.bullet": "📋",
    "info.circle": "ℹ️",
    "info.circle.fill": "ℹ️",
    bell: "🔔",
    "bell.fill": "🔔",
    bookmark: "📖",
    "bookmark.fill": "📖",
    star: "⭐",
    "star.fill": "⭐",
  };

  const fallbackIcon = symbolMap[symbol] || "●";

  return (
    <Text
      style={{
        fontSize: size,
        color,
        fontWeight: isActive ? "600" : "400",
      }}
    >
      {fallbackIcon}
    </Text>
  );
};

// ==================================================================================
// GLASS TAB COMPONENTS
// ==================================================================================

/**
 * Individual Glass Tab Item
 */
const GlassTabItem: React.FC<GlassTabItemProps> = ({
  tab,
  isActive,
  onPress,
  style,
}) => {
  const colors = useGlassTabColors();
  const [isPressed, setIsPressed] = React.useState(false);

  const tabColor = isActive ? colors.activeTabTint : colors.inactiveTabTint;

  const itemStyle: ViewStyle = {
    backgroundColor: isPressed
      ? colors.pressedOverlay
      : isActive
        ? colors.activeTabBackground
        : "transparent",
  };

  const handlePress = React.useCallback(() => {
    if (!tab.disabled) {
      // Haptic feedback
      if (Platform.OS === "ios") {
        console.log("🔸 Haptic: Tab selection feedback");
      }
      onPress();
    }
  }, [tab.disabled, onPress]);

  return (
    <TouchableOpacity
      style={[styles.tabItem, itemStyle, style]}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1}
      disabled={tab.disabled}
    >
      {/* Icon */}
      <View style={styles.tabIconContainer}>
        {tab.sfSymbol ? (
          <SFSymbolFallback
            symbol={tab.sfSymbol}
            color={tabColor}
            isActive={isActive}
          />
        ) : tab.icon ? (
          typeof tab.icon === "string" ? (
            <Text style={[styles.tabIconText, { color: tabColor }]}>
              {tab.icon}
            </Text>
          ) : (
            tab.icon
          )
        ) : null}

        {/* Badge */}
        {tab.badge && tab.badge > 0 && (
          <View
            style={[styles.badge, { backgroundColor: colors.badgeBackground }]}
          >
            <Text style={[styles.badgeText, { color: colors.badgeText }]}>
              {tab.badge > 99 ? "99+" : tab.badge.toString()}
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text
        style={[
          styles.tabTitle,
          {
            color: tabColor,
            fontWeight: isActive ? "600" : "400",
          },
        ]}
        numberOfLines={1}
      >
        {tab.title}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Main Glass Tab Bar Component
 */
export const GlassTabBar: React.FC<GlassTabBarProps> = ({
  tabs,
  activeTabId,
  onTabPress,
  style,
  hidden = false,
  safeAreaInsets = true,
}) => {
  const colors = useGlassTabColors();
  const { height: screenHeight } = Dimensions.get("window");

  if (hidden) {
    return null;
  }

  const tabBarStyle: ViewStyle = {
    backgroundColor: colors.tabBarBackground,
    borderTopColor: colors.tabBarBorder,
  };

  const TabBarContent = (
    <LiquidGlassWrapper
      variant="prominent"
      shape="rect"
      enableContainer={false}
      style={[styles.tabBarContainer, tabBarStyle, style]}
    >
      <View style={styles.tabBarContent}>
        {tabs.map((tab) => (
          <GlassTabItem
            key={tab.id}
            tab={tab}
            isActive={activeTabId === tab.id}
            onPress={() => onTabPress(tab.id)}
            style={{ flex: 1 }}
          />
        ))}
      </View>
    </LiquidGlassWrapper>
  );

  if (safeAreaInsets && Platform.OS === "ios") {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        {TabBarContent}
      </SafeAreaView>
    );
  }

  return TabBarContent;
};

// ==================================================================================
// ENHANCED GLASS TAB BAR VARIANTS
// ==================================================================================

/**
 * Floating Glass Tab Bar (for overlay usage)
 */
export const FloatingGlassTabBar: React.FC<
  GlassTabBarProps & {
    position?: "top" | "bottom";
    margin?: number;
  }
> = ({ position = "bottom", margin = 20, ...props }) => {
  const positionStyle: ViewStyle = {
    position: "absolute",
    left: margin,
    right: margin,
    ...(position === "bottom"
      ? { bottom: margin + (Platform.OS === "ios" ? 34 : 0) }
      : { top: margin + (Platform.OS === "ios" ? 44 : 0) }),
  };

  return (
    <GlassTabBar
      {...props}
      safeAreaInsets={false}
      style={[positionStyle, props.style]}
    />
  );
};

/**
 * Segmented Glass Tab Bar (for inline usage)
 */
export const SegmentedGlassTabBar: React.FC<
  Omit<GlassTabBarProps, "safeAreaInsets">
> = (props) => {
  return (
    <View style={styles.segmentedContainer}>
      <GlassTabBar
        {...props}
        safeAreaInsets={false}
        style={[styles.segmentedTabBar, props.style]}
      />
    </View>
  );
};

// ==================================================================================
// COMPONENT EXPORTS
// ==================================================================================

export { GlassTab, GlassTabBarProps };

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: "transparent",
  },
  tabBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBarContent: {
    flexDirection: "row",
    height: 49, // iOS standard tab bar height
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 8,
    minHeight: 44,
  },
  tabIconContainer: {
    position: "relative",
    marginBottom: 2,
  },
  tabIconText: {
    fontSize: 22,
  },
  tabTitle: {
    fontSize: 10,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  segmentedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  segmentedTabBar: {
    borderRadius: 12,
    overflow: "hidden",
  },
});
