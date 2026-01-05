/**
 * Profile - User profile screen with statistics and data management
 *
 * Displays user information, chat statistics, and data management options.
 * Features glass UI, entrance animations, and accessibility support.
 *
 * @see IOS-GUIDELINES.md - iOS 26 profile screen patterns
 * @see DESIGN-UI-UX-GUIDELINES.md - Profile and settings UI guidelines
 */

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from "react-native";
import Animated from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTranslation } from "../../i18n";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getCornerRadius } from "../../ui/theme/liquidGlassSpacing";
import { Form, LiquidGlassWrapper } from "../../components/glass";
import { useScreenEntrance } from "../../ui/hooks/useScreenEntrance";
import { useChat } from "../../context/ChatContext";
import { formatDistanceToNow } from "date-fns";

interface ProfileProps {
  user?: string;
}

export function Profile({ user }: ProfileProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const palette = useImessagePalette();
  const { animatedStyle } = useScreenEntrance();
  const { chats, clearAllChats } = useChat();

  // Calculate statistics
  const totalChats = chats.length;
  const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
  const oldestChat = chats.length > 0
    ? chats.reduce((oldest, chat) =>
        chat.createdAt < oldest.createdAt ? chat : oldest
      )
    : null;
  const firstChatDate = oldestChat
    ? formatDistanceToNow(oldestChat.createdAt, { addSuffix: true })
    : t("screen.profile.noChatsYet", { defaultValue: "No chats yet" });

  const averageMessagesPerChat = totalChats > 0
    ? Math.round(totalMessages / totalChats)
    : 0;

  // Get user display name
  const displayName = user || t("screen.profile.defaultUser", { defaultValue: "User" });

  const handleClearData = () => {
    Alert.alert(
      t("screen.profile.alerts.clearDataTitle", { defaultValue: "Clear All Data" }),
      t("screen.profile.alerts.clearDataMessage", {
        defaultValue: "This will delete all your chats and messages. This action cannot be undone.",
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("screen.profile.alerts.clearDataConfirm", { defaultValue: "Clear Data" }),
          style: "destructive",
          onPress: () => {
            clearAllChats?.();
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      t("screen.profile.alerts.exportTitle", { defaultValue: "Export Data" }),
      t("screen.profile.alerts.exportMessage", {
        defaultValue: "Data export will be available in a future update.",
      }),
      [{ text: t("common.ok", { defaultValue: "OK" }) }]
    );
  };

  const handleOpenSettings = () => {
    router.push("/(modals)/settings");
  };

  return (
    <Form.List
      testID="profile-screen"
      navigationTitle={t("screen.profile.navigationTitle", { defaultValue: "Profile" })}
      style={styles.container}
    >
      <Animated.View style={animatedStyle}>
        {/* Profile Header */}
        <Form.Section>
          <View
            style={[
              styles.profileHeader,
              { backgroundColor: Platform.OS === "android" ? palette.solid : palette.surface },
            ]}
          >
            {/* Avatar */}
            <LiquidGlassWrapper
              variant="interactive"
              shape="circle"
              style={styles.avatarContainer}
              accessibilityLabel={t("screen.profile.avatarLabel", {
                defaultValue: "Profile avatar",
              })}
            >
              <Text style={[styles.avatarText, { color: palette.userBubble }]}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </LiquidGlassWrapper>

            {/* Name */}
            <Text style={[styles.userName, { color: palette.textPrimary }]}>
              {displayName}
            </Text>

            {/* Member since */}
            {oldestChat && (
              <Text style={[styles.memberSince, { color: palette.textSecondary }]}>
                {t("screen.profile.memberSince", {
                  defaultValue: "First chat {{date}}",
                  date: firstChatDate,
                })}
              </Text>
            )}
          </View>
        </Form.Section>

        {/* Statistics Section */}
        <Form.Section
          title={t("screen.profile.statistics.title", { defaultValue: "Statistics" })}
          footer={t("screen.profile.statistics.footer", {
            defaultValue: "Your chat activity summary",
          })}
        >
          <Form.Item
            title={t("screen.profile.statistics.totalChats", {
              defaultValue: "Total Conversations",
            })}
            rightContent={
              <Text style={[styles.statValue, { color: palette.userBubble }]}>
                {totalChats}
              </Text>
            }
          />
          <Form.Item
            title={t("screen.profile.statistics.totalMessages", {
              defaultValue: "Total Messages",
            })}
            rightContent={
              <Text style={[styles.statValue, { color: palette.userBubble }]}>
                {totalMessages}
              </Text>
            }
          />
          <Form.Item
            title={t("screen.profile.statistics.averageMessages", {
              defaultValue: "Avg. Messages per Chat",
            })}
            rightContent={
              <Text style={[styles.statValue, { color: palette.userBubble }]}>
                {averageMessagesPerChat}
              </Text>
            }
          />
        </Form.Section>

        {/* Preferences Section */}
        <Form.Section
          title={t("screen.profile.preferences.title", { defaultValue: "Preferences" })}
        >
          <Form.Item
            title={t("screen.profile.preferences.settings", { defaultValue: "Settings" })}
            subtitle={t("screen.profile.preferences.settingsDescription", {
              defaultValue: "DNS, accessibility, and more",
            })}
            onPress={handleOpenSettings}
            showChevron
          />
        </Form.Section>

        {/* Data Management Section */}
        <Form.Section
          title={t("screen.profile.data.title", { defaultValue: "Data Management" })}
          footer={t("screen.profile.data.footer", {
            defaultValue: "Manage your chat history and personal data",
          })}
        >
          <Form.Item
            title={t("screen.profile.data.export", { defaultValue: "Export Data" })}
            subtitle={t("screen.profile.data.exportDescription", {
              defaultValue: "Download your chat history",
            })}
            onPress={handleExportData}
            showChevron
          />
          <Form.Item
            title={t("screen.profile.data.clearAll", { defaultValue: "Clear All Data" })}
            subtitle={t("screen.profile.data.clearAllDescription", {
              defaultValue: "Delete all chats and messages",
            })}
            onPress={handleClearData}
            showChevron
            destructive
          />
        </Form.Section>
      </Animated.View>
    </Form.List>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: LiquidGlassSpacing.xl,
    paddingHorizontal: LiquidGlassSpacing.lg,
    marginHorizontal: LiquidGlassSpacing.lg,
    borderRadius: getCornerRadius("card"),
    // iOS shadows
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: LiquidGlassSpacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "600",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: LiquidGlassSpacing.xs,
  },
  memberSince: {
    fontSize: 14,
    fontWeight: "400",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "600",
  },
});

export default Profile;
