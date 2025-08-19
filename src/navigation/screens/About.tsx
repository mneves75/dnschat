import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Image,
  useColorScheme,
} from 'react-native';
import { 
  Form, 
  LiquidGlassWrapper,
} from '../../components/glass';

// Import package.json to get version
const packageJson = require('../../../package.json');

// Import app icon from assets (same pattern as newspaper.png)
const AppIcon = require('../../assets/dnschat_ios26.png');

const createStyles = (isDark: boolean) => StyleSheet.create({
  // Header Section
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    padding: 24,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF', // iOS system blue
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.15)', // iOS system blue background
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF', // iOS system blue
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  // Footer Section
  footerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '400',
  },
});

export function About() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [iconError, setIconError] = useState(false);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const styles = createStyles(isDark);

  const credits = [
    {
      name: '@arxiv_daily',
      description: 'Ch.at original concept and LLM over DNS service',
      url: 'https://x.com/Arxiv_Daily/status/1952452878716805172',
    },
    {
      name: '@levelsio (Pieter Levels)',
      description: 'Retweeted @arxiv_daily',
      url: 'https://x.com/levelsio',
    },
    {
      name: 'React Native Team',
      description: 'Cross-platform mobile framework',
      url: 'https://reactnative.dev',
    },
    {
      name: 'Expo Team',
      description: 'Development build and tooling platform',
      url: 'https://expo.dev',
    },
    {
      name: 'React Navigation',
      description: 'Navigation library for React Native',
      url: 'https://reactnavigation.org',
    },
    {
      name: 'AsyncStorage Community',
      description: 'Local storage solution',
      url: 'https://react-native-async-storage.github.io',
    },
    {
      name: 'Cloudflare',
      description: 'DNS-over-HTTPS infrastructure',
      url: 'https://cloudflare.com',
    },
  ];

  return (
    <Form.List>
      
      {/* App Information Header - Prominent display without duplicate rectangles */}
      <Form.Section>
        <LiquidGlassWrapper
          variant="prominent"
          shape="roundedRect"
          cornerRadius={16}
          style={styles.headerContainer}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {!iconError ? (
                <Image 
                  source={AppIcon}
                  style={styles.logoImage}
                  resizeMode="contain"
                  onLoad={() => console.log('✅ About icon loaded successfully')}
                  onError={(error) => {
                    console.log('🚨 About icon load error:', error.nativeEvent?.error || 'Unknown error');
                    console.log('🚨 AppIcon source:', AppIcon);
                    setIconError(true);
                  }}
                />
              ) : (
                <Text style={styles.logoText}>DNS</Text>
              )}
            </View>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              DNS Chat
            </Text>
            <LiquidGlassWrapper
              variant="interactive"
              shape="capsule"
              style={styles.versionBadge}
            >
              <Text style={styles.versionText}>v{packageJson.version}</Text>
            </LiquidGlassWrapper>
            <Text style={[styles.description, { color: isDark ? '#AEAEB2' : '#6D6D70' }]}>
              Chat with AI using DNS TXT queries - a unique approach to LLM communication.
            </Text>
          </View>
        </LiquidGlassWrapper>
      </Form.Section>

      {/* Inspiration Section */}
      <Form.Section 
        title="Inspiration"
        footer="This project was inspired by the incredible work of the open-source community"
      >
        <Form.Link
          title="@Arxiv_Daily Tweet"
          subtitle="Original LLM over DNS concept"
          onPress={() => openLink('https://x.com/Arxiv_Daily/status/1952452878716805172')}
        />
        <Form.Link
          title="Ch.at Project"
          subtitle="Universal Basic Intelligence via DNS"
          onPress={() => openLink('https://github.com/Deep-ai-inc/ch.at')}
        />
        <Form.Link
          title="@levelsio"
          subtitle="Shared the original concept"
          onPress={() => openLink('https://x.com/levelsio')}
        />
      </Form.Section>

      {/* Project Links */}
      <Form.Section title="Project">
        <Form.Link
          title="GitHub Repository"
          subtitle="View source code and contribute"
          onPress={() => openLink('https://github.com/mneves75/dnschat')}
        />
        <Form.Link
          title="Report an Issue"
          subtitle="Found a bug? Let us know"
          onPress={() => openLink('https://github.com/mneves75/dnschat/issues')}
        />
        <Form.Link
          title="@dnschat on X"
          subtitle="Follow for updates"
          onPress={() => openLink('https://x.com/dnschat')}
        />
      </Form.Section>

      {/* Developer */}
      <Form.Section title="Developer">
        <Form.Item
          title="Marcus Neves"
          subtitle="Created by @mneves75"
          onPress={() => openLink('https://x.com/mneves75')}
          showChevron
        />
      </Form.Section>

      {/* Special Thanks */}
      <Form.Section 
        title="Special Thanks"
        footer="This project wouldn't be possible without these amazing open-source projects and services"
      >
        {credits.map((credit, index) => (
          <Form.Link
            key={index}
            title={credit.name}
            subtitle={credit.description}
            onPress={() => openLink(credit.url)}
          />
        ))}
      </Form.Section>

      {/* Footer */}
      <Form.Section footer="© 2025 Marcus Neves • MIT Licensed" />
    </Form.List>
  );
}