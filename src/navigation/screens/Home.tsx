/**
 * Home - Dashboard screen with quick actions and recent chats
 *
 * Provides quick access to:
 * - Start new chat
 * - View recent conversations
 * - DNS status indicator
 * - Quick navigation to logs
 *
 * @see IOS-GUIDELINES.md - iOS 26 dashboard patterns
 * @see DESIGN-UI-UX-GUIDELINES.md - Home screen UI guidelines
 */

import React from "react";
import {
  StyleSheet,
  Text,
  View,
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
import { useSettings } from "../../context/SettingsContext";
import { PlusIcon } from "../../components/icons/PlusIcon";
import { LogsIcon } from "../../components/icons/LogsIcon";
import { formatDistanceToNow } from "date-fns";

export function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const palette = useImessagePalette();
  const { animatedStyle } = useScreenEntrance();
  const { chats, createChat, setCurrentChat } = useChat();
  const { dnsServer } = useSettings();

  // Get recent chats (last 3)
  const recentChats = [...chats]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  // DNS status indicator
  const isDnsConnected = Boolean(dnsServer);
  const dnsStatusColor = isDnsConnected ? "#34C759" : palette.textTertiary;
  const dnsStatusText = isDnsConnected
    ? t("screen.home.dnsConnected", { defaultValue: "Connected" })
    : t("screen.home.dnsDisconnected", { defaultValue: "Not configured" });

  const handleNewChat = async () => {
    const newChat = await createChat();
    setCurrentChat(newChat);
    router.push({
      pathname: "/chat/[threadId]",
      params: { threadId: newChat.id },
    });
  };

  const handleOpenChat = (chat: typeof chats[0]) => {
    setCurrentChat(chat);
    router.push({
      pathname: "/chat/[threadId]",
      params: { threadId: chat.id },
    });
  };

  const handleOpenLogs = () => {
    router.push("/(tabs)/logs");
  };

  const handleOpenSettings = () => {
    router.push("/(modals)/settings");
  };

  return (
    <Form.List
      testID="home-screen"
      navigationTitle={t("screen.home.navigationTitle", { defaultValue: "Home" })}
      style={styles.container}
    >
      <Animated.View style={animatedStyle}>
        {/* DNS Status Card */}
        <Form.Section>
          <View
            style={[
              styles.statusCard,
              { backgroundColor: Platform.OS === "android" ? palette.solid : palette.surface },
            ]}
          >
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { color: palette.textSecondary }]}>
                  {t("screen.home.dnsStatus", { defaultValue: "DNS Status" })}
                </Text>
                <View style={styles.statusIndicator}>
                  <View
                    style={[styles.statusDot, { backgroundColor: dnsStatusColor }]}
                  />
                  <Text style={[styles.statusText, { color: palette.textPrimary }]}>
                    {dnsStatusText}
                  </Text>
                </View>
              </View>
              {!isDnsConnected && (
                <LiquidGlassWrapper
                  variant="interactive"
                  shape="capsule"
                  style={styles.configureButton}
                  onPress={handleOpenSettings}
                  accessibilityLabel={t("screen.home.configureButton", {
                    defaultValue: "Configure DNS",
                  })}
                  accessibilityRole="button"
                >
                  <Text style={[styles.configureButtonText, { color: palette.userBubble }]}>
                    {t("screen.home.configure", { defaultValue: "Configure" })}
                  </Text>
                </LiquidGlassWrapper>
              )}
            </View>
            {isDnsConnected && (
              <Text style={[styles.serverInfo, { color: palette.textTertiary }]}>
                {dnsServer}
              </Text>
            )}
          </View>
        </Form.Section>

        {/* Quick Actions Section */}
        <Form.Section
          title={t("screen.home.quickActions.title", { defaultValue: "Quick Actions" })}
        >
          <Form.Item
            title={t("screen.home.quickActions.newChat", { defaultValue: "New Conversation" })}
            subtitle={t("screen.home.quickActions.newChatDescription", {
              defaultValue: "Start a new DNS chat",
            })}
            rightContent={
              <LiquidGlassWrapper
                variant="interactive"
                shape="capsule"
                style={styles.actionIcon}
                accessibilityLabel={t("screen.home.quickActions.newChat", {
                  defaultValue: "New Conversation",
                })}
              >
                <PlusIcon size={20} />
              </LiquidGlassWrapper>
            }
            onPress={handleNewChat}
            showChevron
          />
          <Form.Item
            title={t("screen.home.quickActions.viewLogs", { defaultValue: "View Logs" })}
            subtitle={t("screen.home.quickActions.viewLogsDescription", {
              defaultValue: "See DNS query history",
            })}
            rightContent={
              <LiquidGlassWrapper
                variant="interactive"
                shape="capsule"
                style={styles.actionIcon}
                accessibilityLabel={t("screen.home.quickActions.viewLogs", {
                  defaultValue: "View Logs",
                })}
              >
                <LogsIcon size={20} color={palette.textSecondary} />
              </LiquidGlassWrapper>
            }
            onPress={handleOpenLogs}
            showChevron
          />
        </Form.Section>

        {/* Recent Chats Section */}
        {recentChats.length > 0 && (
          <Form.Section
            title={t("screen.home.recentChats.title", { defaultValue: "Recent Conversations" })}
            footer={t("screen.home.recentChats.footer", {
              defaultValue: "Tap to continue a conversation",
            })}
          >
            {recentChats.map((chat) => (
              <Form.Item
                key={chat.id}
                title={chat.title}
                subtitle={formatDistanceToNow(chat.createdAt, { addSuffix: true })}
                rightContent={
                  <View style={styles.chatBadge}>
                    <Text style={[styles.chatBadgeText, { color: palette.userBubble }]}>
                      {chat.messages.length}
                    </Text>
                  </View>
                }
                onPress={() => handleOpenChat(chat)}
                showChevron
              />
            ))}
          </Form.Section>
        )}

        {/* All Chats Link */}
        <Form.Section>
          <Form.Item
            title={t("screen.home.allChats", { defaultValue: "All Conversations" })}
            subtitle={t("screen.home.allChatsDescription", {
              defaultValue: "View all your chat history",
            })}
            onPress={() => router.push("/")}
            showChevron
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
  statusCard: {
    padding: LiquidGlassSpacing.md,
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
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 17,
    fontWeight: "600",
  },
  serverInfo: {
    fontSize: 13,
    marginTop: 8,
  },
  configureButton: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.xs,
  },
  configureButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionIcon: {
    padding: LiquidGlassSpacing.sm,
  },
  chatBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  chatBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default Home;
