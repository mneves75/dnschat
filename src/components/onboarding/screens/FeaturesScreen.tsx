import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";

interface Feature {
  icon: string;
  title: string;
  description: string;
  action?: {
    text: string;
    onPress: () => void;
  };
}

export function FeaturesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const features: Feature[] = [
    {
      icon: "📊",
      title: "DNS Query Logs",
      description:
        "Monitor all DNS queries in real-time with detailed timing and fallback information.",
    },
    {
      icon: "⚙️",
      title: "Customizable Settings",
      description:
        "Configure DNS servers, enable HTTPS preferences, and optimize for your network.",
    },
    {
      icon: "🌙",
      title: "Dark & Light Themes",
      description:
        "Beautiful interface that adapts to your system preferences automatically.",
    },
    {
      icon: "💾",
      title: "Local Storage",
      description:
        "All your conversations are stored securely on your device - no cloud dependency.",
    },
    {
      icon: "🔄",
      title: "Smart Fallbacks",
      description:
        "Intelligent fallback system ensures connectivity across different network conditions.",
    },
    {
      icon: "🌐",
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
          <Text style={styles.icon}>✨</Text>

          <Text
            style={[
              styles.title,
              isDark ? styles.darkTitle : styles.lightTitle,
            ]}
          >
            Powerful Features
          </Text>

          <Text
            style={[
              styles.subtitle,
              isDark ? styles.darkSubtitle : styles.lightSubtitle,
            ]}
          >
            Discover what makes DNS Chat special
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} isDark={isDark} />
          ))}
        </View>

        <View
          style={[
            styles.readySection,
            isDark ? styles.darkReadySection : styles.lightReadySection,
          ]}
        >
          <Text
            style={[
              styles.readyTitle,
              isDark ? styles.darkReadyTitle : styles.lightReadyTitle,
            ]}
          >
            🎉 You're All Set!
          </Text>

          <Text
            style={[
              styles.readyText,
              isDark ? styles.darkReadyText : styles.lightReadyText,
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
  isDark: boolean;
}

function FeatureCard({ feature, isDark }: FeatureCardProps) {
  return (
    <View
      style={[
        styles.featureCard,
        isDark ? styles.darkFeatureCard : styles.lightFeatureCard,
      ]}
    >
      <Text style={styles.featureIcon}>{feature.icon}</Text>

      <Text
        style={[
          styles.featureTitle,
          isDark ? styles.darkFeatureTitle : styles.lightFeatureTitle,
        ]}
      >
        {feature.title}
      </Text>

      <Text
        style={[
          styles.featureDescription,
          isDark
            ? styles.darkFeatureDescription
            : styles.lightFeatureDescription,
        ]}
      >
        {feature.description}
      </Text>

      {feature.action && (
        <TouchableOpacity
          style={[
            styles.featureAction,
            isDark ? styles.darkFeatureAction : styles.lightFeatureAction,
          ]}
          onPress={feature.action.onPress}
        >
          <Text
            style={[
              styles.featureActionText,
              isDark
                ? styles.darkFeatureActionText
                : styles.lightFeatureActionText,
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  lightTitle: {
    color: "#000000",
  },
  darkTitle: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  lightSubtitle: {
    color: "#4A4A4A",
  },
  darkSubtitle: {
    color: "#999999",
  },
  featuresGrid: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  lightFeatureCard: {
    backgroundColor: "#FAFAFA",
    borderColor: "#E5E5EA",
  },
  darkFeatureCard: {
    backgroundColor: "#1C1C1E",
    borderColor: "#2C2C2E",
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  lightFeatureTitle: {
    color: "#000000",
  },
  darkFeatureTitle: {
    color: "#FFFFFF",
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 21,
    opacity: 0.8,
  },
  lightFeatureDescription: {
    color: "#4A4A4A",
  },
  darkFeatureDescription: {
    color: "#999999",
  },
  featureAction: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  lightFeatureAction: {
    backgroundColor: "#007AFF",
  },
  darkFeatureAction: {
    backgroundColor: "#0A84FF",
  },
  featureActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  lightFeatureActionText: {
    color: "#FFFFFF",
  },
  darkFeatureActionText: {
    color: "#FFFFFF",
  },
  readySection: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  lightReadySection: {
    backgroundColor: "#F0F9FF",
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  darkReadySection: {
    backgroundColor: "#0D1B26",
    borderColor: "#0A84FF",
    borderWidth: 2,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  lightReadyTitle: {
    color: "#007AFF",
  },
  darkReadyTitle: {
    color: "#0A84FF",
  },
  readyText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    opacity: 0.9,
  },
  lightReadyText: {
    color: "#333333",
  },
  darkReadyText: {
    color: "#E5E5E7",
  },
});
