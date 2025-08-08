import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import package.json to get version
const packageJson = require('../../../package.json');

export function About() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    content: {
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
      paddingTop: 20,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
      marginBottom: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#007AFF' : '#007AFF',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 5,
    },
    version: {
      fontSize: 16,
      color: isDark ? '#888' : '#666',
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#333',
      textAlign: 'center',
      lineHeight: 24,
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 15,
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 10,
      marginBottom: 10,
    },
    linkText: {
      fontSize: 16,
      color: isDark ? '#007AFF' : '#007AFF',
      flex: 1,
    },
    linkDescription: {
      fontSize: 14,
      color: isDark ? '#888' : '#666',
      marginLeft: 5,
    },
    creditItem: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 8,
      marginBottom: 8,
    },
    creditName: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#fff' : '#000',
    },
    creditDescription: {
      fontSize: 14,
      color: isDark ? '#888' : '#666',
      marginTop: 2,
    },
    footer: {
      alignItems: 'center',
      marginTop: 30,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333' : '#eee',
    },
    footerText: {
      fontSize: 14,
      color: isDark ? '#888' : '#666',
      textAlign: 'center',
    },
    inspiration: {
      backgroundColor: isDark ? '#0a2540' : '#e7f3ff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    inspirationText: {
      fontSize: 14,
      color: isDark ? '#64b5f6' : '#1565c0',
      textAlign: 'center',
      fontStyle: 'italic',
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🔍</Text>
          </View>
          <Text style={styles.title}>DNS Chat</Text>
          <Text style={styles.version}>Version {packageJson.version}</Text>
          <Text style={styles.description}>
            Ask questions to an LLM via DNS queries.
          </Text>
        </View>

        <View style={styles.inspiration}>
          <TouchableOpacity onPress={() => openLink('https://x.com/Arxiv_Daily/status/1952452878716805172')}>
            <Text style={[styles.linkText, { textAlign: 'center' }]}>@Arxiv_Daily</Text>
          </TouchableOpacity>
          <Text style={[styles.inspirationText, { marginTop: 8 }]}>• Tweet: @levelsio on LLM over DNS</Text>
          <TouchableOpacity onPress={() => openLink('https://x.com/levelsio')}>
            <Text style={[styles.linkText, { textAlign: 'center' }]}>@levelsio</Text>
          </TouchableOpacity>
          <Text style={[styles.inspirationText, { marginTop: 8 }]}>• Open-source: ch.at – Universal Basic Intelligence</Text>
          <TouchableOpacity onPress={() => openLink('https://github.com/Deep-ai-inc/ch.at')}>
            <Text style={[styles.linkText, { textAlign: 'center' }]}>github.com/Deep-ai-inc/ch.at</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Website</Text>
          
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('https://github.com/mneves75/dnschat')}
          >
            <Text style={styles.linkText}>🔗 GitHub Repository</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('https://github.com/mneves75/dnschat/issues')}
          >
            <Text style={styles.linkText}>🐛 Report an Issue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow</Text>
          
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('https://x.com/dnschat')}
          >
            <Text style={styles.linkText}>🐦 @dnschat on X</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brought to you by</Text>
          
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('https://x.com/mneves75')}
          >
            <Text style={styles.linkText}>👨‍💻 @mneves75</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Thanks</Text>
          {credits.map((credit, index) => (
            <TouchableOpacity
              key={index}
              style={styles.creditItem}
              onPress={() => openLink(credit.url)}
            >
              <Text style={styles.creditName}>{credit.name}</Text>
              <Text style={styles.creditDescription}>{credit.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Marcus Neves • MIT Licensed
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}