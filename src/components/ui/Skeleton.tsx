import { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useTheme } from '../../theme/theme';

type Props = { width?: number | string; height?: number; style?: ViewStyle };

function Skeleton({ width = '100%', height = 16, style }: Props) {
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={LinearTransition}
      accessibilityLabel="loading placeholder"
      style={[{ width, height, backgroundColor: colors.surface, borderRadius: 8 }, style]}
    />
  );
}

export default memo(Skeleton);
