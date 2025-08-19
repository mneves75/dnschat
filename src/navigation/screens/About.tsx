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

// Import app icon (same as used in onboarding)
const AppIcon = require('../../../icons/dnschat_ios26.png');

export function About() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [iconError, setIconError] = useState(false);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

const styles = StyleSheet.create({
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
    color: '#FFC107', // Notion yellow
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
    backgroundColor: 'rgba(255, 193, 7, 0.15)', // Notion yellow
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC107', // Notion yellow
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
    <Form.List navigationTitle="About DNS Chat">
      
      {/* App Information Header */}
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
                  onError={(error) => {
                    console.log('🚨 About icon load error:', error.nativeEvent.error);
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
        <Form.Link
          title="@mneves75"
          subtitle="Created by Marcus Neves"
          onPress={() => openLink('https://x.com/mneves75')}
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
      <Form.Section>
        <LiquidGlassWrapper
          variant="regular"
          shape="roundedRect"
          cornerRadius={12}
          style={styles.footerContainer}
        >
          <Text style={[styles.footerText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
            © 2025 Marcus Neves • MIT Licensed
          </Text>
        </LiquidGlassWrapper>
      </Form.Section>
    </Form.List>
  );
}