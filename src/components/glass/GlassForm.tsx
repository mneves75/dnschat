/**
 * GlassForm - Evan Bacon Glass UI inspired form components
 *
 * Implements iOS Settings app style glass form lists and sections
 * following Apple's design guidelines and best practices.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 17 Liquid Glass Support + Evan Bacon Glass UI)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
  RefreshControl,
  RefreshControlProps,
} from "react-native";
import { LiquidGlassWrapper } from "../LiquidGlassWrapper";

// ==================================================================================
// TYPES AND INTERFACES
// ==================================================================================

interface GlassFormProps {
  /** Navigation title for the form */
  navigationTitle?: string;
  /** Children form sections */
  children: React.ReactNode;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Pull-to-refresh control */
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

interface GlassFormSectionProps {
  /** Section title */
  title?: string;
  /** Section footer text */
  footer?: string;
  /** Children form items */
  children?: React.ReactNode;
  /** Custom section style */
  style?: StyleProp<ViewStyle>;
}

interface GlassFormItemProps {
  /** Item title */
  title: string;
  /** Item subtitle/description */
  subtitle?: string;
  /** Right side content */
  rightContent?: React.ReactNode;
  /** Press handler */
  onPress?: () => void;
  /** Custom item style */
  style?: StyleProp<ViewStyle>;
  /** Show chevron indicator */
  showChevron?: boolean;
  /** Disable haptic feedback */
  disableHaptics?: boolean;
  /** Accessibility identifier */
  testID?: string;
}

interface GlassFormLinkProps extends GlassFormItemProps {
  /** Navigation href */
  href?: string;
  /** External URL */
  url?: string;
}

// ==================================================================================
// ADAPTIVE COLOR SYSTEM
// ==================================================================================

const useGlassColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    // Glass backgrounds (inspired by Apple's system colors)
    glassPrimary: isDark
      ? "rgba(28, 28, 30, 0.15)" // Much more transparent dark
      : "rgba(242, 242, 247, 0.08)", // Nearly transparent light

    glassSecondary: isDark
      ? "rgba(44, 44, 46, 0.15)" // Much more transparent dark
      : "rgba(255, 255, 255, 0.08)", // Nearly transparent light

    // Text colors
    textPrimary: isDark ? "#FFFFFF" : "#000000",
    textSecondary: isDark ? "#AEAEB2" : "#6D6D70",
    textTertiary: isDark ? "#8E8E93" : "#8E8E93",

    // Separators
    separator: isDark ? "rgba(84, 84, 88, 0.6)" : "rgba(60, 60, 67, 0.15)",

    // Interactive states
    highlighted: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",

    // Borders
    border: isDark ? "rgba(84, 84, 88, 0.4)" : "rgba(198, 198, 200, 0.6)",
  };
};

// ==================================================================================
// HAPTIC FEEDBACK SYSTEM
// ==================================================================================

const useHapticFeedback = () => {
  const triggerSelectionFeedback = React.useCallback(() => {
    if (Platform.OS === "ios") {
      // iOS haptic feedback (would need expo-haptics)
      console.log("🔸 Haptic: Selection feedback");
      // HapticFeedback.selectionAsync();
    }
  }, []);

  const triggerImpactFeedback = React.useCallback(
    (style: "light" | "medium" | "heavy" = "light") => {
      if (Platform.OS === "ios") {
        console.log(`🔸 Haptic: Impact feedback (${style})`);
        // HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle[style]);
      }
    },
    [],
  );

  return { triggerSelectionFeedback, triggerImpactFeedback };
};

// ==================================================================================
// GLASS FORM COMPONENTS
// ==================================================================================

/**
 * Main Glass Form Container
 */
export const GlassForm: React.FC<GlassFormProps> = ({
  navigationTitle,
  children,
  style,
  refreshControl,
}) => {
  const colors = useGlassColors();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: "transparent", // Remove solid background for glass effect visibility
  };

  return (
    <View style={[containerStyle, style]}>
      <ScrollView
        style={styles.scrollContainer}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {navigationTitle && (
          <View style={styles.titleContainer}>
            <Text
              style={[styles.navigationTitle, { color: colors.textPrimary }]}
            >
              {navigationTitle}
            </Text>
          </View>
        )}
        {children}
      </ScrollView>
    </View>
  );
};

/**
 * Glass Form Section
 */
export const GlassFormSection: React.FC<GlassFormSectionProps> = ({
  title,
  footer,
  children,
  style,
}) => {
  const colors = useGlassColors();

  return (
    <View style={[styles.sectionContainer, style]}>
      {title && (
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {title.toUpperCase()}
          </Text>
        </View>
      )}

      <LiquidGlassWrapper
        variant="regular"
        shape="roundedRect"
        cornerRadius={10}
        style={styles.sectionContent}
      >
        {React.Children.map(children, (child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < React.Children.count(children) - 1 && (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors.separator },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </LiquidGlassWrapper>

      {footer && (
        <View style={styles.sectionFooterContainer}>
          <Text style={[styles.sectionFooter, { color: colors.textTertiary }]}>
            {footer}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Glass Form Item
 */
export const GlassFormItem: React.FC<GlassFormItemProps> = ({
  title,
  subtitle,
  rightContent,
  onPress,
  style,
  showChevron = false,
  disableHaptics = false,
  testID,
}) => {
  const colors = useGlassColors();
  const { triggerSelectionFeedback } = useHapticFeedback();
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePress = React.useCallback(() => {
    if (!disableHaptics) {
      triggerSelectionFeedback();
    }
    onPress?.();
  }, [onPress, triggerSelectionFeedback, disableHaptics]);

  const itemStyle: ViewStyle = {
    backgroundColor: isPressed ? colors.highlighted : "transparent",
  };

  const ItemContent = (
    <View style={[styles.itemContainer, itemStyle, style]}>
      <View style={styles.itemContentLeft}>
        <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.itemContentRight}>
        {rightContent}
        {showChevron && (
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>
            ›
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={1}
        testID={testID}
        accessibilityLabel={testID}
      >
        {ItemContent}
      </TouchableOpacity>
    );
  }

  if (testID) {
    return (
      <View testID={testID} accessibilityLabel={testID}>
        {ItemContent}
      </View>
    );
  }

  return ItemContent;
};

/**
 * Glass Form Link (for navigation)
 */
export const GlassFormLink: React.FC<GlassFormLinkProps> = ({
  href,
  url,
  ...props
}) => {
  const handlePress = React.useCallback(() => {
    if (href) {
      console.log(`🔗 Navigate to: ${href}`);
      // Navigation logic would go here
    } else if (url) {
      console.log(`🌐 Open URL: ${url}`);
      // URL opening logic would go here
    }
    props.onPress?.();
  }, [href, url, props.onPress]);

  return <GlassFormItem {...props} onPress={handlePress} showChevron={true} />;
};

// ==================================================================================
// COMPONENT EXPORTS
// ==================================================================================

// Namespace export for convenience
export const Form = {
  List: GlassForm,
  Section: GlassFormSection,
  Item: GlassFormItem,
  Link: GlassFormLink,
};

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  navigationTitle: {
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 0.37,
  },
  sectionContainer: {
    marginBottom: 35,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: -0.08,
  },
  sectionContent: {
    marginHorizontal: 20,
    overflow: "hidden",
  },
  sectionFooterContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionFooter: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  itemContentLeft: {
    flex: 1,
  },
  itemContentRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "400",
    letterSpacing: -0.43,
  },
  itemSubtitle: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.24,
    marginTop: 2,
  },
  chevron: {
    fontSize: 17,
    fontWeight: "600",
  },
});
