import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Image,
  Animated,
  ScrollView,
  Platform,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlassTheme } from "../hooks/useGlassTheme";

// Import package.json to get version
const packageJson = require("../../package.json");

// Import app icon
const AppIcon = require("../assets/dnschat_ios26.png");

/**
 * Credit item type
 */
interface Credit {
  name: string;
  description: string;
  url: string;
}

/**
 * About screen with progressive blur and scrollable glass story.
 *
 * Features:
 * - Progressive blur header that morphs from prominent → regular on scroll
 * - Glass-styled sections using useGlassTheme()
 * - iOS 26 Liquid Glass depth effects with automatic fallbacks
 * - Optimized ScrollView for static content
 *
 * Phase 3: About + Dev Tools Modernization (September 30, 2025)
 */
export function About() {
  const router = useRouter();
  const { colors, getGlassStyle } = useGlassTheme();
  const [iconError, setIconError] = useState(false);

  // Scroll animation for progressive blur
  const scrollY = useRef(new Animated.Value(0)).current;

  // Interpolate header blur intensity based on scroll position
  const headerBlurIntensity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.6], // From prominent (1) to regular (0.6)
    extrapolate: "clamp",
  });

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Unable to open link", "No app can handle this link.");
        return;
      }
      await Linking.openURL(url);
    } catch (error: any) {
      Alert.alert("Unable to open link", error?.message || String(error));
    }
  };

  const credits: Credit[] = useMemo(() => [
    {
      name: "@arxiv_daily",
      description: "Ch.at original concept and LLM over DNS service",
      url: "https://x.com/Arxiv_Daily/status/1952452878716805172",
    },
    {
      name: "@levelsio (Pieter Levels)",
      description: "Retweeted @arxiv_daily",
      url: "https://x.com/levelsio",
    },
    {
      name: "React Native Team",
      description: "Cross-platform mobile framework",
      url: "https://reactnative.dev",
    },
    {
      name: "Expo Team",
      description: "Development build and tooling platform",
      url: "https://expo.dev",
    },
    {
      name: "React Navigation",
      description: "Navigation library for React Native",
      url: "https://reactnavigation.org",
    },
    {
      name: "AsyncStorage Community",
      description: "Local storage solution",
      url: "https://react-native-async-storage.github.io",
    },
    {
      name: "Cloudflare",
      description: "DNS-over-HTTPS infrastructure",
      url: "https://cloudflare.com",
    },
  ], []);

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Header Section - Progressive Blur */}
        <Animated.View
          style={[
            getGlassStyle("card", "prominent", "roundedRect"),
            styles.headerContainer,
            { opacity: headerBlurIntensity },
          ]}
        >
          <View style={styles.header}>
            <View style={[getGlassStyle("card", "regular", "roundedRect"), styles.logoContainer]}>
              {!iconError ? (
                <Image
                  source={AppIcon}
                  style={styles.logoImage}
                  resizeMode="contain"
                  onLoad={() => {
                    if (__DEV__) {
                      console.log("✅ About icon loaded successfully");
                    }
                  }}
                  onError={(error) => {
                    if (__DEV__) {
                      console.log("🚨 About icon load error:", error.nativeEvent?.error || "Unknown error");
                    }
                    setIconError(true);
                  }}
                />
              ) : (
                <Text style={styles.logoText}>DNS</Text>
              )}
            </View>
            <Text style={styles.title}>DNS Chat</Text>
            <View style={[getGlassStyle("button", "interactive", "capsule"), styles.versionBadge]}>
              <Text style={styles.versionText}>v{packageJson.version}</Text>
            </View>
            <Text style={styles.description}>
              Chat with AI using DNS TXT queries - a unique approach to LLM communication.
            </Text>
          </View>
        </Animated.View>

        {/* Inspiration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspiration</Text>
          <Text style={styles.sectionFooter}>
            This project was inspired by the incredible work of the open-source community
          </Text>
          <View style={[getGlassStyle("card", "regular", "roundedRect"), styles.listContainer]}>
            <LinkItem
              title="@Arxiv_Daily Tweet"
              subtitle="Original LLM over DNS concept"
              onPress={() => openLink("https://x.com/Arxiv_Daily/status/1952452878716805172")}
              colors={colors}
              isFirst
            />
            <LinkItem
              title="Ch.at Project"
              subtitle="Universal Basic Intelligence via DNS"
              onPress={() => openLink("https://github.com/Deep-ai-inc/ch.at")}
              colors={colors}
            />
            <LinkItem
              title="@levelsio"
              subtitle="Shared the original concept"
              onPress={() => openLink("https://x.com/levelsio")}
              colors={colors}
              isLast
            />
          </View>
        </View>

        {/* Project Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project</Text>
          <View style={[getGlassStyle("card", "regular", "roundedRect"), styles.listContainer]}>
            <LinkItem
              title="GitHub Repository"
              subtitle="View source code and contribute"
              onPress={() => openLink("https://github.com/mneves75/dnschat")}
              colors={colors}
              isFirst
            />
            <LinkItem
              title="Report an Issue"
              subtitle="Found a bug? Let us know"
              onPress={() => openLink("https://github.com/mneves75/dnschat/issues")}
              colors={colors}
            />
            <LinkItem
              title="@dnschat on X"
              subtitle="Follow for updates"
              onPress={() => openLink("https://x.com/dnschat")}
              colors={colors}
              isLast
            />
          </View>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <View style={[getGlassStyle("card", "regular", "roundedRect"), styles.listContainer]}>
            <LinkItem
              title="Marcus Neves"
              subtitle="Created by @mneves75"
              onPress={() => openLink("https://x.com/mneves75")}
              colors={colors}
              isFirst
            />
            {typeof __DEV__ !== "undefined" && __DEV__ && (
              <LinkItem
                title="Developer Logs (Dev)"
                subtitle="Open DNS logs viewer screen"
                onPress={() => router.push("/(app)/(tabs)/dev-logs")}
                colors={colors}
                isLast
              />
            )}
          </View>
        </View>

        {/* Special Thanks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Thanks</Text>
          <Text style={styles.sectionFooter}>
            This project wouldn't be possible without these amazing open-source projects and services
          </Text>
          <View style={[getGlassStyle("card", "regular", "roundedRect"), styles.listContainer]}>
            {credits.map((credit, index) => (
              <LinkItem
                key={credit.name}
                title={credit.name}
                subtitle={credit.description}
                onPress={() => openLink(credit.url)}
                colors={colors}
                isFirst={index === 0}
                isLast={index === credits.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Marcus Neves • MIT Licensed</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

/**
 * Reusable link item component with glass styling
 */
interface LinkItemProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: any;
  isFirst?: boolean;
  isLast?: boolean;
}

const LinkItem: React.FC<LinkItemProps> = React.memo(
  ({ title, subtitle, onPress, colors, isFirst, isLast }) => {
    return (
      <Pressable
        accessibilityRole="link"
        onPress={onPress}
        android_ripple={{ color: colors.accent + "22" }}
        style={({ pressed }) => [
          linkItemStyles.linkItem,
          isFirst && linkItemStyles.linkItemFirst,
          isLast && linkItemStyles.linkItemLast,
          { borderBottomColor: colors.border },
          pressed && linkItemStyles.linkItemPressed,
        ]}
      >
        <View style={linkItemStyles.linkContent}>
          <Text style={[linkItemStyles.linkTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[linkItemStyles.linkSubtitle, { color: colors.muted }]}>{subtitle}</Text>
        </View>
        <Text style={[linkItemStyles.chevron, { color: colors.muted }]}>›</Text>
      </Pressable>
    );
  }
);

LinkItem.displayName = "LinkItem";

const linkItemStyles = StyleSheet.create({
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linkItemPressed: {
    opacity: 0.7,
  },
  linkItemFirst: {
    paddingTop: 16,
  },
  linkItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 16,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 24,
    fontWeight: "300",
    marginLeft: 8,
  },
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
    },
    // Header Section
    headerContainer: {
      padding: 24,
      marginBottom: 24,
    },
    header: {
      alignItems: "center",
    },
    logoContainer: {
      width: 80,
      height: 80,
      marginBottom: 16,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    logoImage: {
      width: 60,
      height: 60,
      borderRadius: 15,
    },
    logoText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.accent,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
      textAlign: "center",
      color: colors.text,
    },
    versionBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 16,
    },
    versionText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.accent,
    },
    description: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      fontWeight: "400",
      color: colors.muted,
    },
    // Section
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: colors.muted,
      marginBottom: 8,
      marginLeft: 4,
    },
    sectionFooter: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.muted,
      marginBottom: 8,
      marginLeft: 4,
    },
    listContainer: {
      overflow: "hidden",
    },
    // Footer
    footer: {
      paddingVertical: 20,
      alignItems: "center",
    },
    footerText: {
      fontSize: 13,
      color: colors.muted,
    },
  });
