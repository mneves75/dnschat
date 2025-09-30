import { StyleSheet, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export function Profile() {
  const params = useLocalSearchParams<{ user?: string }>();
  const username = params.user ?? "User";
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading} accessibilityRole="header">
          {username}'s Profile
        </Text>
        <Text style={styles.subtitle}>
          Coming soon: personalized settings and DNS stats.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Go back to the previous screen"
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0A0A0A10",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 16,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6D6D70",
  },
  backButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#007AFF",
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
