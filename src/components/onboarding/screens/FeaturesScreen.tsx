import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../../i18n";

interface Feature {
  label: string;
  title: string;
  description: string;
  action?: {
    text: string;
    onPress: () => void;
  };
}

export function FeaturesScreen() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      label: t("screen.onboarding.features.logs.label"),
      title: t("screen.onboarding.features.logs.title"),
      description: t("screen.onboarding.features.logs.description"),
    },
    {
      label: t("screen.onboarding.features.customize.label"),
      title: t("screen.onboarding.features.customize.title"),
      description: t("screen.onboarding.features.customize.description"),
    },
    {
      label: t("screen.onboarding.features.liquidGlass.label"),
      title: t("screen.onboarding.features.liquidGlass.title"),
      description: t("screen.onboarding.features.liquidGlass.description"),
    },
    {
      label: t("screen.onboarding.features.i18n.label"),
      title: t("screen.onboarding.features.i18n.title"),
      description: t("screen.onboarding.features.i18n.description"),
    },
    {
      label: t("screen.onboarding.features.haptics.label"),
      title: t("screen.onboarding.features.haptics.title"),
      description: t("screen.onboarding.features.haptics.description"),
    },
    {
      label: t("screen.onboarding.features.themes.label"),
      title: t("screen.onboarding.features.themes.title"),
      description: t("screen.onboarding.features.themes.description"),
    },
    {
      label: t("screen.onboarding.features.storage.label"),
      title: t("screen.onboarding.features.storage.title"),
      description: t("screen.onboarding.features.storage.description"),
    },
    {
      label: t("screen.onboarding.features.fallbacks.label"),
      title: t("screen.onboarding.features.fallbacks.title"),
      description: t("screen.onboarding.features.fallbacks.description"),
    },
    {
      label: t("screen.onboarding.features.opensource.label"),
      title: t("screen.onboarding.features.opensource.title"),
      description: t("screen.onboarding.features.opensource.description"),
      action: {
        text: t("screen.onboarding.features.opensource.action"),
        onPress: () => {
          Linking.openURL("https://github.com/mvneves/chat-dns");
        },
      },
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={[typography.displayMedium, { color: palette.accentTint }]}>
            {t("screen.onboarding.header.label")}
          </Text>

          <Text
            style={[
              typography.title1,
              styles.title,
              { color: palette.textPrimary },
            ]}
          >
            {t("screen.onboarding.header.title")}
          </Text>

          <Text
            style={[
              typography.callout,
              styles.subtitle,
              { color: palette.textSecondary },
            ]}
          >
            {t("screen.onboarding.header.subtitle")}
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              palette={palette}
              typography={typography}
            />
          ))}
        </View>

        <View
          style={[
            styles.readySection,
            {
              backgroundColor: palette.accentSurface,
              borderColor: palette.accentBorder,
            },
          ]}
        >
          <Text
            style={[
              typography.title3,
              styles.readyTitle,
              { color: palette.accentTint, fontWeight: "700" },
            ]}
          >
            {t("screen.onboarding.ready.title")}
          </Text>

          <Text
            style={[
              typography.callout,
              styles.readyText,
              { color: palette.textPrimary },
            ]}
          >
            {t("screen.onboarding.ready.description")}
          </Text>
        </View>
      </ScrollView>

      <OnboardingNavigation
        nextButtonText={t("screen.onboarding.ready.button")}
        showSkip={false}
        showBack={false}
      />
    </View>
  );
}

interface FeatureCardProps {
  feature: Feature;
  palette: ReturnType<typeof useImessagePalette>;
  typography: ReturnType<typeof useTypography>;
}

function FeatureCard({ feature, palette, typography }: FeatureCardProps) {
  return (
    <View
      style={[
        styles.featureCard,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <View
        style={[
          styles.featureLabelContainer,
          {
            backgroundColor: palette.accentSurface,
            borderColor: palette.accentBorder,
          },
        ]}
      >
        <Text
          style={[
            typography.caption1,
            styles.featureLabel,
            { color: palette.accentTint, fontWeight: "600" },
          ]}
        >
          {feature.label}
        </Text>
      </View>

      <Text
        style={[
          typography.headline,
          styles.featureTitle,
          { color: palette.textPrimary },
        ]}
      >
        {feature.title}
      </Text>

      <Text
        style={[
          typography.callout,
          styles.featureDescription,
          { color: palette.textSecondary },
        ]}
      >
        {feature.description}
      </Text>

      {feature.action && (
        /* iOS HIG: External link button to open GitHub repository in browser */
        <TouchableOpacity
          style={[
            styles.featureAction,
            { backgroundColor: palette.accentTint },
          ]}
          onPress={feature.action.onPress}
          activeOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel={feature.action.text}
          accessibilityHint="Opens the DNS Chat GitHub repository in your browser where you can view the source code and contribute"
        >
          <Text
            style={[
              typography.footnote,
              styles.featureActionText,
              { color: palette.solid, fontWeight: "600" },
            ]}
          >
            {feature.action.text}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: LiquidGlassSpacing.lg,
    paddingTop: LiquidGlassSpacing.lg,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: LiquidGlassSpacing.xxl,
  },
  title: {
    textAlign: "center",
    marginBottom: LiquidGlassSpacing.sm,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  featuresGrid: {
    gap: LiquidGlassSpacing.md,
    marginBottom: LiquidGlassSpacing.xxl,
  },
  featureCard: {
    padding: LiquidGlassSpacing.lg,
    borderRadius: LiquidGlassSpacing.md,
    borderWidth: 1,
  },
  featureLabelContainer: {
    paddingHorizontal: LiquidGlassSpacing.xs,
    paddingVertical: 2,
    borderRadius: LiquidGlassSpacing.xxs,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: LiquidGlassSpacing.sm,
  },
  featureLabel: {
    textTransform: "uppercase",
  },
  featureTitle: {
    fontWeight: "700",
    marginBottom: LiquidGlassSpacing.xs,
  },
  featureDescription: {
    lineHeight: 21,
    opacity: 0.8,
  },
  featureAction: {
    marginTop: LiquidGlassSpacing.sm,
    paddingVertical: LiquidGlassSpacing.xs,
    paddingHorizontal: LiquidGlassSpacing.md,
    borderRadius: LiquidGlassSpacing.xs,
    alignSelf: "flex-start",
  },
  featureActionText: {
    fontWeight: "600",
  },
  readySection: {
    padding: LiquidGlassSpacing.xl,
    borderRadius: LiquidGlassSpacing.md,
    marginBottom: LiquidGlassSpacing.lg,
    alignItems: "center",
    borderWidth: 2,
  },
  readyTitle: {
    marginBottom: LiquidGlassSpacing.sm,
    textAlign: "center",
  },
  readyText: {
    lineHeight: 24,
    textAlign: "center",
    opacity: 0.9,
  },
});
