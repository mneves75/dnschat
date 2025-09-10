import { Pressable, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { memo } from 'react';
import { useTheme } from '../../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
};

function Button({ label, onPress, disabled, loading, style, accessibilityLabel, testID }: Props) {
  const { colors, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      testID={testID}
      style={({ pressed }) => [
        {
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          alignItems: 'center',
          minHeight: 44,
          backgroundColor: colors.primary,
          opacity: disabled || loading ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          marginVertical: spacing[2],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryContrast} />
      ) : (
        <Text style={{ fontWeight: '700', color: colors.primaryContrast }}>{label}</Text>
      )}
    </Pressable>
  );
}
export default memo(Button);
