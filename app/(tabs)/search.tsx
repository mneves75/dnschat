/**
 * Search Screen - Native Search Tab (iOS System Integration)
 *
 * This screen demonstrates the NativeTabs role="search" feature,
 * which provides a system-integrated search tab with predefined icon.
 *
 * CURRENT STATE: Placeholder implementation
 * FUTURE ENHANCEMENT: Full search functionality for chats and messages
 *
 * PLANNED FEATURES:
 * - Search through all chat messages
 * - Filter by date range
 * - Search history
 * - Recent searches
 * - Search suggestions
 *
 * @author DNSChat Team
 * @since 2.0.0 (NativeTabs Migration)
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  useColorScheme,
  Platform,
} from 'react-native';
import { GlassCard, GlassScreen } from '../../src/design-system/glass';
import { Form } from '../../src/components/glass';
import { useTranslation } from '../../src/i18n';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <GlassScreen style={styles.screen}>
      <Form.List navigationTitle="Search" style={styles.container}>
        {/* Search Input Section */}
        <Form.Section title="Search Chats" register={false}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                  color: isDark ? '#FFFFFF' : '#000000',
                },
              ]}
              placeholder={t('search.placeholder')}
              placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
              returnKeyType="search"
              // Accessibility: Proper label and hint for screen readers
              accessibilityLabel="Search chats"
              accessibilityHint="Enter text to search through messages and chats"
              accessibilityRole="search"
            />
          </View>
        </Form.Section>

        {/* Placeholder Content */}
        <Form.Section register={false}>
          <GlassCard variant="regular" register={false} style={styles.placeholderCard}>
            <View style={styles.placeholderContent}>
              <Text style={styles.placeholderIcon}>🔍</Text>
              <Text
                style={[
                  styles.placeholderTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                Search Coming Soon
              </Text>
              <Text
                style={[
                  styles.placeholderSubtitle,
                  { color: isDark ? '#AEAEB2' : '#6D6D70' },
                ]}
              >
                This search tab demonstrates the iOS 26+ NativeTabs role="search"
                feature. Full search functionality for messages and chats will be
                implemented in a future update.
              </Text>
            </View>
          </GlassCard>
        </Form.Section>

        {/* Planned Features */}
        <Form.Section title="Planned Features" register={false}>
          <Form.Item
            title="Message Search"
            subtitle="Search through all chat messages"
            rightContent={
              <Text style={styles.comingSoonBadge}>Coming Soon</Text>
            }
          />
          <Form.Item
            title="Date Filters"
            subtitle="Filter results by date range"
            rightContent={
              <Text style={styles.comingSoonBadge}>Coming Soon</Text>
            }
          />
          <Form.Item
            title="Search History"
            subtitle="View your recent searches"
            rightContent={
              <Text style={styles.comingSoonBadge}>Coming Soon</Text>
            }
          />
          <Form.Item
            title="Smart Suggestions"
            subtitle="Get search suggestions as you type"
            rightContent={
              <Text style={styles.comingSoonBadge}>Coming Soon</Text>
            }
          />
        </Form.Section>
      </Form.List>
    </GlassScreen>
  );
}

/**
 * Styles
 *
 * CRITICAL: Always use StyleSheet.create for performance
 */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 17,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  placeholderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 32,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  comingSoonBadge: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF9500',
  },
});
