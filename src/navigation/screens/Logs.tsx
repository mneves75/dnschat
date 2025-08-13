import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { DNSLogService, DNSQueryLog, DNSLogEntry } from '../../services/dnsLogService';

export function Logs() {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<DNSQueryLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLogs();
    
    // Subscribe to log updates
    const unsubscribe = DNSLogService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });

    return unsubscribe;
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

  const renderLogEntry = (entry: DNSLogEntry) => {
    const statusIcon = DNSLogService.getStatusIcon(entry.status);
    const methodColor = DNSLogService.getMethodColor(entry.method);

    return (
      <View key={entry.id} style={styles.logEntry}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryIcon}>{statusIcon}</Text>
          <View style={[styles.methodBadge, { backgroundColor: methodColor + '20' }]}>
            <Text style={[styles.methodText, { color: methodColor }]}>
              {entry.method?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
          {entry.duration !== undefined && (
            <Text style={[styles.duration, { color: colors.text + '80' }]}>
              {DNSLogService.formatDuration(entry.duration)}
            </Text>
          )}
        </View>
        <Text style={[styles.entryMessage, { color: colors.text }]}>
          {entry.message || 'No message'}
        </Text>
        {entry.details && (
          <Text style={[styles.entryDetails, { color: colors.text + '80' }]}>
            {entry.details}
          </Text>
        )}
        {entry.error && (
          <Text style={[styles.entryError, { color: '#FF5252' }]}>
            Error: {entry.error}
          </Text>
        )}
      </View>
    );
  };

  const renderQueryLog = ({ item }: { item: DNSQueryLog }) => {
    const isExpanded = expandedLogs.has(item.id);
    const isActive = item.finalStatus === 'pending';
    const statusColor = item.finalStatus === 'success' ? '#4CAF50' : 
                       item.finalStatus === 'failure' ? '#FF5252' : '#FFC107';

    return (
      <TouchableOpacity
        style={[
          styles.logCard,
          { 
            backgroundColor: colors.card,
            borderColor: isActive ? statusColor : colors.border,
            borderWidth: isActive ? 2 : 1,
          }
        ]}
        onPress={() => toggleExpanded(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <Text style={[styles.queryText, { color: colors.text }]} numberOfLines={1}>
              {item.query || 'No query'}
            </Text>
            <View style={styles.logMeta}>
              <Text style={[styles.timestamp, { color: colors.text + '80' }]}>
                {new Date(item.startTime).toLocaleTimeString()}
              </Text>
              {item.finalMethod && (
                <View style={[styles.methodBadge, { backgroundColor: DNSLogService.getMethodColor(item.finalMethod) + '20' }]}>
                  <Text style={[styles.methodText, { color: DNSLogService.getMethodColor(item.finalMethod) }]}>
                    {item.finalMethod?.toUpperCase() || 'UNKNOWN'}
                  </Text>
                </View>
              )}
              {item.totalDuration !== undefined && (
                <Text style={[styles.duration, { color: colors.text + '80' }]}>
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
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            {item.response && (
              <View style={styles.responseSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Response:</Text>
                <Text style={[styles.responseText, { color: colors.text + 'CC' }]} numberOfLines={3}>
                  {item.response || 'No response'}
                </Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Query Steps:</Text>
            <ScrollView style={styles.entriesScroll} nestedScrollEnabled>
              {item.entries.map(renderLogEntry)}
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text + '80' }]}>
            No DNS queries logged yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.text + '60' }]}>
            Send a message to see query logs appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderQueryLog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.text}
            />
          }
        />
      )}

      {logs.length > 0 && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={clearLogs}
        >
          <Text style={[styles.clearButtonText, { color: '#FF5252' }]}>Clear All Logs</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  logCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderRadius: 4,
  },
  methodText: {
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});