/**
 * NotFound - 404 screen with glass UI
 *
 * Displays when navigation fails with:
 * - Animated entrance
 * - Glass UI container
 * - Clear navigation back to home
 *
 * @see IOS-GUIDELINES.md - iOS 26 error state patterns
 */

import React from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import Animated from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTranslation } from "../../i18n";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getCornerRadius } from "../../ui/theme/liquidGlassSpacing";
import { Form, LiquidGlassWrapper } from "../../components/glass";
import { useScreenEntrance } from "../../ui/hooks/useScreenEntrance";
import { EmptyState } from "../../components/EmptyState";

export function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();
  const palette = useImessagePalette();
  const { animatedStyle } = useScreenEntrance();

  const handleGoHome = () => {
    router.replace("/");
  };

  return (
    <Form.List
      testID="not-found-screen"
      navigationTitle={t("screen.notFound.navigationTitle", { defaultValue: "Not Found" })}
      style={[styles.container, { backgroundColor: palette.backgroundPrimary }]}
    >
      <Form.Section>
        <Animated.View style={animatedStyle}>
          <EmptyState
            title={t("screen.notFound.title")}
            description={t("screen.notFound.description", {
              defaultValue: "The page you're looking for doesn't exist or has been moved.",
            })}
            iconType="error"
            actionLabel={t("screen.notFound.goHome")}
            onAction={handleGoHome}
            testID="not-found-empty-state"
          />
        </Animated.View>
      </Form.Section>

      {/* Quick Links Section */}
      <Form.Section
        title={t("screen.notFound.quickLinks", { defaultValue: "Quick Links" })}
      >
        <Form.Item
          title={t("navigation.tabs.chat")}
          subtitle={t("screen.notFound.chatDescription", {
            defaultValue: "Start a new conversation",
          })}
          onPress={() => router.replace("/")}
          showChevron
        />
        <Form.Item
          title={t("navigation.tabs.logs")}
          subtitle={t("screen.notFound.logsDescription", {
            defaultValue: "View DNS query logs",
          })}
          onPress={() => router.replace("/(tabs)/logs")}
          showChevron
        />
        <Form.Item
          title={t("navigation.tabs.about")}
          subtitle={t("screen.notFound.aboutDescription", {
            defaultValue: "Learn more about DNSChat",
          })}
          onPress={() => router.replace("/(tabs)/about")}
          showChevron
        />
      </Form.Section>
    </Form.List>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
