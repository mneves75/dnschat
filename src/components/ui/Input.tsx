import { forwardRef, memo } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/theme';

type Props = TextInputProps & {
  label?: string;
  containerStyle?: ViewStyle;
  error?: string;
};

const Input = forwardRef<TextInput, Props>(
  ({ label, containerStyle, error, style, ...rest }, ref) => {
    const { colors, spacing, typography } = useTheme();
    return (
      <View style={[{ width: '100%' }, containerStyle]}>
        {label ? (
          <Text
            accessibilityRole="text"
            style={{ color: colors.text, fontSize: typography.body, marginBottom: spacing[1] }}
          >
            {label}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          style={[
            {
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              borderRadius: 12,
              padding: 12,
              minHeight: 44,
              color: colors.text,
              backgroundColor: colors.card,
            },
            style,
          ]}
          {...rest}
        />
        {!!error && (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: colors.danger, marginTop: spacing[1] }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

export default memo(Input);
