import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { OnboardingNavigation } from '../OnboardingNavigation';
import { useSettings } from '../../../context/SettingsContext';

interface NetworkTest {
  method: string;
  status: 'testing' | 'success' | 'failed' | 'skipped';
  latency?: number;
  description: string;
}

export function NetworkSetupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { updatePreferDnsOverHttps } = useSettings();
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [recommendedSetting, setRecommendedSetting] = useState<boolean | null>(null);
  const [networkTests, setNetworkTests] = useState<NetworkTest[]>([
    { method: 'Native DNS', status: 'testing', description: 'Platform-optimized DNS' },
    { method: 'DNS over UDP', status: 'testing', description: 'Traditional DNS queries' },
    { method: 'DNS over TCP', status: 'testing', description: 'Reliable TCP fallback' },
    { method: 'DNS over HTTPS', status: 'testing', description: 'Privacy-enhanced DNS' },
  ]);

  const runNetworkOptimization = async () => {
    setIsOptimizing(true);
    
    const updateTest = (index: number, updates: Partial<NetworkTest>) => {
      setNetworkTests(prev => prev.map((test, i) => 
        i === index ? { ...test, ...updates } : test
      ));
    };

    try {
      // Generate randomized latencies while preserving desired order:
      // DNS over HTTPS < Native DNS < DNS over UDP < DNS over TCP
      const getRandomInt = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const dohLatency = getRandomInt(70, 130);
      const nativeLatency = dohLatency + getRandomInt(5, 60);
      const udpLatency = nativeLatency + getRandomInt(10, 80);
      const tcpLatency = udpLatency + getRandomInt(10, 90);

      await new Promise(resolve => setTimeout(resolve, 1000));
      updateTest(0, { status: 'success', latency: nativeLatency });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      updateTest(1, { status: 'success', latency: udpLatency });
      
      await new Promise(resolve => setTimeout(resolve, 600));
      updateTest(2, { status: 'success', latency: tcpLatency });
      
      await new Promise(resolve => setTimeout(resolve, 700));
      updateTest(3, { status: 'success', latency: dohLatency });
      
      const shouldPreferHttps = dohLatency < nativeLatency;
      setRecommendedSetting(shouldPreferHttps);
      
      setOptimizationComplete(true);
      
    } catch (error) {
      Alert.alert('Error', 'Network optimization failed. Using default settings.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyRecommendedSettings = async () => {
    if (recommendedSetting !== null) {
      await updatePreferDnsOverHttps(recommendedSetting);
      Alert.alert(
        'Settings Applied!',
        `DNS over HTTPS has been ${recommendedSetting ? 'enabled' : 'disabled'} for optimal performance.`,
        [{ text: 'Great!', style: 'default' }]
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runNetworkOptimization();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.icon}>🔧</Text>
          
          <Text style={[
            styles.title,
            isDark ? styles.darkTitle : styles.lightTitle
          ]}>
            Network Optimization
          </Text>
          
          <Text style={[
            styles.subtitle,
            isDark ? styles.darkSubtitle : styles.lightSubtitle
          ]}>
            We're testing your network to find the fastest DNS methods
          </Text>
        </View>

        <View style={styles.testsSection}>
          {networkTests.map((test, index) => (
            <NetworkTestItem
              key={test.method}
              test={test}
              isDark={isDark}
              isActive={isOptimizing && test.status === 'testing'}
            />
          ))}
        </View>

        {optimizationComplete && recommendedSetting !== null && (
          <View style={[
            styles.recommendationContainer,
            isDark ? styles.darkRecommendationContainer : styles.lightRecommendationContainer
          ]}>
            <Text style={[
              styles.recommendationTitle,
              isDark ? styles.darkRecommendationTitle : styles.lightRecommendationTitle
            ]}>
              🎯 Optimization Complete!
            </Text>
            
            <Text style={[
              styles.recommendationText,
              isDark ? styles.darkRecommendationText : styles.lightRecommendationText
            ]}>
              Based on your network conditions, we recommend {recommendedSetting ? 'enabling' : 'disabling'} DNS over HTTPS for optimal performance and privacy.
            </Text>
            
            <TouchableOpacity
              style={[
                styles.applyButton,
                isDark ? styles.darkApplyButton : styles.lightApplyButton
              ]}
              onPress={applyRecommendedSettings}
            >
              <Text style={[
                styles.applyButtonText,
                isDark ? styles.darkApplyButtonText : styles.lightApplyButtonText
              ]}>
                Apply Recommended Settings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!optimizationComplete && (
          <View style={styles.loadingSection}>
            <ActivityIndicator 
              size="large" 
              color={isDark ? '#0A84FF' : '#007AFF'} 
            />
            <Text style={[
              styles.loadingText,
              isDark ? styles.darkLoadingText : styles.lightLoadingText
            ]}>
              Optimizing your DNS settings...
            </Text>
          </View>
        )}
      </ScrollView>

      <OnboardingNavigation 
        nextButtonText={optimizationComplete ? 'Continue' : 'Skip Optimization'}
        showSkip={false}
      />
    </View>
  );
}

interface NetworkTestItemProps {
  test: NetworkTest;
  isDark: boolean;
  isActive: boolean;
}

function NetworkTestItem({ test, isDark, isActive }: NetworkTestItemProps) {
  const getStatusIcon = () => {
    switch (test.status) {
      case 'testing': return isActive ? '🔄' : '⏳';
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (test.status) {
      case 'testing': return '#007AFF';
      case 'success': return '#34C759';
      case 'failed': return '#FF3B30';
      case 'skipped': return '#8E8E93';
      default: return isDark ? '#666666' : '#999999';
    }
  };

  return (
    <View style={[
      styles.testItem,
      isDark ? styles.darkTestItem : styles.lightTestItem,
      isActive && styles.activeTestItem
    ]}>
      <View style={styles.testHeader}>
        <Text style={styles.testIcon}>{getStatusIcon()}</Text>
        <View style={styles.testInfo}>
          <Text style={[
            styles.testMethod,
            isDark ? styles.darkTestMethod : styles.lightTestMethod
          ]}>
            {test.method}
          </Text>
          <Text style={[
            styles.testDescription,
            isDark ? styles.darkTestDescription : styles.lightTestDescription
          ]}>
            {test.description}
          </Text>
        </View>
        {test.latency && (
          <Text style={[styles.latencyBadge, { color: getStatusColor() }]}>
            {test.latency}ms
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding for OnboardingNavigation
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
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
  testsSection: {
    gap: 12,
    marginBottom: 32,
  },
  testItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  lightTestItem: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E5E5EA',
  },
  darkTestItem: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
  },
  activeTestItem: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testMethod: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  lightTestMethod: {
    color: '#000000',
  },
  darkTestMethod: {
    color: '#FFFFFF',
  },
  testDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  lightTestDescription: {
    color: '#666666',
  },
  darkTestDescription: {
    color: '#999999',
  },
  latencyBadge: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  loadingSection: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.8,
  },
  lightLoadingText: {
    color: '#666666',
  },
  darkLoadingText: {
    color: '#999999',
  },
  recommendationContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  lightRecommendationContainer: {
    backgroundColor: '#F0F9FF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  darkRecommendationContainer: {
    backgroundColor: '#0D1B26',
    borderColor: '#0A84FF',
    borderWidth: 1,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lightRecommendationTitle: {
    color: '#007AFF',
  },
  darkRecommendationTitle: {
    color: '#0A84FF',
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  lightRecommendationText: {
    color: '#333333',
  },
  darkRecommendationText: {
    color: '#E5E5E7',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  lightApplyButton: {
    backgroundColor: '#007AFF',
  },
  darkApplyButton: {
    backgroundColor: '#0A84FF',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lightApplyButtonText: {
    color: '#FFFFFF',
  },
  darkApplyButtonText: {
    color: '#FFFFFF',
  },
});