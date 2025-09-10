import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { useTheme } from '../../src/theme/theme';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { colors, spacing, typography } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    // TODO: integrate auth service
    return new Promise((r) => setTimeout(r, 500));
  };

  return (
    <View style={{ padding: spacing[4], backgroundColor: colors.background, flex: 1 }}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: typography.h2, fontWeight: '700', color: colors.text }}
      >
        Entrar
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="email@exemplo.com"
            containerStyle={{ marginTop: spacing[3] }}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            label="Senha"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="********"
            containerStyle={{ marginTop: spacing[3] }}
            error={errors.password?.message}
          />
        )}
      />

      <Button
        label="Entrar"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={{ marginTop: spacing[4] }}
      />
    </View>
  );
}
