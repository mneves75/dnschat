import { StyleSheet, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { UniversalGlassView } from "../components/glass/UniversalGlassView";
import { useAppTheme } from "../theme";

export function NotFound() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UniversalGlassView
        variant="regular"
        shape="roundedRect"
        cornerRadius={16}
        style={styles.errorCard}
      >
        <Text style={[styles.title, { color: colors.text }]}>404</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Page Not Found
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => router.replace('/')}
        >
          <Text style={[styles.buttonText, { color: colors.surface }]}>Go to Home</Text>
        </Pressable>
      </UniversalGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorCard: {
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
  },
  title: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
