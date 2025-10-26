import { Text, Button } from "@react-navigation/elements";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "../../i18n";
import { useNavigation } from "@react-navigation/native";
import React from "react";

export function NotFound() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: t("screen.notFound.title") });
  }, [navigation, t]);
  return (
    <View style={styles.container}>
      <Text>{t("screen.notFound.title")}</Text>
      <Button screen="HomeTabs">{t("screen.notFound.goHome")}</Button>
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
