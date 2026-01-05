import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "../../i18n";

interface ProfileProps {
  user: string;
}

export function Profile({ user }: ProfileProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text>
        {t("screen.profile.title", { user })}
      </Text>
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
