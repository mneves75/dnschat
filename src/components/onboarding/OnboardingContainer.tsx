import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { DNSMagicScreen } from './screens/DNSMagicScreen';
import { FirstChatScreen } from './screens/FirstChatScreen';
import { FeaturesScreen } from './screens/FeaturesScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function OnboardingContainer() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { currentStep, steps } = useOnboarding();

  const renderCurrentScreen = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return null;

    switch (currentStepData.component) {
      case 'WelcomeScreen':
        return <WelcomeScreen />;
      case 'DNSMagicScreen':
        return <DNSMagicScreen />;
      case 'FirstChatScreen':
        return <FirstChatScreen />;
      case 'FeaturesScreen':
        return <FeaturesScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <SafeAreaView style={[
      styles.container,
      isDark ? styles.darkContainer : styles.lightContainer
    ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000000' : '#FFFFFF'}
      />
      
      <OnboardingProgress />
      
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
});