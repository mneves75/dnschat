import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { useTranslation } from '@/i18n';
import { usePreferencesActions } from '@/context/PreferencesProvider';

export default function OnboardingWelcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setOnboardingCompleted } = usePreferencesActions();

  const handleSkip = useCallback(() => {
    setOnboardingCompleted(true);
    router.replace('/');
  }, [router, setOnboardingCompleted]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.step1.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.step1.subtitle')}</Text>
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push('/onboarding/demo')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        >
          <Text style={styles.primaryLabel}>{t('onboarding.next')}</Text>
        </Pressable>
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
        >
          <Text style={styles.secondaryLabel}>{t('onboarding.skip')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 24
  },
  title: {
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(60,60,67,0.8)'
  },
  actions: {
    flexDirection: 'row',
    gap: 12
  },
  primaryButton: {
    flex: 1,
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
  },
  secondaryButton: {
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(142,142,147,0.3)',
    justifyContent: 'center'
  },
  secondaryButtonPressed: {
    opacity: 0.7
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: '600'
  }
});
