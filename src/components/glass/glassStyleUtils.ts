import { StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

const SHADOW_KEYS = new Set([
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  "elevation",
]);

const BORDER_KEYS = new Set([
  "borderWidth",
  "borderColor",
  "borderStyle",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderStartWidth",
  "borderEndWidth",
  "borderStartColor",
  "borderEndColor",
]);

const BORDER_RADIUS_KEYS = new Set([
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderTopStartRadius",
  "borderTopEndRadius",
  "borderBottomStartRadius",
  "borderBottomEndRadius",
]);

const CONTAINER_ONLY_KEYS = new Set([
  "alignSelf",
  "margin",
  "marginBottom",
  "marginEnd",
  "marginHorizontal",
  "marginLeft",
  "marginRight",
  "marginStart",
  "marginTop",
  "marginVertical",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
  "transform",
]);

const MIRROR_KEYS = new Set([
  "flex",
  "flexBasis",
  "flexGrow",
  "flexShrink",
  "height",
  "maxHeight",
  "maxWidth",
  "minHeight",
  "minWidth",
  "width",
]);

type SplitStyles = {
  containerStyle: ViewStyle;
  glassStyle: ViewStyle;
};

export const splitGlassStyles = (
  style?: StyleProp<ViewStyle>,
): SplitStyles => {
  const flattened = StyleSheet.flatten(style) ?? {};
  const containerStyle: Record<string, ViewStyle[keyof ViewStyle]> = {};
  const glassStyle: Record<string, ViewStyle[keyof ViewStyle]> = {};

  for (const [rawKey, value] of Object.entries(flattened)) {
    if (value == null) continue;
    const key = rawKey as keyof ViewStyle;

    if (BORDER_RADIUS_KEYS.has(rawKey)) {
      containerStyle[rawKey] = value as ViewStyle[keyof ViewStyle];
      glassStyle[rawKey] = value as ViewStyle[keyof ViewStyle];
      continue;
    }

    if (SHADOW_KEYS.has(rawKey) || BORDER_KEYS.has(rawKey)) {
      containerStyle[rawKey] = value as ViewStyle[keyof ViewStyle];
      continue;
    }

    if (CONTAINER_ONLY_KEYS.has(rawKey)) {
      containerStyle[rawKey] = value as ViewStyle[keyof ViewStyle];
      continue;
    }

    if (MIRROR_KEYS.has(rawKey)) {
      containerStyle[rawKey] = value as ViewStyle[keyof ViewStyle];
      glassStyle[rawKey] = value as ViewStyle[keyof ViewStyle];
      continue;
    }

    glassStyle[rawKey] = value as ViewStyle[keyof ViewStyle];
  }

  return {
    containerStyle: containerStyle as ViewStyle,
    glassStyle: glassStyle as ViewStyle,
  };
};
