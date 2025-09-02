import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";

// Import the app icon from assets (same pattern as newspaper.png)
const AppIcon = require("../../../assets/dnschat_ios26.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
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
    ]).start();
  }, []);

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
              styles.title,
              isDark ? styles.darkTitle : styles.lightTitle,
            ]}
          >
            Welcome to DNS Chat
          </Text>

          <Text
            style={[
              styles.subtitle,
              isDark ? styles.darkSubtitle : styles.lightSubtitle,
            ]}
          >
            The world's first chat app that uses DNS queries to communicate with
            AI
          </Text>
        </Animated.View>

        <View style={styles.featuresSection}>
          <FeatureItem
            icon="🚀"
            title="Revolutionary Technology"
            description="Chat through DNS TXT records - no traditional APIs needed"
            isDark={isDark}
          />

          <FeatureItem
            icon="🔒"
            title="Privacy-Focused"
            description="Your conversations travel through the global DNS infrastructure"
            isDark={isDark}
          />

          <FeatureItem
            icon="⚡"
            title="Network Resilient"
            description="Automatically adapts to different network conditions"
            isDark={isDark}
          />
        </View>
      </ScrollView>

      <OnboardingNavigation showBack={false} />
    </View>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  isDark: boolean;
}

function FeatureItem({ icon, title, description, isDark }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text
          style={[
            styles.featureTitle,
            isDark ? styles.darkFeatureTitle : styles.lightFeatureTitle,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.featureDescription,
            isDark
              ? styles.darkFeatureDescription
              : styles.lightFeatureDescription,
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  lightTitle: {
    color: "#000000",
  },
  darkTitle: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    opacity: 0.8,
  },
  lightSubtitle: {
    color: "#666666",
  },
  darkSubtitle: {
    color: "#999999",
  },
  featuresSection: {
    gap: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  featureIcon: {
    fontSize: 32,
    marginTop: 4,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  lightFeatureTitle: {
    color: "#000000",
  },
  darkFeatureTitle: {
    color: "#FFFFFF",
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  lightFeatureDescription: {
    color: "#666666",
  },
  darkFeatureDescription: {
    color: "#999999",
  },
});
