import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import {
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassContainer,
  LiquidGlassChatBubble,
  LiquidGlassInput,
} from "./LiquidGlassUI";
import {
  LiquidGlassView,
  useLiquidGlassCapabilities,
  useAdaptiveGlassIntensity,
  type LiquidGlassProps,
} from "./LiquidGlassFallback";

export interface DNSMethod {
  name: "Native" | "UDP" | "TCP" | "HTTPS" | "Mock";
  icon: string;
  priority: number;
  status: "active" | "available" | "failed" | "unavailable";
  timing?: number;
  error?: string;
}

export interface DNSQuery {
  id: string;
  message: string;
  method: DNSMethod["name"];
  timestamp: Date;
  duration: number;
  status: "success" | "failed" | "timeout";
  retries?: number;
  error?: string;
}

export interface DNSServer {
  name: string;
  address: string;
  type: "cloudflare" | "google" | "quad9" | "custom";
  status: "online" | "slow" | "offline" | "unknown";
  latency?: number;
}

export interface LiquidGlassChatInterfaceProps extends LiquidGlassProps {
  messages: Array<{
    id: string;
    content: string;
    type: "user" | "assistant" | "system";
    timestamp: Date;
    status?: "sending" | "sent" | "error";
  }>;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  dnsStatus: {
    isConnected: boolean;
    currentMethod: DNSMethod["name"];
    server: string;
    latency?: number;
  };
  isLoading?: boolean;
  showDNSStatus?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface LiquidGlassDNSStatusProps extends LiquidGlassProps {
  methods: DNSMethod[];
  activeMethod: DNSMethod["name"];
  server: DNSServer;
  isConnected: boolean;
  showDetails?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface LiquidGlassQueryLogProps extends LiquidGlassProps {
  queries: DNSQuery[];
  maxQueries?: number;
  showDetails?: boolean;
  onQueryPress?: (query: DNSQuery) => void;
  onClearLog?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface LiquidGlassMethodBadgeProps extends LiquidGlassProps {
  method: DNSMethod;
  size?: "small" | "medium" | "large";
  showTiming?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface LiquidGlassConnectionIndicatorProps extends LiquidGlassProps {
  status: "connected" | "connecting" | "disconnected" | "error";
  strength?: number;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface LiquidGlassServerSelectorProps extends LiquidGlassProps {
  servers: DNSServer[];
  selectedServer: string;
  onServerSelect: (server: DNSServer) => void;
  allowCustom?: boolean;
  onCustomServer?: (address: string) => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const statusColors: Record<LiquidGlassConnectionIndicatorProps["status"], string> = {
  connected: "#34C759",
  connecting: "#FFCC00",
  disconnected: "#FF453A",
  error: "#FF453A",
};

export const LiquidGlassDNSStatus: React.FC<LiquidGlassDNSStatusProps> = ({
  methods,
  activeMethod,
  server,
  isConnected,
  showDetails = false,
  onPress,
  style,
  children,
  ...rest
}) => {
  const { supportsSwiftUIGlass } = useLiquidGlassCapabilities();
  const indicatorColor = isConnected ? "#34C759" : "#FF453A";

  return (
    <LiquidGlassCard
      {...rest}
      containerStyle={[styles.statusCard, style]}
      intensity={supportsSwiftUIGlass ? "regular" : "thin"}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.statusHeader}
      >
        <View style={styles.statusIndicator}>
          <View
            style={[styles.statusDot, { backgroundColor: indicatorColor }]}
          />
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>{server.name}</Text>
          <Text style={styles.statusSubLabel}>
            {activeMethod} • {server.address}
          </Text>
        </View>
        <Text style={styles.statusBadge}>{isConnected ? "ONLINE" : "OFFLINE"}</Text>
      </Pressable>
      {showDetails ? (
        <View style={styles.statusDetails}>
          {methods.map((method) => (
            <LiquidGlassMethodBadge
              key={method.name}
              method={method}
              size="small"
              showTiming
              style={styles.methodBadge}
            />
          ))}
        </View>
      ) : null}
      {children}
    </LiquidGlassCard>
  );
};

export const LiquidGlassMethodBadge: React.FC<LiquidGlassMethodBadgeProps> = ({
  method,
  size = "medium",
  showTiming = false,
  onPress,
  style,
  children,
  ...rest
}) => {
  const padding = size === "large" ? 10 : size === "small" ? 4 : 6;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={[styles.methodContainer, { padding }, style]}
    >
      <Text style={styles.methodIcon}>{method.icon}</Text>
      <Text style={styles.methodLabel}>{method.name}</Text>
      {showTiming && method.timing != null ? (
        <Text style={styles.methodTiming}>{method.timing}ms</Text>
      ) : null}
      {children}
    </Pressable>
  );
};

export const LiquidGlassConnectionIndicator: React.FC<
  LiquidGlassConnectionIndicatorProps
> = ({ status, strength = 1, style, children, ...rest }) => (
  <LiquidGlassView
    {...rest}
    intensity="thin"
    containerStyle={[styles.connectionContainer, style]}
  >
    <Text style={[styles.connectionIcon, { color: statusColors[status] }]}>•</Text>
    <Text style={styles.connectionLabel}>{status.toUpperCase()}</Text>
    <View style={styles.connectionStrength}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.connectionBar,
            {
              opacity: index < Math.ceil(strength * 3) ? 1 : 0.2,
            },
          ]}
        />
      ))}
    </View>
    {children}
  </LiquidGlassView>
);

export const LiquidGlassQueryLog: React.FC<LiquidGlassQueryLogProps> = ({
  queries,
  maxQueries = 25,
  showDetails = false,
  onQueryPress,
  onClearLog,
  style,
  children,
  intensity,
  ...rest
}) => {
  const limitedQueries = queries.slice(-maxQueries).reverse();
  const glassIntensity = useAdaptiveGlassIntensity(intensity ?? "thin");

  return (
    <LiquidGlassContainer
      {...rest}
      intensity={glassIntensity}
      spacing={12}
      containerStyle={[styles.logContainer, style]}
    >
      <View style={styles.logHeader}>
        <Text style={styles.logTitle}>DNS Queries</Text>
        {onClearLog ? (
          <LiquidGlassButton title="Clear" onPress={onClearLog} />
        ) : null}
      </View>
      <ScrollView style={styles.logList}>
        {limitedQueries.length === 0 ? (
          <View style={styles.logEmptyState}>
            <ActivityIndicator />
            <Text style={styles.logEmptyLabel}>No queries yet</Text>
          </View>
        ) : (
          limitedQueries.map((query) => (
            <Pressable
              key={query.id}
              accessibilityRole={onQueryPress ? "button" : undefined}
              onPress={onQueryPress ? () => onQueryPress(query) : undefined}
              style={styles.logEntry}
            >
              <View style={styles.logEntryHeader}>
                <Text style={styles.logEntryMethod}>{query.method}</Text>
                <Text style={styles.logEntryMeta}>{query.duration}ms</Text>
              </View>
              <Text style={styles.logEntryMessage} numberOfLines={showDetails ? 3 : 1}>
                {query.message}
              </Text>
              <Text style={styles.logEntryStatus}>{query.status}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
      {children}
    </LiquidGlassContainer>
  );
};

export const LiquidGlassServerSelector: React.FC<
  LiquidGlassServerSelectorProps
> = ({ servers, selectedServer, onServerSelect, allowCustom = false, style, children, ...rest }) => (
  <LiquidGlassContainer
    {...rest}
    intensity="thin"
    spacing={10}
    containerStyle={[styles.selectorContainer, style]}
  >
    {servers.map((server) => {
      const selected = selectedServer === server.address;
      return (
        <Pressable
          key={server.address}
          accessibilityRole="button"
          onPress={() => onServerSelect(server)}
          style={[styles.selectorRow, selected && styles.selectorRowSelected]}
        >
          <View style={styles.selectorDot}>
            {selected ? <View style={styles.selectorDotInner} /> : null}
          </View>
          <View style={styles.selectorInfo}>
            <Text style={styles.selectorName}>{server.name}</Text>
            <Text style={styles.selectorAddress}>{server.address}</Text>
          </View>
        </Pressable>
      );
    })}
    {allowCustom ? (
      <LiquidGlassButton title="Use Custom Server" onPress={() => rest.onCustomServer?.(selectedServer)} />
    ) : null}
    {children}
  </LiquidGlassContainer>
);

export const LiquidGlassChatInterface: React.FC<
  LiquidGlassChatInterfaceProps
> = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  dnsStatus,
  isLoading = false,
  showDNSStatus = true,
  style,
  children,
  ...rest
}) => (
  <LiquidGlassContainer
    {...rest}
    intensity="regular"
    containerStyle={[styles.chatContainer, style]}
    spacing={16}
  >
    {showDNSStatus ? (
      <LiquidGlassDNSStatus
        methods={[
          {
            name: dnsStatus.currentMethod,
            icon: "🌐",
            priority: 1,
            status: dnsStatus.isConnected ? "active" : "failed",
            timing: dnsStatus.latency,
          },
        ]}
        activeMethod={dnsStatus.currentMethod}
        server={{
          name: dnsStatus.server,
          address: dnsStatus.server,
          type: "cloudflare",
          status: dnsStatus.isConnected ? "online" : "offline",
          latency: dnsStatus.latency,
        }}
        isConnected={dnsStatus.isConnected}
      />
    ) : null}

    <View style={styles.chatList}>
      <ScrollView>
        {messages.map((message) => (
          <LiquidGlassChatBubble
            key={message.id}
            role={message.type}
            message={message.content}
            timestamp={message.timestamp.toLocaleTimeString()}
            highlight={message.status === "sending"}
            style={styles.chatBubbleItem}
          />
        ))}
      </ScrollView>
    </View>

    <View style={styles.chatInputRow}>
      <LiquidGlassInput
        value={inputValue}
        onChangeText={onInputChange}
        placeholder="Ask me anything..."
        editable={!isLoading}
        style={styles.chatInput}
      />
      <LiquidGlassButton
        title={isLoading ? "…" : "Send"}
        onPress={onSendMessage}
        disabled={isLoading || inputValue.trim().length === 0}
      />
    </View>
    {children}
  </LiquidGlassContainer>
);

const styles = StyleSheet.create({
  statusCard: {
    gap: 12,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontWeight: "600",
  },
  statusSubLabel: {
    opacity: 0.6,
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
  },
  statusDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  methodContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },
  methodIcon: {
    fontSize: 16,
  },
  methodLabel: {
    fontWeight: "600",
  },
  methodTiming: {
    fontSize: 12,
    opacity: 0.6,
  },
  methodBadge: {
    marginRight: 8,
  },
  connectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  connectionIcon: {
    fontSize: 20,
  },
  connectionLabel: {
    fontWeight: "600",
  },
  connectionStrength: {
    flexDirection: "row",
    gap: 4,
  },
  connectionBar: {
    width: 4,
    height: 10,
    borderRadius: 2,
    backgroundColor: "currentColor",
  },
  logContainer: {
    maxHeight: 240,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logTitle: {
    fontWeight: "600",
  },
  logList: {
    marginTop: 8,
  },
  logEmptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  logEmptyLabel: {
    opacity: 0.6,
  },
  logEntry: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  logEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logEntryMethod: {
    fontWeight: "600",
  },
  logEntryMeta: {
    opacity: 0.6,
  },
  logEntryMessage: {
    marginTop: 4,
  },
  logEntryStatus: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
  },
  selectorContainer: {
    width: "100%",
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  selectorRowSelected: {
    borderWidth: 1,
    borderColor: "rgba(0,122,255,0.5)",
  },
  selectorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectorDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  selectorInfo: {
    flex: 1,
  },
  selectorName: {
    fontWeight: "600",
  },
  selectorAddress: {
    opacity: 0.6,
  },
  chatContainer: {
    width: "100%",
  },
  chatList: {
    flexGrow: 1,
  },
  chatBubbleItem: {
    marginBottom: 12,
  },
  chatInputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
  },
});
