import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { useTranslation } from '@/i18n';
import { useTransport } from '@/context/TransportProvider';

export default function OnboardingDemo() {
  const { t } = useTranslation();
  const router = useRouter();
  const { executeQuery } = useTransport();
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const runDemo = useCallback(async () => {
    setState('loading');
    setMessage('');
    try {
      const result = await executeQuery({
        conversationId: 'onboarding-demo',
        message: 'hello-from-onboarding'
      });
      setState('success');
      setMessage(t('onboarding.step2.success', { ms: result.durationMs.toFixed(0) }));
    } catch (error) {
      setState('error');
      setMessage(t('onboarding.step2.error', { error: (error as Error).message }));
    }
  }, [executeQuery, t]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.step2.title')}</Text>
      <Text style={styles.subtitle}>dns://hello-from-onboarding</Text>
      <Pressable
        onPress={runDemo}
        disabled={state === 'loading'}
        style={({ pressed }) => [
          styles.primaryButton,
          (state === 'loading' || pressed) && styles.primaryButtonPressed
        ]}
      >
        {state === 'loading' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryLabel}>{t('onboarding.step2.button')}</Text>
        )}
      </Pressable>
      {message ? (
        <Text style={[styles.result, state === 'error' && styles.resultError]}>{message}</Text>
      ) : null}
      <Pressable
        onPress={() => router.push('/onboarding/summary')}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
      >
        <Text style={styles.secondaryLabel}>{t('onboarding.next')}</Text>
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
    opacity: 0.85
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  result: {
    fontSize: 15,
    color: 'rgba(60,60,67,0.85)'
  },
  resultError: {
    color: '#FF453A'
  },
  secondaryButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(142,142,147,0.3)'
  },
  secondaryButtonPressed: {
    opacity: 0.7
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '600'
  }
});
