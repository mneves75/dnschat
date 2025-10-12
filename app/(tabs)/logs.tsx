/**
 * DNS Logs Screen - Tab (Expo Router)
 *
 * Displays DNS query logs with detailed method tracking and status.
 * Adapted from src/navigation/screens/Logs.tsx for Expo Router.
 *
 * CRITICAL: Default export required for Expo Router file-based routing.
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {
  DNSLogService,
  DNSQueryLog,
  DNSLogEntry,
} from '../../src/services/dnsLogService';
import { Form } from '../../src/components/glass';
import { GlassCard, GlassScreen } from '../../src/design-system/glass';
import { useTranslation } from '../../src/i18n';

/**
 * DNS Logs Screen Component
 *
 * Uses expo-glass-effect via GlassCard for iOS 26+ liquid glass.
 * FUTURE: Add virtualization with @shopify/flash-list for 100+ logs
 */
export default function LogsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [logs, setLogs] = useState<DNSQueryLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // CRITICAL: Get translations
  const { t } = useTranslation();

  useEffect(() => {
    loadLogs();

    // Subscribe to real-time log updates
    const unsubscribe = DNSLogService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });

    // CRITICAL: Wrap cleanup to ensure void return type for React useEffect
    return () => {
      unsubscribe();
    };
  }, []);

  const loadLogs = async () => {
    await DNSLogService.initialize();
    setLogs(DNSLogService.getLogs());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all DNS query logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await DNSLogService.clearLogs();
            setLogs([]);
          },
        },
      ]
    );
  };

  const renderLogEntry = (entry: DNSLogEntry, parentId?: string) => {
    const statusIcon = DNSLogService.getStatusIcon(entry.status);
    const methodColor = DNSLogService.getMethodColor(entry.method);

    return (
      <View key={`${parentId}-${entry.id}`} style={styles.logEntry}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryIcon}>{statusIcon}</Text>
          <View
            style={[styles.methodBadge, { backgroundColor: methodColor + '20' }]}
          >
            <Text style={[styles.methodText, { color: methodColor }]}>
              {entry.method?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
          {entry.duration !== undefined && (
            <Text
              style={[styles.duration, { color: isDark ? '#8E8E93' : '#8E8E93' }]}
            >
              {DNSLogService.formatDuration(entry.duration)}
            </Text>
          )}
        </View>
        <Text style={[styles.entryMessage, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {entry.message || 'No message'}
        </Text>
        {entry.details && (
          <Text style={[styles.entryDetails, { color: isDark ? '#AEAEB2' : '#6D6D70' }]}>
            {entry.details}
          </Text>
        )}
        {entry.error && (
          <Text style={[styles.entryError, { color: '#FF453A' }]}>
            Error: {entry.error}
          </Text>
        )}
      </View>
    );
  };

  const renderQueryLog = ({ item }: { item: DNSQueryLog }) => {
    const isExpanded = expandedLogs.has(item.id);
    const isActive = item.finalStatus === 'pending';
    const statusColor =
      item.finalStatus === 'success'
        ? '#34C759'
        : item.finalStatus === 'failure'
          ? '#FF453A'
          : '#FF9F0A';

    return (
      <TouchableOpacity
        onPress={() => toggleExpanded(item.id)}
        style={styles.logItemWrapper}
        activeOpacity={0.95}
        accessibilityRole="button"
        accessibilityLabel={`DNS query: ${item.query}. Status: ${item.finalStatus}`}
      >
        <GlassCard
          variant={isActive ? 'interactive' : 'regular'}
          register={false}
          style={[styles.logCard, isActive && styles.activeLogCard]}
        >
          <View style={styles.logHeader}>
            <View style={styles.logHeaderLeft}>
              <Text
                style={[
                  styles.queryText,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
                numberOfLines={1}
              >
                {item.query || 'No query'}
              </Text>
              <View style={styles.logMeta}>
                <Text
                  style={[
                    styles.timestamp,
                    { color: isDark ? '#AEAEB2' : '#6D6D70' },
                  ]}
                >
                  {new Date(item.startTime).toLocaleTimeString()}
                </Text>
                {item.finalMethod && (
                  <GlassCard
                    variant="interactive"
                    register={false}
                    style={[
                      styles.methodBadgeSmall,
                      { backgroundColor: 'rgba(0, 122, 255, 0.15)' },
                    ]}
                  >
                    <Text style={[styles.methodTextSmall, { color: '#007AFF' }]}>
                      {item.finalMethod?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                  </GlassCard>
                )}
                {item.totalDuration !== undefined && (
                  <Text
                    style={[
                      styles.duration,
                      { color: isDark ? '#8E8E93' : '#8E8E93' },
                    ]}
                  >
                    {DNSLogService.formatDuration(item.totalDuration)}
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
              {isActive && <ActivityIndicator size="small" color="white" />}
              {!isActive && (
                <Text style={styles.statusText}>
                  {item.finalStatus === 'success' ? '✓' : item.finalStatus === 'failure' ? '✗' : '?'}
                </Text>
              )}
            </View>
          </View>

          {isExpanded && (
            <View style={styles.logDetails}>
              <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#C6C6C8' }]} />

              {item.response && (
                <View style={styles.responseSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Response:
                  </Text>
                  <Text
                    style={[styles.responseText, { color: isDark ? '#AEAEB2' : '#6D6D70' }]}
                    numberOfLines={3}
                  >
                    {item.response || 'No response'}
                  </Text>
                </View>
              )}

              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Query Steps:
              </Text>
              <ScrollView style={styles.entriesScroll} nestedScrollEnabled>
                {item.entries.map((entry, index) => (
                  <View key={`${item.id}-${entry.id || index}`}>
                    {renderLogEntry(entry, item.id)}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <GlassScreen register={false} style={styles.screen}>
      <Form.List navigationTitle={t('logs.title')} style={styles.list}>
      {logs.length === 0 ? (
        <Form.Section register={false}>
          <GlassCard
            variant="regular"
            register={false}
            style={styles.emptyStateContainer}
          >
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                {t('logs.noLogs')}
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: isDark ? '#AEAEB2' : '#6D6D70' },
                ]}
              >
                Send a message to see DNS query logs appear here. All query
                attempts and methods will be tracked.
              </Text>
            </View>
          </GlassCard>
        </Form.Section>
      ) : (
        <Form.Section
          title="DNS Query History"
          footer={`${logs.length} quer${logs.length === 1 ? 'y' : 'ies'} logged`}
          register={false}
        >
          <View style={styles.logsList}>
            {logs.map((item) => (
              <View key={item.id}>{renderQueryLog({ item })}</View>
            ))}
          </View>
        </Form.Section>
      )}

      {logs.length > 0 && (
        <Form.Section title={t('logs.filter')} register={false}>
          <Form.Item
            title={t('logs.clear')}
            subtitle="Remove all DNS query history"
            rightContent={
              <GlassCard
                variant="interactive"
                register={false}
                style={styles.clearBadge}
              >
                <Text style={styles.clearIcon}>🗑️</Text>
              </GlassCard>
            }
            onPress={clearLogs}
            showChevron
          />
        </Form.Section>
      )}
      </Form.List>
    </GlassScreen>
  );
}

// CRITICAL: StyleSheet.create for performance
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  emptyStateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  clearBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
  clearIcon: {
    fontSize: 16,
  },
  logsList: {
    gap: 8,
  },
  logItemWrapper: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  logCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginHorizontal: 20,
  },
  activeLogCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  queryText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: {
    fontSize: 14,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  methodBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  methodTextSmall: {
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 14,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logDetails: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  responseSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  entriesScroll: {
    maxHeight: 300,
  },
  logEntry: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  entryIcon: {
    fontSize: 16,
  },
  entryMessage: {
    fontSize: 14,
    marginLeft: 24,
  },
  entryDetails: {
    fontSize: 12,
    marginLeft: 24,
    marginTop: 2,
  },
  entryError: {
    fontSize: 12,
    marginLeft: 24,
    marginTop: 2,
  },
});
