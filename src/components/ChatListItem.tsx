import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { format, isToday, isYesterday } from "date-fns";
import { Chat } from "../types/chat";
import { TrashIcon } from "./icons/TrashIcon";

interface ChatListItemProps {
  chat: Chat;
  onPress: (chat: Chat) => void;
  onDelete: (chatId: string) => void;
}

export function ChatListItem({ chat, onPress, onDelete }: ChatListItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
    <View
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => onPress(chat)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              isDark ? styles.darkTitle : styles.lightTitle,
            ]}
            numberOfLines={1}
          >
            {chat.title}
          </Text>
          <Text
            style={[styles.date, isDark ? styles.darkDate : styles.lightDate]}
          >
            {formatDate(chat.updatedAt)}
          </Text>
        </View>

        <Text
          style={[
            styles.lastMessage,
            isDark ? styles.darkLastMessage : styles.lightLastMessage,
          ]}
          numberOfLines={2}
        >
          {getLastMessage()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeletePress}
        activeOpacity={0.7}
      >
        <TrashIcon size={18} color={isDark ? "#8E8E93" : "#8E8E93"} />
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
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E5EA",
  },
  darkContainer: {
    backgroundColor: "#000000",
    borderBottomColor: "#38383A",
  },
  content: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
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
  },
  lightTitle: {
    color: "#000000",
  },
  darkTitle: {
    color: "#FFFFFF",
  },
  date: {
    fontSize: 15,
    opacity: 0.6,
  },
  lightDate: {
    color: "#8E8E93",
  },
  darkDate: {
    color: "#8E8E93",
  },
  lastMessage: {
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 20,
  },
  lightLastMessage: {
    color: "#8E8E93",
  },
  darkLastMessage: {
    color: "#8E8E93",
  },
});
