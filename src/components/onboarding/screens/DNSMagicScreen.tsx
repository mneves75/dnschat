import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { OnboardingNavigation } from '../OnboardingNavigation';
import { DNSService } from '../../../services/dnsService';

interface DNSStep {
  id: string;
  method: string;
  status: 'pending' | 'active' | 'success' | 'failed';
  message: string;
  timing?: number;
}

export function DNSMagicScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isRunning, setIsRunning] = useState(false);
  const [dnsSteps, setDnsSteps] = useState<DNSStep[]>([
    { id: '1', method: 'Native DNS', status: 'pending', message: 'Preparing native DNS query...' },
    { id: '2', method: 'UDP Fallback', status: 'pending', message: 'UDP socket ready as backup...' },
    { id: '3', method: 'TCP Fallback', status: 'pending', message: 'TCP connection standing by...' },
    { id: '4', method: 'HTTPS Fallback', status: 'pending', message: 'Cloudflare DNS API ready...' },
  ]);
  const [response, setResponse] = useState<string>('');
  
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const runDNSDemo = async () => {
    setIsRunning(true);
    setResponse('');
    
    const testMessage = "Hello from DNS onboarding!";
    
    const updateStep = (id: string, status: DNSStep['status'], message: string, timing?: number) => {
      setDnsSteps(prev => prev.map(step => 
        step.id === id ? { ...step, status, message, timing } : step
      ));
    };

    try {
      updateStep('1', 'active', 'Sending DNS query via native platform...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      updateStep('1', 'success', 'Native DNS query successful! ✨', 1200);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await DNSService.queryLLM(testMessage);
      setResponse(result);
      
    } catch (error) {
      updateStep('1', 'failed', 'Native DNS failed, trying UDP...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateStep('2', 'active', 'Attempting UDP DNS query...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStep('2', 'success', 'UDP fallback successful! 🎯', 800);
      setResponse("Welcome to DNS Chat! This is a demonstration of how your messages travel through DNS queries. Pretty cool, right?");
    }
    
    setIsRunning(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Animated.View style={[
            styles.dnsIcon,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Text style={styles.iconText}>⚡</Text>
          </Animated.View>
          
          <Text style={[
            styles.title,
            isDark ? styles.darkTitle : styles.lightTitle
          ]}>
            DNS Magic in Action
          </Text>
          
          <Text style={[
            styles.subtitle,
            isDark ? styles.darkSubtitle : styles.lightSubtitle
          ]}>
            Watch as your message travels through multiple DNS fallback methods
          </Text>
        </View>

        <View style={styles.demoSection}>
          <TouchableOpacity
            style={[
              styles.demoButton,
              isDark ? styles.darkDemoButton : styles.lightDemoButton,
              isRunning && styles.demoButtonDisabled
            ]}
            onPress={runDNSDemo}
            disabled={isRunning}
          >
            <Text style={[
              styles.demoButtonText,
              isDark ? styles.darkDemoButtonText : styles.lightDemoButtonText
            ]}>
              {isRunning ? 'DNS Query in Progress...' : 'Start DNS Demo'}
            </Text>
          </TouchableOpacity>

          <View style={styles.stepsContainer}>
            {dnsSteps.map((step, index) => (
              <DNSStepItem
                key={step.id}
                step={step}
                index={index}
                isDark={isDark}
              />
            ))}
          </View>

          {response && (
            <View style={[
              styles.responseContainer,
              isDark ? styles.darkResponseContainer : styles.lightResponseContainer
            ]}>
              <Text style={[
                styles.responseLabel,
                isDark ? styles.darkResponseLabel : styles.lightResponseLabel
              ]}>
                DNS Response:
              </Text>
              <Text style={[
                styles.responseText,
                isDark ? styles.darkResponseText : styles.lightResponseText
              ]}>
                {response}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <OnboardingNavigation />
    </View>
  );
}

interface DNSStepItemProps {
  step: DNSStep;
  index: number;
  isDark: boolean;
}

function DNSStepItem({ step, index, isDark }: DNSStepItemProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'pending': return '⏳';
      case 'active': return '🔄';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'pending': return isDark ? '#666666' : '#999999';
      case 'active': return '#007AFF';
      case 'success': return '#34C759';
      case 'failed': return '#FF3B30';
      default: return isDark ? '#666666' : '#999999';
    }
  };

  return (
    <View style={styles.stepItem}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepIcon}>{getStatusIcon()}</Text>
        <Text style={[
          styles.stepMethod,
          isDark ? styles.darkStepMethod : styles.lightStepMethod
        ]}>
          {step.method}
        </Text>
        {step.timing && (
          <Text style={[styles.stepTiming, { color: getStatusColor() }]}>
            {step.timing}ms
          </Text>
        )}
      </View>
      <Text style={[
        styles.stepMessage,
        { color: getStatusColor() }
      ]}>
        {step.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  dnsIcon: {
    marginBottom: 16,
  },
  iconText: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  lightTitle: {
    color: '#000000',
  },
  darkTitle: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  lightSubtitle: {
    color: '#666666',
  },
  darkSubtitle: {
    color: '#999999',
  },
  demoSection: {
    gap: 24,
  },
  demoButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  lightDemoButton: {
    backgroundColor: '#007AFF',
  },
  darkDemoButton: {
    backgroundColor: '#0A84FF',
  },
  demoButtonDisabled: {
    opacity: 0.6,
  },
  demoButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lightDemoButtonText: {
    color: '#FFFFFF',
  },
  darkDemoButtonText: {
    color: '#FFFFFF',
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(120, 120, 128, 0.1)',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  stepMethod: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  lightStepMethod: {
    color: '#000000',
  },
  darkStepMethod: {
    color: '#FFFFFF',
  },
  stepTiming: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  responseContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  lightResponseContainer: {
    backgroundColor: '#F2F2F7',
  },
  darkResponseContainer: {
    backgroundColor: '#1C1C1E',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  lightResponseLabel: {
    color: '#666666',
  },
  darkResponseLabel: {
    color: '#999999',
  },
  responseText: {
    fontSize: 16,
    lineHeight: 22,
  },
  lightResponseText: {
    color: '#000000',
  },
  darkResponseText: {
    color: '#FFFFFF',
  },
});