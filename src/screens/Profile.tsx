import { StyleSheet, View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export function Profile() {
  const params = useLocalSearchParams<{ user?: string }>();
  const username = params.user ?? "User";

  return (
    <View style={styles.container}>
      <Text>{username}'s Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
