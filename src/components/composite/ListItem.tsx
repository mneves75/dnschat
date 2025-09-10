import { memo } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/theme';

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

function ListItem({ title, subtitle, onPress, style, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const content = (
    <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{title}</Text>
      {!!subtitle && <Text style={{ color: colors.muted, marginTop: 2 }}>{subtitle}</Text>}
    </View>
  );
  if (!onPress) {
    return (
      <View style={[{ borderBottomWidth: 1, borderBottomColor: colors.border }, style]}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={({ pressed }) => [
        {
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: pressed ? colors.surface : 'transparent',
        },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

export default memo(ListItem);
