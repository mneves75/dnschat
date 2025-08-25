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
  useColorScheme,
  Share,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { DNSLogService, DNSQueryLog, DNSLogEntry } from '../../services/dnsLogService';
import { useSettings } from '../../context/SettingsContext';
import { 
  Form, 
  LiquidGlassWrapper,
} from '../../components/glass';

export function Logs() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { debugMode } = useSettings();
  const [logs, setLogs] = useState<DNSQueryLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [expandedDebugLogs, setExpandedDebugLogs] = useState<Set<string>>(new Set());
  const [exportingLogId, setExportingLogId] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
    
    // Subscribe to log updates
    const unsubscribe = DNSLogService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });

    return unsubscribe;
  }, []); // Only subscribe once on mount

  // Separate effect for debug mode changes
  useEffect(() => {
    DNSLogService.setDebugMode(debugMode);
  }, [debugMode]);

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

  const toggleDebugExpanded = (logId: string) => {
    setExpandedDebugLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const exportLog = async (log: DNSQueryLog) => {
    if (exportingLogId) return; // Prevent multiple simultaneous exports
    
    setExportingLogId(log.id);
    
    try {
      const jsonData = DNSLogService.exportLogAsJSON(log);
      const filename = DNSLogService.generateExportFilename(log);
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (Platform.OS === 'web') {
        // For React Native Web, check if browser APIs are available
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          try {
            // Try to use Blob API if available
            if (typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
              const blob = new Blob([jsonData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } else {
              throw new Error('Blob API not available');
            }
          } catch (webError) {
            // Fallback: copy to clipboard
            if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
              // Escape JSON for safe clipboard operation
              const safeJson = jsonData.replace(/</g, '&lt;').replace(/>/g, '&gt;');
              await navigator.clipboard.writeText(safeJson);
              Alert.alert('Copied to Clipboard', 'The log data has been copied to your clipboard.');
            } else {
              // Last resort: show truncated data
              Alert.alert('Export Data', 'Copy this data manually:\n\n' + jsonData.substring(0, 500) + '...');
            }
          }
        } else {
          // No browser APIs available, fallback to Share API or alert
          Alert.alert('Export Not Available', 'Web export is not available in this environment.');
        }
      } else {
        // For mobile, use Share API
        await Share.share({
          message: jsonData,
          title: filename,
        });
      }
    } catch (error: any) {
      console.error('Error exporting log:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      Alert.alert(
        'Export Failed', 
        `Could not export the log: ${errorMessage}\n\nPlease try again.`
      );
    } finally {
      setExportingLogId(null);
    }
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
        
        {/* Debug data section - only shown when debug mode is enabled */}
        {debugMode && entry.debugData && (
          <View style={styles.debugDataContainer}>
            <Text style={[styles.debugLabel, { color: colors.text + '80' }]}>
              🐛 Debug Data:
            </Text>
            <View style={styles.debugContent}>
              {entry.debugData.networkInfo && (
                <View style={styles.debugSection}>
                  <Text style={[styles.debugSectionTitle, { color: colors.text }]}>Network:</Text>
                  <Text style={[styles.debugText, { color: colors.text + '80' }]} numberOfLines={5}>
                    Server: {entry.debugData.networkInfo.server}:{entry.debugData.networkInfo.port}
                  </Text>
                  <Text style={[styles.debugText, { color: colors.text + '80' }]}>
                    Protocol: {entry.debugData.networkInfo.protocol}
                  </Text>
                </View>
              )}
              {entry.debugData.rawRequest && (
                <View style={styles.debugSection}>
                  <Text style={[styles.debugSectionTitle, { color: colors.text }]}>Request:</Text>
                  <Text style={[styles.debugCode, { color: colors.text + '80' }]} numberOfLines={10}>
                    {entry.debugData.rawRequest}
                  </Text>
                </View>
              )}
              {entry.debugData.rawResponse && (
                <View style={styles.debugSection}>
                  <Text style={[styles.debugSectionTitle, { color: colors.text }]}>Response:</Text>
                  <Text style={[styles.debugCode, { color: colors.text + '80' }]} numberOfLines={10}>
                    {entry.debugData.rawResponse}
                  </Text>
                </View>
              )}
              {entry.debugData.stackTrace && (
                <View style={styles.debugSection}>
                  <Text style={[styles.debugSectionTitle, { color: colors.text }]}>Stack Trace:</Text>
                  <Text style={[styles.debugCode, { color: colors.text + '80' }]} numberOfLines={10}>
                    {entry.debugData.stackTrace}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderQueryLog = ({ item }: { item: DNSQueryLog }) => {
    const isExpanded = expandedLogs.has(item.id);
    const isActive = item.finalStatus === 'pending';
    const statusColor = item.finalStatus === 'success' ? '#4CAF50' : 
                       item.finalStatus === 'failure' ? '#FF453A' : '#34C759'; // Success green

    return (
      <TouchableOpacity
        onPress={() => toggleExpanded(item.id)}
        style={styles.logItemWrapper}
        activeOpacity={0.95}
      >
        <View style={[styles.logCard, isActive && styles.activeLogCard, { borderRadius: 12 }]}>
          <View style={styles.logHeader}>
            <View style={styles.logHeaderLeft}>
              <Text style={[styles.queryText, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
                {item.query || 'No query'}
              </Text>
              <View style={styles.logMeta}>
                <Text style={[styles.timestamp, { color: isDark ? '#AEAEB2' : '#6D6D70' }]}>
                  {new Date(item.startTime).toLocaleTimeString()}
                </Text>
                {item.finalMethod && (
                  <View style={[styles.methodBadge, { backgroundColor: 'rgba(0, 122, 255, 0.15)', borderRadius: 12 }]}>
                    <Text style={[styles.methodText, { color: '#007AFF' }]}>
                      {item.finalMethod?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                  </View>
                )}
                {item.totalDuration !== undefined && (
                  <Text style={[styles.duration, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
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
              
              {/* Export button */}
              <TouchableOpacity
                style={[styles.exportButton, { 
                  borderColor: colors.border,
                  opacity: exportingLogId === item.id ? 0.6 : 1
                }]}
                onPress={() => exportLog(item)}
                disabled={exportingLogId !== null}
              >
                {exportingLogId === item.id ? (
                  <View style={styles.exportButtonContent}>
                    <ActivityIndicator size="small" color={colors.text} />
                    <Text style={[styles.exportButtonText, { color: colors.text, marginLeft: 8 }]}>
                      Exporting...
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.exportButtonText, { color: colors.text }]}>
                    📤 Export as JSON
                  </Text>
                )}
              </TouchableOpacity>
              
              {item.response && (
                <View style={styles.responseSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Response:</Text>
                  <Text style={[styles.responseText, { color: colors.text + 'CC' }]} numberOfLines={3}>
                    {item.response || 'No response'}
                  </Text>
                </View>
              )}

              {/* Debug context - only shown when debug mode is enabled */}
              {debugMode && item.debugContext && (
                <TouchableOpacity 
                  onPress={() => toggleDebugExpanded(item.id)}
                  style={styles.debugContextSection}
                >
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    🐛 Debug Context {expandedDebugLogs.has(item.id) ? '▼' : '▶'}
                  </Text>
                  {expandedDebugLogs.has(item.id) && (
                    <View style={styles.debugContextContent}>
                      {item.debugContext.settingsSnapshot && (
                        <View style={styles.debugSection}>
                          <Text style={[styles.debugSectionTitle, { color: colors.text }]}>Settings:</Text>
                          <Text style={[styles.debugText, { color: colors.text + '80' }]}>
                            Server: {item.debugContext.settingsSnapshot.dnsServer}
                          </Text>
                          <Text style={[styles.debugText, { color: colors.text + '80' }]}>
                            Method: {item.debugContext.settingsSnapshot.dnsMethodPreference}
                          </Text>
                          <Text style={[styles.debugText, { color: colors.text + '80' }]}>
                            HTTPS: {item.debugContext.settingsSnapshot.preferDnsOverHttps ? 'Yes' : 'No'}
                          </Text>
                        </View>
                      )}
                      {item.debugContext.deviceInfo && (
                        <View style={styles.debugSection}>
                          <Text style={[styles.debugSectionTitle, { color: colors.text }]}>Device:</Text>
                          <Text style={[styles.debugText, { color: colors.text + '80' }]}>
                            {item.debugContext.deviceInfo.model} - {item.debugContext.deviceInfo.os} {item.debugContext.deviceInfo.version}
                          </Text>
                        </View>
                      )}
                      {item.debugContext.conversationHistory && (
                        <View style={styles.debugSection}>
                          <Text style={[styles.debugSectionTitle, { color: colors.text }]}>Conversation:</Text>
                          {item.debugContext.conversationHistory.slice(0, 5).map((msg, idx) => (
                            <Text key={idx} style={[styles.debugText, { color: colors.text + '80' }]} numberOfLines={3}>
                              {msg.role}: {msg.message}
                            </Text>
                          ))}
                          {item.debugContext.conversationHistory.length > 5 && (
                            <Text style={[styles.debugText, { color: colors.text + '60' }]}>
                              ... and {item.debugContext.conversationHistory.length - 5} more messages
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              )}

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Query Steps:</Text>
              <ScrollView style={styles.entriesScroll} nestedScrollEnabled>
                {item.entries.map((entry, index) => (
                  <View key={`${item.id}-${entry.id || index}`}>
                    {renderLogEntry(entry, item.id)}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Form.List navigationTitle="DNS Query Logs">
      {logs.length === 0 ? (
        <Form.Section>
          <View style={[styles.emptyStateContainer, { borderRadius: 12 }]}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                No DNS Queries Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? '#AEAEB2' : '#6D6D70' }]}>
                Send a message to see DNS query logs appear here.
                All query attempts and methods will be tracked.
              </Text>
            </View>
          </View>
        </Form.Section>
      ) : (
        <Form.Section 
          title={`DNS Query History`}
          footer={`${logs.length} quer${logs.length === 1 ? 'y' : 'ies'} logged`}
        >
          <View style={styles.logsList}>
            {logs.map((item) => (
              <View key={item.id}>
                {renderQueryLog({ item })}
              </View>
            ))}
          </View>
        </Form.Section>
      )}

      {logs.length > 0 && (
        <Form.Section title="Actions">
          <Form.Item
            title="Clear All Logs"
            subtitle="Remove all DNS query history"
            rightContent={
              <View style={[styles.clearBadge, { borderRadius: 12 }]}>
                <Text style={styles.clearIcon}>🗑️</Text>
              </View>
            }
            onPress={clearLogs}
            showChevron
          />
        </Form.Section>
      )}
    </Form.List>
  );
}

const styles = StyleSheet.create({
  // New glass-based styles
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
    backgroundColor: 'rgba(255, 69, 58, 0.15)', // Notion red
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)', // iOS system blue for active
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
  exportButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugDataContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  debugContent: {
    marginTop: 4,
  },
  debugSection: {
    marginBottom: 8,
  },
  debugSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  debugText: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  debugCode: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  debugContextSection: {
    marginBottom: 16,
  },
  debugContextContent: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 4,
  },
});