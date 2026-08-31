import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { PressableRipple } from "../../PressableRipple";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../../i18n";
import { openExternalLink } from "../../../utils/externalLinks";

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
          openExternalLink("https://github.com/mneves75/dnschat");
        },
      },
    },
  ];

  return (
    <View testID="onboarding-features" style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text
            accessibilityElementsHidden={true}
            style={[typography.displayMedium, { color: palette.accentText }]}
          >
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

        <View
          style={[
            styles.featuresGrid,
            { backgroundColor: palette.solid },
          ]}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.label}
              feature={feature}
              isLast={index === features.length - 1}
              palette={palette}
              typography={typography}
            />
          ))}
        </View>

        <View
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={`${t("screen.onboarding.ready.title")}. ${t("screen.onboarding.ready.description")}`}
          accessibilityHint={t("screen.settings.sections.appearance.summaryHint")}
          style={[
            styles.readySection,
            {
              backgroundColor: palette.accentSurface,
              borderColor: palette.accentBorder,
            },
          ]}
        >
          <Text
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={[
              typography.title3,
              styles.readyTitle,
              { color: palette.accentText, fontWeight: "700" },
            ]}
          >
            {t("screen.onboarding.ready.title")}
          </Text>

          <Text
            accessible={false}
            importantForAccessibility="no-hide-descendants"
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
  isLast: boolean;
  palette: ReturnType<typeof useImessagePalette>;
  typography: ReturnType<typeof useTypography>;
}

function FeatureCard({ feature, isLast, palette, typography }: FeatureCardProps) {
  const { t } = useTranslation();

  // A card with an action stays a plain container so its nested link and text
  // remain individually focusable. Label/hint only exist on the summary form —
  // on the container form they were inert props that screen readers ignore.
  const isSummary = !feature.action;

  return (
    <View
      accessible={isSummary}
      accessibilityRole={isSummary ? "summary" : undefined}
      accessibilityLabel={
        isSummary
          ? `${feature.label}. ${feature.title}. ${feature.description}`
          : undefined
      }
      accessibilityHint={
        isSummary
          ? t("screen.settings.sections.appearance.summaryHint")
          : undefined
      }
      style={[
        styles.featureCard,
        !isLast && styles.featureSeparator,
        {
          borderColor: palette.border,
        },
      ]}
    >
      <View
        accessible={Boolean(feature.action)}
        importantForAccessibility={feature.action ? "auto" : "no-hide-descendants"}
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
            { color: palette.accentText, fontWeight: "600" },
          ]}
        >
          {feature.label}
        </Text>
      </View>

      <Text
        accessible={Boolean(feature.action)}
        importantForAccessibility={feature.action ? "auto" : "no-hide-descendants"}
        style={[
          typography.headline,
          styles.featureTitle,
          { color: palette.textPrimary },
        ]}
      >
        {feature.title}
      </Text>

      <Text
        accessible={Boolean(feature.action)}
        importantForAccessibility={feature.action ? "auto" : "no-hide-descendants"}
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
        <PressableRipple
          style={[
            styles.featureAction,
            { backgroundColor: palette.surface },
          ]}
          onPress={feature.action.onPress}
          variant="surface"
          rippleColor={palette.accentTint}
          pressedOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel={feature.action.text}
          accessibilityHint={t("screen.onboarding.features.opensource.accessibilityHint")}
        >
          <Text
            style={[
              typography.footnote,
              styles.featureActionText,
              { color: palette.accentText, fontWeight: "600" },
            ]}
          >
            {feature.action.text}
          </Text>
        </PressableRipple>
      )}
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
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: LiquidGlassSpacing.huge * 12,
    alignSelf: "center",
    paddingHorizontal: LiquidGlassSpacing.lg,
    paddingTop: LiquidGlassSpacing.lg,
    paddingBottom: LiquidGlassSpacing.xl,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: LiquidGlassSpacing.xl,
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
    gap: 0,
    marginBottom: LiquidGlassSpacing.xxl,
    borderRadius: LiquidGlassSpacing.md,
    overflow: "hidden",
  },
  featureCard: {
    padding: LiquidGlassSpacing.lg,
  },
  featureSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    paddingHorizontal: LiquidGlassSpacing.sm,
    paddingVertical: LiquidGlassSpacing.xs,
    borderRadius: LiquidGlassSpacing.xs,
    minHeight: 44,
    justifyContent: "center",
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
