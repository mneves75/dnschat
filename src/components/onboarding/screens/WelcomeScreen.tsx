import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../../i18n";

const AppIcon = require("../../../assets/dnschat_ios26.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function WelcomeScreen() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { t } = useTranslation();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Image
              source={AppIcon}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              typography.displaySmall,
              styles.title,
              { color: palette.textPrimary },
            ]}
          >
            {t("screen.onboarding.welcome.title")}
          </Text>

          <Text
            style={[
              typography.body,
              styles.subtitle,
              { color: palette.textSecondary },
            ]}
          >
            {t("screen.onboarding.welcome.subtitle")}
          </Text>
        </Animated.View>

        <View style={styles.featuresSection}>
          <FeatureItem
            label={t("screen.onboarding.welcome.features.revolutionary.label")}
            title={t("screen.onboarding.welcome.features.revolutionary.title")}
            description={t("screen.onboarding.welcome.features.revolutionary.description")}
            palette={palette}
            typography={typography}
          />

          <FeatureItem
            label={t("screen.onboarding.welcome.features.private.label")}
            title={t("screen.onboarding.welcome.features.private.title")}
            description={t("screen.onboarding.welcome.features.private.description")}
            palette={palette}
            typography={typography}
          />

          <FeatureItem
            label={t("screen.onboarding.welcome.features.fast.label")}
            title={t("screen.onboarding.welcome.features.fast.title")}
            description={t("screen.onboarding.welcome.features.fast.description")}
            palette={palette}
            typography={typography}
          />
        </View>
      </ScrollView>

      <OnboardingNavigation showBack={false} />
    </View>
  );
}

interface FeatureItemProps {
  label: string;
  title: string;
  description: string;
  palette: ReturnType<typeof useImessagePalette>;
  typography: ReturnType<typeof useTypography>;
}

function FeatureItem({ label, title, description, palette, typography }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View
        style={[
          styles.featureIconContainer,
          {
            backgroundColor: palette.accentSurface,
            borderColor: palette.accentBorder,
          },
        ]}
      >
        <Text
          style={[
            typography.headline,
            styles.featureLabel,
            { color: palette.accentTint },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.featureContent}>
        <Text
          style={[
            typography.headline,
            styles.featureTitle,
            { color: palette.textPrimary },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            typography.callout,
            styles.featureDescription,
            { color: palette.textSecondary },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LiquidGlassSpacing.xl,
    paddingTop: LiquidGlassSpacing.xxxl,
    paddingBottom: LiquidGlassSpacing.lg,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: LiquidGlassSpacing.huge,
  },
  iconContainer: {
    marginBottom: LiquidGlassSpacing.xl,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: LiquidGlassSpacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: LiquidGlassSpacing.md,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  featuresSection: {
    gap: LiquidGlassSpacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: LiquidGlassSpacing.md,
  },
  featureIconContainer: {
    paddingHorizontal: LiquidGlassSpacing.sm,
    paddingVertical: LiquidGlassSpacing.xxs,
    borderRadius: LiquidGlassSpacing.xs,
    borderWidth: 1,
    marginTop: LiquidGlassSpacing.xxs,
  },
  featureLabel: {
    fontWeight: "600",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: "600",
    marginBottom: LiquidGlassSpacing.xxs,
  },
  featureDescription: {
    opacity: 0.8,
  },
});
