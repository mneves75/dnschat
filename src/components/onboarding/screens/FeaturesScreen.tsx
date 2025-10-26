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

  const features: Feature[] = [
    {
      label: "Logs",
      title: "DNS Query Logs",
      description:
        "Monitor all DNS queries in real-time with detailed timing and fallback information.",
    },
    {
      label: "Customize",
      title: "Customizable Settings",
      description:
        "Configure DNS servers, enable HTTPS preferences, and optimize for your network.",
    },
    {
      label: "iOS 26",
      title: "Liquid Glass Design",
      description:
        "Beautiful iOS 26 interface with native glass effects and Material Design 3 on Android.",
    },
    {
      label: "i18n",
      title: "Multilingual Support",
      description:
        "Full internationalization with English and Portuguese languages.",
    },
    {
      label: "Haptics",
      title: "Haptic Feedback",
      description:
        "Customizable haptic feedback for interactive elements and actions.",
    },
    {
      label: "Adapt",
      title: "Dark and Light Themes",
      description:
        "Beautiful interface that adapts to your system preferences with high contrast mode support.",
    },
    {
      label: "Local",
      title: "Local Storage",
      description:
        "All your conversations are stored securely on your device - no cloud dependency.",
    },
    {
      label: "Smart",
      title: "Smart Fallbacks",
      description:
        "Intelligent fallback system ensures connectivity across different network conditions.",
    },
    {
      label: "Open",
      title: "Open Source",
      description:
        "Built transparently - explore the code and contribute to the future of DNS chat.",
      action: {
        text: "View on GitHub",
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
            Features
          </Text>

          <Text
            style={[
              typography.title1,
              styles.title,
              { color: palette.textPrimary },
            ]}
          >
            Powerful Features
          </Text>

          <Text
            style={[
              typography.callout,
              styles.subtitle,
              { color: palette.textSecondary },
            ]}
          >
            Discover what makes DNS Chat special
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
            You're All Set
          </Text>

          <Text
            style={[
              typography.callout,
              styles.readyText,
              { color: palette.textPrimary },
            ]}
          >
            You now know how to use DNS Chat and have optimized settings for
            your network. Start chatting and experience the magic of DNS-powered
            conversations!
          </Text>
        </View>
      </ScrollView>

      <OnboardingNavigation
        nextButtonText="Start Chatting"
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
