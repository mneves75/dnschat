/**
 * About - App information and credits screen
 *
 * Features:
 * - Screen entrance animations
 * - Palette-based theming
 * - Glass UI components
 *
 * @see IOS-GUIDELINES.md - iOS 26 Liquid Glass patterns
 */

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Linking, Image } from "react-native";
import Animated from "react-native-reanimated";
import { Form, LiquidGlassWrapper } from "../../components/glass";
import { useTranslation } from "../../i18n";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import type { IMessagePalette } from "../../ui/theme/imessagePalette";
import { useTypography } from "../../ui/hooks/useTypography";
import { LiquidGlassSpacing, getCornerRadius } from "../../ui/theme/liquidGlassSpacing";
import { useScreenEntrance } from "../../ui/hooks/useScreenEntrance";
import { devLog } from "../../utils/devLog";
import { getAppVersionInfo } from "../../utils/appVersion";

const AppIcon = require("../../assets/dnschat_ios26.png");

const createStyles = (palette: IMessagePalette) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: palette.surface,
      marginHorizontal: LiquidGlassSpacing.lg,
      padding: LiquidGlassSpacing.xl,
    },
    header: {
      alignItems: "center",
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: palette.accentSurface,
      marginBottom: LiquidGlassSpacing.md,
      alignItems: "center",
      justifyContent: "center",
    },
    logoImage: {
      width: 60,
      height: 60,
      borderRadius: getCornerRadius("input"),
    },
    logoText: {
      // Typography applied inline
    },
    title: {
      marginBottom: LiquidGlassSpacing.xs,
      textAlign: "center",
      // Typography applied inline
    },
    versionBadge: {
      paddingHorizontal: LiquidGlassSpacing.sm,
      paddingVertical: LiquidGlassSpacing.xxs + 2, // 6px
      backgroundColor: palette.accentSurface,
      marginBottom: LiquidGlassSpacing.md,
    },
    versionText: {
      // Typography applied inline
    },
    description: {
      textAlign: "center",
      // Typography applied inline
    },
  });

export function About() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useImessagePalette();
  const typography = useTypography();
  const styles = createStyles(palette);
  const { animatedStyle } = useScreenEntrance();
  const [iconError, setIconError] = useState(false);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const credits = [
    {
      name: "@arxiv_daily",
      description: t("screen.about.credits.arxivDaily"),
      url: "https://x.com/Arxiv_Daily/status/1952452878716805172",
    },
    {
      name: "@levelsio (Pieter Levels)",
      description: t("screen.about.credits.levels"),
      url: "https://x.com/levelsio",
    },
    {
      name: "React Native Team",
      description: t("screen.about.credits.reactNative"),
      url: "https://reactnative.dev",
    },
    {
      name: "Expo Team",
      description: t("screen.about.credits.expo"),
      url: "https://expo.dev",
    },
    {
      name: "React Navigation",
      description: t("screen.about.credits.reactNavigation"),
      url: "https://reactnavigation.org",
    },
    {
      name: "AsyncStorage Community",
      description: t("screen.about.credits.asyncStorage"),
      url: "https://react-native-async-storage.github.io",
    },
  ];

  const versionLabel = t("screen.about.versionLabel", {
    version: getAppVersionInfo().displayVersion,
  });

  return (
    <Form.List testID="about-screen" navigationTitle={t("screen.about.navigationTitle")}>
      <Animated.View style={animatedStyle}>
        <Form.Section>
        <LiquidGlassWrapper
          variant="prominent"
          shape="roundedRect"
          cornerRadius={16}
          style={styles.headerContainer}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {!iconError ? (
                <Image
                  source={AppIcon}
                  style={styles.logoImage}
                  resizeMode="contain"
                  onLoad={() => devLog("[About] icon loaded")}
                  onError={(error) => {
                    devLog(
                      "[About] Icon load error:",
                      error.nativeEvent?.error || "Unknown error",
                    );
                    setIconError(true);
                  }}
                />
              ) : (
                <Text
                  style={[
                    styles.logoText,
                    typography["headline"],
                    { color: palette.accentTint, fontWeight: "bold" },
                  ]}
                >
                  {t("screen.about.fallbackInitials")}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.title,
                typography["displaySmall"],
                { color: palette.textPrimary, fontWeight: "bold" },
              ]}
            >
              {t("screen.about.appName")}
            </Text>
            <LiquidGlassWrapper
              variant="interactive"
              shape="capsule"
              style={styles.versionBadge}
            >
              <Text
                style={[
                  styles.versionText,
                  typography["callout"],
                  { color: palette.accentTint, fontWeight: "600" },
                ]}
              >
                {versionLabel}
              </Text>
            </LiquidGlassWrapper>
            <Text
              style={[
                styles.description,
                typography["body"],
                { color: palette.textSecondary },
              ]}
            >
              {t("screen.about.tagline")}
            </Text>
          </View>
        </LiquidGlassWrapper>
      </Form.Section>

      <Form.Section title={t("screen.about.quickActions.title")}>
        <Form.Item
          title={t("screen.about.quickActions.settingsTitle")}
          subtitle={t("screen.about.quickActions.settingsSubtitle")}
          onPress={() => router.push("/settings")}
          showChevron
        />
      </Form.Section>

      <Form.Section
        title={t("screen.about.sections.inspiration.title")}
        footer={t("screen.about.sections.inspiration.footer")}
      >
        <Form.Link
          title={t(
            "screen.about.sections.inspiration.items.arxivTweet.title",
          )}
          subtitle={t(
            "screen.about.sections.inspiration.items.arxivTweet.subtitle",
          )}
          onPress={() =>
            openLink("https://x.com/Arxiv_Daily/status/1952452878716805172")
          }
        />
        <Form.Link
          title={t("screen.about.sections.inspiration.items.chatProject.title")}
          subtitle={t(
            "screen.about.sections.inspiration.items.chatProject.subtitle",
          )}
          onPress={() => openLink("https://github.com/Deep-ai-inc/ch.at")}
        />
        <Form.Link
          title={t("screen.about.sections.inspiration.items.levelsio.title")}
          subtitle={t(
            "screen.about.sections.inspiration.items.levelsio.subtitle",
          )}
          onPress={() => openLink("https://x.com/levelsio")}
        />
      </Form.Section>

      <Form.Section title={t("screen.about.sections.project.title")}>
        <Form.Link
          title={t("screen.about.sections.project.items.github.title")}
          subtitle={t(
            "screen.about.sections.project.items.github.subtitle",
          )}
          onPress={() => openLink("https://github.com/mneves75/dnschat")}
        />
        <Form.Link
          title={t("screen.about.sections.project.items.issues.title")}
          subtitle={t(
            "screen.about.sections.project.items.issues.subtitle",
          )}
          onPress={() => openLink("https://github.com/mneves75/dnschat/issues")}
        />
        <Form.Link
          title={t("screen.about.sections.project.items.updates.title")}
          subtitle={t(
            "screen.about.sections.project.items.updates.subtitle",
          )}
          onPress={() => openLink("https://x.com/dnschat")}
        />
        <Form.Item
          title={t("screen.about.sections.project.settings.title")}
          subtitle={t("screen.about.sections.project.settings.subtitle")}
          onPress={() => router.push("/settings")}
          showChevron
        />
      </Form.Section>

      <Form.Section title={t("screen.about.sections.developer.title")}>
        <Form.Item
          title="Marcus Neves"
          subtitle={t("screen.about.sections.developer.creatorSubtitle", {
            handle: "@mneves75",
          })}
          onPress={() => openLink("https://x.com/mneves75")}
          showChevron
        />
        {typeof __DEV__ !== "undefined" && __DEV__ && (
          <Form.Item
            title={t("screen.about.sections.developer.devLogsTitle")}
            subtitle={t(
              "screen.about.sections.developer.devLogsSubtitle",
            )}
            onPress={() => router.push("/dev/logs")}
            showChevron
          />
        )}
      </Form.Section>

      <Form.Section
        title={t("screen.about.sections.specialThanks.title")}
        footer={t("screen.about.sections.specialThanks.footer")}
      >
        {credits.map((credit) => (
          <Form.Link
            key={credit.name}
            title={credit.name}
            subtitle={credit.description}
            onPress={() => openLink(credit.url)}
          />
        ))}
      </Form.Section>

        <Form.Section footer={t("screen.about.footer")}>{null}</Form.Section>
      </Animated.View>
    </Form.List>
  );
}
