import { StyleSheet, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LiquidGlassWrapper } from "../components/LiquidGlassWrapper";
import { useAppTheme } from "../theme";

export function NotFound() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LiquidGlassWrapper
        variant="regular"
        shape="roundedRect"
        cornerRadius={16}
        enableContainer={true}
        style={styles.errorCard}
      >
        <Text style={[styles.title, { color: colors.text }]}>404</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Page Not Found
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Return to the home screen"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => router.replace('/')}
        >
          <Text style={[styles.buttonText, { color: colors.surface }]}>Go to Home</Text>
        </Pressable>
      </LiquidGlassWrapper>
    </SafeAreaView>
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
