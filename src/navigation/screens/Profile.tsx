import { Text } from "@react-navigation/elements";
import type { StaticScreenProps } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "../../i18n";

type Props = StaticScreenProps<{
  user: string;
}>;

export function Profile({ route }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text>
        {t("screen.profile.title", { user: route.params.user })}
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
