import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { useTranslation } from '@/i18n';
import { usePreferencesActions } from '@/context/PreferencesProvider';

export default function OnboardingSummary() {
  const { t } = useTranslation();
  const { setOnboardingCompleted } = usePreferencesActions();
  const router = useRouter();

  const finish = useCallback(() => {
    setOnboardingCompleted(true);
    router.replace('/');
  }, [router, setOnboardingCompleted]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.step3.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.step3.caption')}</Text>
      <Pressable
        onPress={finish}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
      >
        <Text style={styles.primaryLabel}>{t('onboarding.finish')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(60,60,67,0.8)'
  },
  primaryButton: {
    borderRadius: 18,
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButtonPressed: {
    opacity: 0.9
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
