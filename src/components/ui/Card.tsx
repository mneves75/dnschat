import { memo, PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/theme';

type Props = PropsWithChildren<{ style?: ViewStyle }>;

function Card({ style, children }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default memo(Card);
