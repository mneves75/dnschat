import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import {
  LiquidGlassCard,
  LiquidGlassView,
  type LiquidGlassProps,
  useAdaptiveGlassIntensity,
} from "./LiquidGlassFallback";

export interface LiquidGlassButtonProps {
  title: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface LiquidGlassChatBubbleProps {
  role: "user" | "assistant" | "system";
  message: string;
  timestamp?: string;
  highlight?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface LiquidGlassInputProps extends TextInputProps {
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export interface LiquidGlassCardProps extends LiquidGlassProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface LiquidGlassContainerProps extends LiquidGlassProps {
  spacing?: number;
  direction?: "horizontal" | "vertical";
  children?: React.ReactNode;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  title,
  icon,
  onPress,
  disabled = false,
  style,
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      disabled && styles.buttonDisabled,
      pressed && !disabled ? styles.buttonPressed : null,
      style,
    ]}
  >
    {icon && <View style={styles.buttonIcon}>{icon}</View>}
    <Text style={styles.buttonLabel}>{title}</Text>
  </Pressable>
);

export const LiquidGlassChatBubble: React.FC<LiquidGlassChatBubbleProps> = ({
  role,
  message,
  timestamp,
  highlight = false,
  style,
}) => (
  <View
    accessibilityRole="text"
    style={[styles.chatBubble, highlight && styles.chatBubbleHighlight, style]}
  >
    <Text style={styles.chatBubbleLabel}>{role.toUpperCase()}</Text>
    <Text style={styles.chatBubbleMessage}>{message}</Text>
    {timestamp ? (
      <Text style={styles.chatBubbleTimestamp}>{timestamp}</Text>
    ) : null}
  </View>
);

export const LiquidGlassInput = React.forwardRef<TextInput, LiquidGlassInputProps>(
  ({ label, style, ...props }, ref) => (
    <View style={[styles.inputContainer, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput ref={ref} style={styles.inputField} {...props} />
    </View>
  ),
);

LiquidGlassInput.displayName = "LiquidGlassInput";

export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  spacing = 12,
  direction = "vertical",
  intensity = "regular",
  children,
  containerStyle,
  ...rest
}) => {
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);

  return (
    <LiquidGlassView
      {...rest}
      intensity={adaptiveIntensity}
      containerStyle={[
        direction === "horizontal" ? styles.rowContainer : styles.columnContainer,
        { gap: spacing },
        containerStyle,
      ]}
    >
      {children}
    </LiquidGlassView>
  );
};

export const LiquidGlassCardComponent: React.FC<LiquidGlassCardProps> = ({
  header,
  footer,
  children,
  containerStyle,
  ...rest
}) => (
  <LiquidGlassCard {...rest} containerStyle={[styles.card, containerStyle]}>
    {header ? <View style={styles.cardSection}>{header}</View> : null}
    <View style={styles.cardBody}>{children}</View>
    {footer ? <View style={styles.cardSection}>{footer}</View> : null}
  </LiquidGlassCard>
);

export const LiquidGlassContainerPlaceholder = LiquidGlassContainer;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonLabel: {
    fontWeight: "600",
    color: "#ffffff",
  },
  chatBubble: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  chatBubbleHighlight: {
    borderColor: "rgba(0,122,255,0.4)",
    borderWidth: 1,
  },
  chatBubbleLabel: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.7,
  },
  chatBubbleMessage: {
    marginTop: 4,
    fontSize: 15,
  },
  chatBubbleTimestamp: {
    marginTop: 6,
    fontSize: 10,
    opacity: 0.5,
  },
  inputContainer: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.7,
  },
  inputField: {
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  columnContainer: {
    flexDirection: "column",
  },
  card: {
    padding: 16,
  },
  cardSection: {
    marginBottom: 12,
  },
  cardBody: {
    gap: 8,
  },
});

export {
  LiquidGlassCardComponent as LiquidGlassCard,
};
