/**
 * About Screen - Tab (Expo Router)
 *
 * Displays app information, version, credits, and links.
 * Adapted from src/navigation/screens/About.tsx for Expo Router.
 *
 * CRITICAL: Default export required for Expo Router file-based routing.
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Image,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Form } from '../../src/components/glass';
import { GlassCard, GlassScreen } from '../../src/design-system/glass';
import { useGlassBudget } from '../../src/hooks/useGlassBudget';
import { useTranslation } from '../../src/i18n';

// Import package.json to get version
const packageJson = require('../../package.json');

// Import app icon
const AppIcon = require('../../src/assets/dnschat_ios26.png');

/**
 * About Screen Component
 *
 * Uses expo-glass-effect via GlassCard component for iOS 26+ liquid glass.
 * Includes locale-aware text via useTranslation hook.
 */
export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [iconError, setIconError] = useState(false);

  // CRITICAL: Get translations
  const { t } = useTranslation();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  useGlassBudget('about', { maxElements: 5 });

  const styles = createStyles(isDark);

  const communityLinks = [
    {
      title: '@Arxiv_Daily Tweet',
      subtitle: 'Original LLM over DNS concept',
      url: 'https://x.com/Arxiv_Daily/status/1952452878716805172',
    },
    {
      title: 'Ch.at Project',
      subtitle: 'Universal Basic Intelligence via DNS',
      url: 'https://github.com/Deep-ai-inc/ch.at',
    },
    {
      title: '@levelsio',
      subtitle: 'Shared the original concept',
      url: 'https://x.com/levelsio',
    },
    {
      title: 'GitHub Repository',
      subtitle: 'View source code and contribute',
      url: 'https://github.com/mneves75/dnschat',
    },
    {
      title: 'Report an Issue',
      subtitle: 'Found a bug? Let us know',
      url: 'https://github.com/mneves75/dnschat/issues',
    },
    {
      title: '@dnschat on X',
      subtitle: 'Follow for updates',
      url: 'https://x.com/dnschat',
    },
  ];

  const specialThanks = [
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
      name: 'Expo Router',
      description: 'File-based navigation for React Native',
      url: 'https://docs.expo.dev/router/introduction/',
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
    <GlassScreen register={false} style={styles.screen}>
      <Form.List style={styles.list}>
        <View style={styles.headerSection}>
          <GlassCard
            variant="prominent"
            register={false}
            style={styles.headerContainer}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                {!iconError ? (
                  <Image
                    source={AppIcon}
                    style={styles.logoImage}
                    resizeMode="contain"
                    onError={() => setIconError(true)}
                  />
                ) : (
                  <Text style={styles.logoText}>DNS</Text>
                )}
              </View>
              <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>DNS Chat</Text>
              <GlassCard
                register={false}
                variant="interactive"
                style={styles.versionBadge}
              >
                <Text style={styles.versionText}>
                  {t('about.version')} {packageJson.version}
                </Text>
              </GlassCard>
              <Text
                style={[
                  styles.description,
                  { color: isDark ? '#AEAEB2' : '#6D6D70' },
                ]}
              >
                {t('about.description')}
              </Text>
            </View>
          </GlassCard>
        </View>

        <Form.Section title="Quick Actions" register={false}>
          <Form.Item
            title="Open Settings"
            subtitle="Adjust preferences and networking options"
            onPress={handleOpenSettings}
            showChevron
          />
          <Form.Item
            title="Marcus Neves"
            subtitle="Created by @mneves75"
            onPress={() => openLink('https://x.com/mneves75')}
            showChevron
          />
        </Form.Section>

        <Form.Section title="Community & Inspiration" register={false}>
          {communityLinks.map((link, index) => (
            <Form.Link
              key={link.title}
              title={link.title}
              subtitle={link.subtitle}
              onPress={() => openLink(link.url)}
            />
          ))}
        </Form.Section>

        <Form.Section
          title="Special Thanks"
          footer="This project wouldn't be possible without these amazing open-source projects and services"
          register={false}
        >
          {specialThanks.map((credit) => (
            <Form.Link
              key={credit.name}
              title={credit.name}
              subtitle={credit.description}
              onPress={() => openLink(credit.url)}
            />
          ))}
        </Form.Section>

        <View style={styles.footerContainer}>
          <Text
            style={[
              styles.footerText,
              { color: isDark ? '#8E8E93' : '#8E8E93' },
            ]}
          >
            © 2025 Marcus Neves • MIT Licensed
          </Text>
        </View>
      </Form.List>
    </GlassScreen>
  );
}

/**
 * Dynamic Styles Creator
 *
 * CRITICAL: This function creates styles based on color scheme.
 * In Phase 5, this will be replaced with theme hooks.
 */
const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    headerSection: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 24,
    },
    headerContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      padding: 24,
    },
    header: {
      alignItems: 'center',
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
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
      color: '#007AFF',
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
      backgroundColor: 'rgba(0, 122, 255, 0.15)',
      marginBottom: 16,
    },
    versionText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#007AFF',
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      fontWeight: '400',
    },
    footerContainer: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    footerText: {
      fontSize: 13,
      textAlign: 'center',
    },
  });
