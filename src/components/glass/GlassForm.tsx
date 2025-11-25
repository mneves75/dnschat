/**
 * GlassForm - Evan Bacon Glass UI inspired form components
 *
 * Implements iOS Settings app style glass form lists and sections
 * following Apple's design guidelines and best practices.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support + Evan Bacon Glass UI)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LiquidGlassWrapper } from "../LiquidGlassWrapper";
import { useImessagePalette } from "../../ui/theme/imessagePalette";

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
  /** Enable nested scrolling on Android */
  nestedScrollEnabled?: boolean;
  /** Test ID for UI testing */
  testID?: string;
}

interface GlassFormSectionProps {
  /** Section title */
  title?: string;
  /** Section footer text */
  footer?: string;
  /** Children form items */
  children: React.ReactNode;
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
  const palette = useImessagePalette();

  return {
    palette,
    glassPrimary: palette.surface,
    glassSecondary: palette.accentSurface,
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    separator: palette.separator,
    highlighted: palette.highlight,
    border: palette.border,
    background: palette.background,
    backgroundSecondary: palette.backgroundSecondary,
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
  nestedScrollEnabled = false,
  testID,
}) => {
  const colors = useGlassColors();
  const insets = useSafeAreaInsets();

  const contentPaddingBottom = Math.max(insets.bottom, 24);
  const contentStyle = React.useMemo(
    () =>
      [styles.scrollContent, { paddingBottom: contentPaddingBottom }, style]
        .filter(Boolean) as ViewStyle[],
    [contentPaddingBottom, style],
  );

  return (
    <SafeAreaView
      testID={testID}
      edges={["top", "right", "bottom", "left"]}
      style={[styles.safeAreaContainer, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentStyle}
        nestedScrollEnabled={nestedScrollEnabled}
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
    </SafeAreaView>
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
      >
        {ItemContent}
      </TouchableOpacity>
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
  safeAreaContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
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
