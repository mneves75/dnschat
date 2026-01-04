import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { format, isToday, isYesterday } from "date-fns";
import type { Chat } from "../types/chat";
import { TrashIcon } from "./icons/TrashIcon";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { useI18n } from "../i18n";

interface ChatListItemProps {
  chat: Chat;
  onPress: (chat: Chat) => void;
  onDelete: (chatId: string) => void;
}

export function ChatListItem({ chat, onPress, onDelete }: ChatListItemProps) {
  const palette = useImessagePalette();
  const { t } = useI18n();

  // Memoize dynamic styles based on palette
  const dynamicStyles = useMemo(
    () => ({
      container: {
        backgroundColor: palette.background,
        borderBottomColor: palette.separator,
      },
      title: { color: palette.textPrimary },
      date: { color: palette.textSecondary },
      lastMessage: { color: palette.textSecondary },
    }),
    [palette]
  );

  const getLastMessage = () => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage) return "No messages yet";

    return lastMessage.role === "user"
      ? `You: ${lastMessage.content}`
      : lastMessage.content;
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${chat.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(chat.id),
        },
      ],
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => onPress(chat)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("screen.chatList.accessibility.chatItem", {
          title: chat.title,
        })}
        accessibilityHint={t("screen.chatList.accessibility.chatItemHint")}
      >
        <View style={styles.header}>
          <Text
            style={[styles.title, dynamicStyles.title]}
            numberOfLines={1}
          >
            {chat.title}
          </Text>
          <Text style={[styles.date, dynamicStyles.date]}>
            {formatDate(chat.updatedAt)}
          </Text>
        </View>

        <Text
          style={[styles.lastMessage, dynamicStyles.lastMessage]}
          numberOfLines={2}
        >
          {getLastMessage()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeletePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("screen.chatList.accessibility.deleteButton")}
        accessibilityHint={t("screen.chatList.accessibility.deleteButtonHint")}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <TrashIcon size={18} color={palette.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // backgroundColor and borderBottomColor from dynamicStyles
  },
  content: {
    flex: 1,
  },
  deleteButton: {
    // iOS HIG requires 44pt minimum touch target
    // 18px icon + 13px padding * 2 = 44px
    padding: 13,
    marginLeft: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
    // color from dynamicStyles
  },
  date: {
    fontSize: 15,
    // color from dynamicStyles
  },
  lastMessage: {
    fontSize: 15,
    lineHeight: 20,
    // color from dynamicStyles
  },
});
