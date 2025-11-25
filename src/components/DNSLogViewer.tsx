import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { DNSLogService, DNSQueryLog } from "../services/dnsLogService";
import { useTranslation } from "../i18n";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { useTypography } from "../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../ui/theme/liquidGlassSpacing";

interface DNSLogViewerProps {
  maxEntries?: number;
}

/**
 * iOS 26 HIG-compliant DNS query log viewer.
 * Uses semantic colors and typography for proper light/dark mode support.
 */
export const DNSLogViewer: React.FC<DNSLogViewerProps> = ({
  maxEntries = 20,
}) => {
  const [logs, setLogs] = useState<DNSQueryLog[]>(DNSLogService.getLogs());
  const { t } = useTranslation();
  const palette = useImessagePalette();
  const typography = useTypography();

  useEffect(() => {
    const unsub = DNSLogService.subscribe(setLogs);
    return () => {
      unsub();
    };
  }, []);

  const display = logs.slice(0, maxEntries);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {display.length === 0 ? (
        <Text style={[styles.empty, typography.body, { color: palette.textSecondary }]}>
          {t("components.dnsLogViewer.empty")}
        </Text>
      ) : (
        display.map((log) => (
          <View
            key={log.id}
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <View style={styles.headerRow}>
              <Text style={[styles.title, typography.headline, { color: palette.textPrimary }]}>
                {log.query}
              </Text>
              <Text style={[styles.duration, typography.caption1, { color: palette.textSecondary }]}>
                {DNSLogService.formatDuration(log.totalDuration)}
              </Text>
            </View>
            <Text style={[styles.meta, typography.caption2, { color: palette.textSecondary }]}>
              {log.startTime.toLocaleTimeString()} •{" "}
              {log.finalStatus.toUpperCase()}
              {log.finalMethod ? ` via ${log.finalMethod.toUpperCase()}` : ""}
            </Text>
            <View style={styles.entries}>
              {log.entries.map((e) => (
                <View key={e.id} style={styles.entryRow}>
                  <Text
                    style={[
                      styles.badge,
                      typography.caption2,
                      { backgroundColor: DNSLogService.getMethodColor(e.method) },
                    ]}
                  >
                    {e.method.toUpperCase()}
                  </Text>
                  <Text style={styles.icon}>
                    {DNSLogService.getStatusIcon(e.status)}
                  </Text>
                  <Text style={[styles.entryText, typography.footnote, { color: palette.textPrimary }]}>
                    {e.message}
                  </Text>
                  {typeof e.duration === "number" && (
                    <Text style={[styles.entryDuration, typography.caption2, { color: palette.textTertiary }]}>
                      {DNSLogService.formatDuration(e.duration)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
            {log.response ? (
              <View style={[styles.responseBox, { backgroundColor: palette.solid }]}>
                <Text style={[styles.responseLabel, typography.caption1, { color: palette.accentTint }]}>
                  {t("components.dnsLogViewer.responseLabel")}
                </Text>
                <Text style={[typography.footnote, { color: palette.textPrimary }]}>
                  {log.response}
                </Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: LiquidGlassSpacing.sm },
  empty: { textAlign: "center", marginTop: LiquidGlassSpacing.huge },
  card: {
    borderRadius: LiquidGlassSpacing.sm,
    padding: LiquidGlassSpacing.sm,
    marginBottom: LiquidGlassSpacing.sm,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { flex: 1, marginRight: LiquidGlassSpacing.xs },
  duration: { fontVariant: ["tabular-nums"] },
  meta: { marginTop: LiquidGlassSpacing.xxs },
  entries: { marginTop: LiquidGlassSpacing.xs },
  entryRow: { flexDirection: "row", alignItems: "center", marginBottom: LiquidGlassSpacing.xxs },
  badge: {
    color: "#fff",
    paddingHorizontal: LiquidGlassSpacing.xxs,
    paddingVertical: LiquidGlassSpacing.xxs / 2,
    borderRadius: LiquidGlassSpacing.xxs,
    overflow: "hidden",
    marginRight: LiquidGlassSpacing.xxs,
  },
  icon: { width: 18, textAlign: "center" },
  entryText: { flex: 1 },
  entryDuration: {
    marginLeft: LiquidGlassSpacing.xxs,
    fontVariant: ["tabular-nums"],
  },
  responseBox: {
    marginTop: LiquidGlassSpacing.xs,
    borderRadius: LiquidGlassSpacing.xxs,
    padding: LiquidGlassSpacing.xs,
  },
  responseLabel: { marginBottom: LiquidGlassSpacing.xxs },
});

export default DNSLogViewer;
