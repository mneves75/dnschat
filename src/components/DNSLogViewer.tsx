import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { DNSLogService, DNSQueryLog } from "../services/dnsLogService";
import { useTranslation } from "../i18n";

interface DNSLogViewerProps {
  maxEntries?: number;
}

/**
 * Simple developer log viewer for DNS query attempts and outcomes.
 * Not wired into navigation by default; import where useful in dev.
 */
export const DNSLogViewer: React.FC<DNSLogViewerProps> = ({
  maxEntries = 20,
}) => {
  const [logs, setLogs] = useState<DNSQueryLog[]>(DNSLogService.getLogs());
  const { t } = useTranslation();

  useEffect(() => {
    const unsub = DNSLogService.subscribe(setLogs);
    return () => unsub();
  }, []);

  const display = logs.slice(0, maxEntries);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {display.length === 0 ? (
        <Text style={styles.empty}>{t("components.dnsLogViewer.empty")}</Text>
      ) : (
        display.map((log) => (
          <View key={log.id} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{log.query}</Text>
              <Text style={styles.duration}>
                {DNSLogService.formatDuration(log.totalDuration)}
              </Text>
            </View>
            <Text style={styles.meta}>
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
                      {
                        backgroundColor: DNSLogService.getMethodColor(e.method),
                      },
                    ]}
                  >
                    {e.method.toUpperCase()}
                  </Text>
                  <Text style={styles.icon}>
                    {DNSLogService.getStatusIcon(e.status)}
                  </Text>
                  <Text style={styles.entryText}>{e.message}</Text>
                  {typeof e.duration === "number" && (
                    <Text style={styles.entryDuration}>
                      {DNSLogService.formatDuration(e.duration)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
            {log.response ? (
              <View style={styles.responseBox}>
                <Text style={styles.responseLabel}>
                  {t("components.dnsLogViewer.responseLabel")}
                </Text>
                <Text style={styles.response}>{log.response}</Text>
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
  content: { padding: 12 },
  empty: { color: "#777", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderColor: "#222",
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "#fff", fontWeight: "600", flex: 1, marginRight: 8 },
  duration: { color: "#aaa", fontVariant: ["tabular-nums"] },
  meta: { color: "#aaa", fontSize: 12, marginTop: 2 },
  entries: { marginTop: 8 },
  entryRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  badge: {
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    fontSize: 11,
    marginRight: 6,
  },
  icon: { width: 18, textAlign: "center" },
  entryText: { color: "#ddd", flex: 1 },
  entryDuration: {
    color: "#888",
    marginLeft: 6,
    fontVariant: ["tabular-nums"],
    fontSize: 12,
  },
  responseBox: {
    marginTop: 8,
    backgroundColor: "#0b0b0b",
    borderRadius: 6,
    padding: 8,
  },
  responseLabel: { color: "#8ab4f8", fontSize: 12, marginBottom: 4 },
  response: { color: "#dcdcdc" },
});

export default DNSLogViewer;
