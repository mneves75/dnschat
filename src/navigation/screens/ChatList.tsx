import React, { useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Text,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ListRenderItemInfo,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ChatListItem } from "../../components/ChatListItem";
import { useChat } from "../../context/ChatContext";
import { Chat } from "../../types/chat";

export function ChatList() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();
  const {
    chats,
    isLoading,
    loadChats,
    createChat,
    deleteChat,
    setCurrentChat,
  } = useChat();

  useFocusEffect(
    React.useCallback(() => {
      loadChats();
    }, [loadChats]),
  );

  const handleChatPress = (chat: Chat) => {
    setCurrentChat(chat);
    // Navigate to chat screen - we'll implement this in navigation setup
    navigation.navigate("Chat" as never);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleNewChat = async () => {
    try {
      await createChat();
      navigation.navigate("Chat" as never);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const renderChatItem = ({ item }: ListRenderItemInfo<Chat>) => (
    <ChatListItem
      chat={item}
      onPress={handleChatPress}
      onDelete={handleDeleteChat}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          isDark ? styles.darkEmptyText : styles.lightEmptyText,
        ]}
      >
        No chats yet
      </Text>
      <Text
        style={[
          styles.emptySubtext,
          isDark ? styles.darkEmptySubtext : styles.lightEmptySubtext,
        ]}
      >
        Start a new conversation to begin chatting with the AI assistant.
      </Text>
      <TouchableOpacity
        style={[
          styles.newChatButton,
          isDark ? styles.darkNewChatButton : styles.lightNewChatButton,
        ]}
        onPress={handleNewChat}
      >
        <Text
          style={[
            styles.newChatButtonText,
            isDark
              ? styles.darkNewChatButtonText
              : styles.lightNewChatButtonText,
          ]}
        >
          Start New Chat
        </Text>
      </TouchableOpacity>
    </View>
  );

  const keyExtractor = (item: Chat) => item.id;

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#FFFFFF"}
      />

      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.darkHeaderTitle : styles.lightHeaderTitle,
          ]}
        >
          Chats
        </Text>
        <TouchableOpacity
          style={[
            styles.newChatIcon,
            isDark ? styles.darkNewChatIcon : styles.lightNewChatIcon,
          ]}
          onPress={handleNewChat}
        >
          <Text
            style={[
              styles.newChatIconText,
              isDark ? styles.darkNewChatIconText : styles.lightNewChatIconText,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={
          chats.length === 0 ? styles.emptyListContainer : undefined
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadChats}
            tintColor={isDark ? "#FFFFFF" : "#000000"}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={100}
        initialNumToRender={20}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate item height
          offset: 80 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  lightHeaderTitle: {
    color: "#000000",
  },
  darkHeaderTitle: {
    color: "#FFFFFF",
  },
  newChatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
  },
  lightNewChatIcon: {
    backgroundColor: "#007AFF",
  },
  darkNewChatIcon: {
    backgroundColor: "#007AFF",
  },
  newChatIconText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  lightNewChatIconText: {
    color: "#FFFFFF",
  },
  darkNewChatIconText: {
    color: "#FFFFFF",
  },
  list: {
    flex: 1,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  lightEmptyText: {
    color: "#000000",
  },
  darkEmptyText: {
    color: "#FFFFFF",
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  lightEmptySubtext: {
    color: "#8E8E93",
  },
  darkEmptySubtext: {
    color: "#8E8E93",
  },
  newChatButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#007AFF",
  },
  lightNewChatButton: {
    backgroundColor: "#007AFF",
  },
  darkNewChatButton: {
    backgroundColor: "#007AFF",
  },
  newChatButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  lightNewChatButtonText: {
    color: "#FFFFFF",
  },
  darkNewChatButtonText: {
    color: "#FFFFFF",
  },
});
