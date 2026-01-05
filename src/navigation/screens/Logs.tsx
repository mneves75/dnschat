/**
 * Logs - DNS Query Log screen with glass UI
 *
 * Displays DNS query history with:
 * - Skeleton loading states
 * - Screen entrance animations
 * - Staggered list item animations
 * - Proper empty state with EmptyState component
 *
 * @see IOS-GUIDELINES.md - iOS 26 Liquid Glass patterns
 * @see DESIGN-UI-UX-GUIDELINES.md - Loading and empty states
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import Animated from "react-native-reanimated";
import { DNSLogService } from "../../services/dnsLogService";
import type { DNSQueryLog, DNSLogEntry } from "../../services/dnsLogService";
import { Form, LiquidGlassWrapper } from "../../components/glass";
import { useTranslation } from "../../i18n";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useScreenEntrance } from "../../ui/hooks/useScreenEntrance";
import { useStaggeredListValues, AnimatedListItem } from "../../ui/hooks/useStaggeredList";
import { LogsSkeleton } from "../../components/skeletons";
import { EmptyState } from "../../components/EmptyState";

export function Logs() {
  const palette = useImessagePalette();
  const [logs, setLogs] = useState<DNSQueryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  const { animatedStyle } = useScreenEntrance();
  const { opacities, translates } = useStaggeredListValues(logs.length);

  const historyFooter =
    logs.length === 1
      ? t("screen.logs.history.footerSingle", { count: logs.length })
      : t("screen.logs.history.footerMultiple", { count: logs.length });

  // Track skeleton display
  const showSkeleton = isLoading && !hasLoadedOnce && logs.length === 0;

  useEffect(() => {
    loadLogs();

    // Subscribe to log updates
    const unsubscribe = DNSLogService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });

    // Wrap cleanup to ensure void return type (unsubscribe may return boolean)
    return () => { unsubscribe(); };
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      await DNSLogService.initialize();
      setLogs(DNSLogService.getLogs());
    } finally {
      setIsLoading(false);
      if (!hasLoadedOnce) {
        setHasLoadedOnce(true);
      }
    }
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
      t("screen.logs.alerts.clearTitle"),
      t("screen.logs.alerts.clearMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("screen.logs.alerts.clearConfirm"),
          style: "destructive",
          onPress: async () => {
            await DNSLogService.clearLogs();
            setLogs([]);
          },
        },
      ],
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
            style={[
              styles.methodBadge,
              { backgroundColor: methodColor + "20" },
            ]}
          >
            <Text style={[styles.methodText, { color: methodColor }]}>
              {entry.method?.toUpperCase() || t("screen.logs.labels.unknownMethod")}
            </Text>
          </View>
          {entry.duration !== undefined && (
            <Text style={[styles.duration, { color: palette.textSecondary }]}>
              {DNSLogService.formatDuration(entry.duration)}
            </Text>
          )}
        </View>
        <Text style={[styles.entryMessage, { color: palette.textPrimary }]}>
          {entry.message || t("screen.logs.labels.noMessage")}
        </Text>
        {entry.details && (
          <Text style={[styles.entryDetails, { color: palette.textSecondary }]}>
            {entry.details}
          </Text>
        )}
        {entry.error && (
          <Text style={[styles.entryError, { color: palette.destructive }]}>
            {t("screen.logs.labels.errorPrefix", { message: entry.error })}
          </Text>
        )}
      </View>
    );
  };

  const renderQueryLog = ({ item, index }: { item: DNSQueryLog; index: number }) => {
    const isExpanded = expandedLogs.has(item.id);
    const isActive = item.finalStatus === "pending";
    const statusColor =
      item.finalStatus === "success"
        ? "#34C759" // iOS success green
        : item.finalStatus === "failure"
          ? palette.destructive
          : palette.userBubble; // Pending

    return (
      <AnimatedListItem
        opacity={opacities[index] ?? { value: 1 }}
        translateX={translates[index] ?? { value: 0 }}
      >
        <TouchableOpacity
          onPress={() => toggleExpanded(item.id)}
          style={styles.logItemWrapper}
          activeOpacity={0.95}
        >
          <LiquidGlassWrapper
            variant={isActive ? "interactive" : "regular"}
            shape="roundedRect"
            cornerRadius={12}
            isInteractive={true}
            style={[styles.logCard, isActive && styles.activeLogCard]}
          >
            <View style={styles.logHeader}>
              <View style={styles.logHeaderLeft}>
                <Text
                  style={[styles.queryText, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.query || t("screen.logs.labels.noQuery")}
                </Text>
                <View style={styles.logMeta}>
                  <Text style={[styles.timestamp, { color: palette.textTertiary }]}>
                    {new Date(item.startTime).toLocaleTimeString()}
                  </Text>
                  {item.finalMethod && (
                    <LiquidGlassWrapper
                      variant="interactive"
                      shape="capsule"
                      style={[
                        styles.methodBadge,
                        { backgroundColor: `${palette.userBubble}26` },
                      ]}
                    >
                      <Text style={[styles.methodText, { color: palette.userBubble }]}>
                        {item.finalMethod?.toUpperCase() || "UNKNOWN"}
                      </Text>
                    </LiquidGlassWrapper>
                  )}
                  {item.totalDuration !== undefined && (
                    <Text style={[styles.duration, { color: palette.textTertiary }]}>
                      {DNSLogService.formatDuration(item.totalDuration)}
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={[styles.statusIndicator, { backgroundColor: statusColor }]}
              >
                {isActive && <ActivityIndicator size="small" color="white" />}
                {!isActive && (
                  <Text style={styles.statusText}>
                    {item.finalStatus === "success"
                      ? "OK"
                      : item.finalStatus === "failure"
                        ? "X"
                        : "?"}
                  </Text>
                )}
              </View>
            </View>

            {isExpanded && (
              <View style={styles.logDetails}>
                <View
                  style={[styles.divider, { backgroundColor: palette.separator }]}
                />

                {item.response && (
                  <View style={styles.responseSection}>
                    <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                      {t("screen.logs.labels.response")}
                    </Text>
                    <Text
                      style={[styles.responseText, { color: palette.textSecondary }]}
                      numberOfLines={3}
                    >
                      {item.response || t("screen.logs.labels.noResponse")}
                    </Text>
                  </View>
                )}

                <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                  {t("screen.logs.labels.querySteps")}
                </Text>
                <View style={styles.entriesList}>
                  {item.entries.map((entry, entryIndex) => (
                    <React.Fragment key={`${item.id}-${entry.id || entryIndex}`}>
                      {renderLogEntry(entry, item.id)}
                      {entryIndex < item.entries.length - 1 && (
                        <View
                          style={[
                            styles.entryDivider,
                            { backgroundColor: palette.separator },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}
          </LiquidGlassWrapper>
        </TouchableOpacity>
      </AnimatedListItem>
    );
  };

  return (
    <Form.List
      testID="logs-screen"
      navigationTitle={t("screen.logs.navigationTitle")}
      nestedScrollEnabled
    >
      <Animated.View style={animatedStyle}>
        {/* Loading Skeleton */}
        {showSkeleton && (
          <Form.Section title={t("screen.logs.history.title")}>
            <LogsSkeleton count={5} />
          </Form.Section>
        )}

        {/* Empty State */}
        {!showSkeleton && logs.length === 0 && (
          <Form.Section>
            <EmptyState
              title={t("screen.logs.empty.title")}
              description={t("screen.logs.empty.subtitle")}
              iconType="logs"
              testID="logs-empty-state"
            />
          </Form.Section>
        )}

        {/* Logs List */}
        {!showSkeleton && logs.length > 0 && (
          <Form.Section
            title={t("screen.logs.history.title")}
            footer={historyFooter}
          >
            <View style={styles.logsList}>
              {logs.map((item, index) => (
                <View key={item.id}>{renderQueryLog({ item, index })}</View>
              ))}
            </View>
          </Form.Section>
        )}

        {/* Actions Section */}
        {logs.length > 0 && (
          <Form.Section title={t("screen.logs.actions.title")}>
            <Form.Item
              title={t("screen.logs.actions.clearAll")}
              subtitle={t("screen.logs.actions.clearAllSubtitle")}
              onPress={clearLogs}
              showChevron
              destructive
            />
          </Form.Section>
        )}
      </Animated.View>
    </Form.List>
  );
}

const styles = StyleSheet.create({
  logsList: {
    gap: 8,
  },
  logItemWrapper: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  logCard: {
    padding: 16,
    marginHorizontal: 20,
  },
  activeLogCard: {
    backgroundColor: "rgba(0, 122, 255, 0.1)", // iOS system blue for active
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  queryText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  logMeta: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
  duration: {
    fontSize: 14,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
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
    fontWeight: "600",
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  entriesList: {
    gap: 8,
  },
  entryDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  logEntry: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
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
