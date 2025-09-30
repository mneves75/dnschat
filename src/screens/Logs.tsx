/**
 * Logs - Modernized DNS Query Logs with FlashList + Liquid Glass
 *
 * Phase 2 rebuild featuring:
 * - FlashList with section headers (active vs historical)
 * - Timeline ribbon with glass capsule badges
 * - Filter and sort controls with glass styling
 * - Glass action sheet for log management
 * - Performance monitoring
 *
 * @author DNSChat Team
 * @since 2.1.0 (Phase 2 - Liquid Glass UI Redesign)
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Animated,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useGlassTheme } from "../hooks/useGlassTheme";
import {
  DNSLogService,
  DNSQueryLog,
  DNSLogEntry,
} from "../services/dnsLogService";
import { GlassActionSheet, useGlassBottomSheet } from "../components/glass";

// ==================================================================================
// TYPES
// ==================================================================================

type FilterType = "all" | "success" | "failure" | "pending";
type SortType = "newest" | "oldest" | "duration";

interface LogListItem {
  type: "header" | "log" | "timeline" | "empty";
  id: string;
  data?: DNSQueryLog;
  title?: string;
  count?: number;
}

// ==================================================================================
// TIMELINE RIBBON COMPONENT
// ==================================================================================

const TimelineRibbon: React.FC<{ logs: DNSQueryLog[] }> = ({ logs }) => {
  const { getGlassStyle, colors } = useGlassTheme();

  // Group logs by hour for the last 24 hours
  const timelineData = useMemo(() => {
    const now = Date.now();
    const hours = 24;
    const buckets = Array(hours).fill(0);

    logs.forEach((log) => {
      const age = now - log.startTime.getTime();
      const hourAgo = Math.floor(age / (1000 * 60 * 60));
      if (hourAgo < hours) {
        buckets[hours - 1 - hourAgo]++;
      }
    });

    return buckets;
  }, [logs]);

  const maxCount = Math.max(...timelineData, 1);

  return (
    <View style={[getGlassStyle("card", "prominent", "roundedRect"), styles.timelineContainer]}>
      <Text style={[styles.timelineTitle, { color: colors.text }]}>
        Query Activity (24h)
      </Text>
      <View style={styles.timelineChart}>
        {timelineData.map((count, index) => {
          const height = (count / maxCount) * 40;
          return (
            <View
              key={index}
              style={[
                styles.timelineBar,
                {
                  height: Math.max(height, 2),
                  backgroundColor: count > 0 ? colors.accent : colors.muted,
                  opacity: count > 0 ? 0.8 : 0.3,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.timelineLabels}>
        <Text style={[styles.timelineLabel, { color: colors.muted }]}>24h ago</Text>
        <Text style={[styles.timelineLabel, { color: colors.muted }]}>Now</Text>
      </View>
    </View>
  );
};

// ==================================================================================
// FILTER/SORT CONTROLS
// ==================================================================================

interface FilterControlsProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}) => {
  const { getGlassStyle, colors } = useGlassTheme();

  const filters: FilterType[] = ["all", "success", "failure", "pending"];
  const sorts: SortType[] = ["newest", "oldest", "duration"];

  return (
    <View style={styles.controlsContainer}>
      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <Text style={[styles.controlLabel, { color: colors.muted }]}>Filter:</Text>
        <View style={styles.pillContainer}>
          {filters.map((f) => (
            <Pressable
              key={f}
              accessibilityRole="button"
              android_ripple={{ color: colors.accent + "33" }}
              onPress={() => onFilterChange(f)}
              style={({ pressed }) => [
                getGlassStyle("button", filter === f ? "interactive" : "regular", "capsule"),
                styles.pill,
                pressed && styles.pillPressed,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: filter === f ? colors.accent : colors.text },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Sort Pills */}
      <View style={styles.filterRow}>
        <Text style={[styles.controlLabel, { color: colors.muted }]}>Sort:</Text>
        <View style={styles.pillContainer}>
          {sorts.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              android_ripple={{ color: colors.accent + "33" }}
              onPress={() => onSortChange(s)}
              style={({ pressed }) => [
                getGlassStyle("button", sort === s ? "interactive" : "regular", "capsule"),
                styles.pill,
                pressed && styles.pillPressed,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: sort === s ? colors.accent : colors.text },
                ]}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

// ==================================================================================
// LOG ENTRY COMPONENT (for expanded view)
// ==================================================================================

const LogEntryItem: React.FC<{ entry: DNSLogEntry }> = ({ entry }) => {
  const { colors } = useGlassTheme();
  const statusIcon = DNSLogService.getStatusIcon(entry.status);
  const methodColor = DNSLogService.getMethodColor(entry.method);

  return (
    <View style={styles.logEntryItem}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryIcon}>{statusIcon}</Text>
        <View
          style={[
            styles.methodBadge,
            { backgroundColor: methodColor + "20" },
          ]}
        >
          <Text style={[styles.methodText, { color: methodColor }]}>
            {entry.method?.toUpperCase() || "UNKNOWN"}
          </Text>
        </View>
        {entry.duration !== undefined && (
          <Text style={[styles.duration, { color: colors.muted }]}>
            {DNSLogService.formatDuration(entry.duration)}
          </Text>
        )}
      </View>
      <Text style={[styles.entryMessage, { color: colors.text }]}>
        {entry.message || "No message"}
      </Text>
      {entry.details && (
        <Text style={[styles.entryDetails, { color: colors.muted }]}>
          {entry.details}
        </Text>
      )}
      {entry.error && (
        <Text style={[styles.entryError, { color: colors.danger }]}>
          Error: {entry.error}
        </Text>
      )}
    </View>
  );
};

// ==================================================================================
// LOG CARD COMPONENT
// ==================================================================================

interface LogCardProps {
  log: DNSQueryLog;
  isExpanded: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}

const LogCard: React.FC<LogCardProps> = React.memo(({
  log,
  isExpanded,
  onToggle,
  onLongPress,
}) => {
  const { getGlassStyle, colors } = useGlassTheme();
  const [isPressed, setIsPressed] = useState(false);

  const isActive = log.finalStatus === "pending";
  const statusColor =
    log.finalStatus === "success"
      ? colors.success
      : log.finalStatus === "failure"
        ? colors.danger
        : colors.warning;

  const cardStyle = getGlassStyle(
    "card",
    isActive ? "interactive" : isPressed ? "interactive" : "regular",
    "roundedRect",
  );

  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onLongPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessibilityRole="button"
      android_ripple={{ color: colors.accent + "22" }}
      style={({ pressed }) => [
        styles.logCardWrapper,
        pressed && styles.logCardWrapperPressed,
      ]}
    >
      <View style={[cardStyle, styles.logCard]}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <Text style={[styles.queryText, { color: colors.text }]} numberOfLines={1}>
              {log.query || "No query"}
            </Text>
            <View style={styles.logMeta}>
              <Text style={[styles.timestamp, { color: colors.muted }]}>
                {new Date(log.startTime).toLocaleTimeString()}
              </Text>
              {log.finalMethod && (
                <View
                  style={[
                    getGlassStyle("button", "interactive", "capsule"),
                    styles.methodBadge,
                  ]}
                >
                  <Text style={[styles.methodText, { color: colors.accent }]}>
                    {log.finalMethod.toUpperCase()}
                  </Text>
                </View>
              )}
              {log.totalDuration !== undefined && (
                <Text style={[styles.duration, { color: colors.muted }]}>
                  {DNSLogService.formatDuration(log.totalDuration)}
                </Text>
              )}
            </View>
          </View>

          {/* Status Indicator */}
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
            {isActive && <ActivityIndicator size="small" color="white" />}
            {!isActive && (
              <Text style={styles.statusText}>
                {log.finalStatus === "success" ? "✓" : "✗"}
              </Text>
            )}
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.logDetails}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {log.response && (
              <View style={styles.responseSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Response:
                </Text>
                <Text style={[styles.responseText, { color: colors.text }]}>
                  {log.response}
                </Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Query Steps ({log.entries.length}):
            </Text>
            <View style={styles.entriesContainer}>
              {log.entries.map((entry, index) => (
                <LogEntryItem key={`${log.id}-${entry.id || index}`} entry={entry} />
              ))}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
});

LogCard.displayName = "LogCard";

// ==================================================================================
// SECTION HEADER COMPONENT
// ==================================================================================

const SectionHeader: React.FC<{ title: string; count: number }> = ({ title, count }) => {
  const { colors } = useGlassTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
        {title}
      </Text>
      <View style={[styles.countBadge, { backgroundColor: colors.accent + "20" }]}>
        <Text style={[styles.countBadgeText, { color: colors.accent }]}>
          {count}
        </Text>
      </View>
    </View>
  );
};

// ==================================================================================
// EMPTY STATE
// ==================================================================================

const EmptyState: React.FC = () => {
  const { getGlassStyle, colors } = useGlassTheme();

  return (
    <View style={[getGlassStyle("card", "regular", "roundedRect"), styles.emptyContainer]}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No DNS Queries Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
        Send a message to see DNS query logs appear here. All query attempts and
        methods will be tracked.
      </Text>
    </View>
  );
};

// ==================================================================================
// MAIN LOGS COMPONENT
// ==================================================================================

export function Logs() {
  const { colors } = useGlassTheme();
  const [logs, setLogs] = useState<DNSQueryLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [refreshing, setRefreshing] = useState(false);

  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  renderCountRef.current += 1;
  const now = Date.now();
  const lastRenderDuration = now - lastRenderTimeRef.current;
  lastRenderTimeRef.current = now;
  const actionSheet = useGlassBottomSheet();
  const selectedLogRef = useRef<DNSQueryLog | null>(null);

  useEffect(() => {
    loadLogs();

    const unsubscribe = DNSLogService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const loadLogs = async () => {
    await DNSLogService.initialize();
    setLogs(DNSLogService.getLogs());
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }, []);

  const toggleExpanded = useCallback((logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }, []);

  const handleLogLongPress = useCallback((log: DNSQueryLog) => {
    selectedLogRef.current = log;
    actionSheet.show();
  }, [actionSheet]);

  const handleDeleteLog = useCallback(() => {
    if (!selectedLogRef.current) return;

    const log = selectedLogRef.current;
    Alert.alert(
      "Delete Log",
      `Delete query log for "${log.query}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // TODO: Implement single log deletion in DNSLogService
            console.log("Delete log:", log.id);
          },
        },
      ],
    );
  }, []);

  const handleClearAllLogs = useCallback(() => {
    Alert.alert(
      "Clear All Logs",
      "Are you sure you want to clear all DNS query logs?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await DNSLogService.clearLogs();
            setLogs([]);
          },
        },
      ],
    );
  }, []);

  // Filter and sort logs
  const processedLogs = useMemo(() => {
    let filtered = logs;

    // Apply filter
    if (filter !== "all") {
      filtered = logs.filter((log) => log.finalStatus === filter);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.startTime.getTime() - b.startTime.getTime();
        case "duration":
          return (b.totalDuration || 0) - (a.totalDuration || 0);
        case "newest":
        default:
          return b.startTime.getTime() - a.startTime.getTime();
      }
    });

    return sorted;
  }, [logs, filter, sort]);

  // Separate active and completed logs
  const activeLogs = useMemo(
    () => processedLogs.filter((log) => log.finalStatus === "pending"),
    [processedLogs],
  );

  const completedLogs = useMemo(
    () => processedLogs.filter((log) => log.finalStatus !== "pending"),
    [processedLogs],
  );

  // Build FlashList data with sections
  const listData: LogListItem[] = useMemo(() => {
    const items: LogListItem[] = [];

    // Timeline
    if (logs.length > 0) {
      items.push({ type: "timeline", id: "timeline" });
    }

    // Active queries section
    if (activeLogs.length > 0) {
      items.push({
        type: "header",
        id: "active-header",
        title: "Active Queries",
        count: activeLogs.length,
      });
      activeLogs.forEach((log) => {
        items.push({ type: "log", id: log.id, data: log });
      });
    }

    // Completed queries section
    if (completedLogs.length > 0) {
      items.push({
        type: "header",
        id: "completed-header",
        title: "Query History",
        count: completedLogs.length,
      });
      completedLogs.forEach((log) => {
        items.push({ type: "log", id: log.id, data: log });
      });
    }

    // Empty state
    if (items.length === 0) {
      items.push({ type: "empty", id: "empty" });
    }

    return items;
  }, [logs, activeLogs, completedLogs]);

  const renderItem: ListRenderItem<LogListItem> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "timeline":
          return <TimelineRibbon logs={logs} />;

        case "header":
          return <SectionHeader title={item.title!} count={item.count!} />;

        case "log":
          return (
            <LogCard
              log={item.data!}
              isExpanded={expandedLogs.has(item.id)}
              onToggle={() => toggleExpanded(item.id)}
              onLongPress={() => handleLogLongPress(item.data!)}
            />
          );

        case "empty":
          return <EmptyState />;

        default:
          return null;
      }
    },
    [logs, expandedLogs, toggleExpanded, handleLogLongPress],
  );

  const getItemType = useCallback((item: LogListItem) => item.type, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {__DEV__ && (
        <View style={styles.debugBar}>
          <Text style={[styles.debugText, { color: colors.muted }]}>
            Renders: {renderCountRef.current} | Last: {lastRenderDuration}ms | Logs: {logs.length}
          </Text>
        </View>
      )}

      {/* Filter/Sort Controls */}
      {logs.length > 0 && (
        <FilterControls
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />
      )}

      {/* Logs List */}
      <FlashList
        data={listData}
        renderItem={renderItem}
        estimatedItemSize={140}
        keyExtractor={(item) => item.id}
        getItemType={getItemType}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={11}
      />

      {/* Log Actions Sheet */}
      <GlassActionSheet
        visible={actionSheet.visible}
        onClose={actionSheet.hide}
        title={selectedLogRef.current?.query || "DNS Query"}
        message="Choose an action for this log entry"
        actions={[
          {
            title: "Delete Log",
            onPress: handleDeleteLog,
            style: "destructive" as const,
            icon: <Text>🗑️</Text>,
          },
          {
            title: "Clear All Logs",
            onPress: handleClearAllLogs,
            style: "destructive" as const,
            icon: <Text>⚠️</Text>,
          },
          {
            title: "Cancel",
            onPress: actionSheet.hide,
            style: "cancel" as const,
          },
        ]}
      />
    </View>
  );
}

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  debugText: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: "500",
    minWidth: 50,
  },
  pillContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillPressed: {
    transform: [{ scale: 0.96 }],
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  timelineContainer: {
    padding: 16,
    marginVertical: 16,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  timelineChart: {
    flexDirection: "row",
    height: 50,
    alignItems: "flex-end",
    gap: 2,
  },
  timelineBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 2,
  },
  timelineLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timelineLabel: {
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  logCardWrapper: {
    marginBottom: 12,
  },
  logCardWrapperPressed: {
    transform: [{ scale: 0.98 }],
  },
  logCard: {
    padding: 16,
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
    flexWrap: "wrap",
  },
  timestamp: {
    fontSize: 13,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  methodText: {
    fontSize: 11,
    fontWeight: "600",
  },
  duration: {
    fontSize: 13,
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
    opacity: 0.9,
  },
  entriesContainer: {
    gap: 8,
  },
  logEntryItem: {
    paddingLeft: 8,
    paddingVertical: 6,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  entryIcon: {
    fontSize: 14,
  },
  entryMessage: {
    fontSize: 13,
    marginLeft: 20,
  },
  entryDetails: {
    fontSize: 11,
    marginLeft: 20,
    marginTop: 2,
  },
  entryError: {
    fontSize: 11,
    marginLeft: 20,
    marginTop: 2,
  },
  emptyContainer: {
    marginHorizontal: 16,
    marginVertical: 32,
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
  },
});
