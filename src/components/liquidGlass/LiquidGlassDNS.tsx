/**
 * Liquid Glass DNS-Specific Components
 * 
 * Specialized components for DNSChat's unique DNS-over-TXT functionality.
 * Builds on core UI components with DNS-aware features and visual indicators.
 * 
 * Components:
 * - LiquidGlassChatInterface: Complete chat interface with glass effects
 * - LiquidGlassDNSStatus: Real-time DNS connection status indicator
 * - LiquidGlassQueryLog: DNS query log with interactive entries
 * - LiquidGlassMethodBadge: DNS method indicator (Native, UDP, TCP, HTTPS)
 * - LiquidGlassConnectionIndicator: Network status with adaptive styling
 * - LiquidGlassServerSelector: DNS server selection interface
 * 
 * DNS Features:
 * - Real-time method fallback visualization
 * - Query timing and success/failure indicators
 * - Server status monitoring with glass effects
 * - Interactive DNS log entries with expandable details
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {
  LiquidGlassView,
  LiquidGlassButton,
  LiquidGlassChatBubble,
  LiquidGlassInput,
  LiquidGlassCard,
  LiquidGlassContainer,
  useLiquidGlassCapabilities,
  useAdaptiveGlassIntensity,
  type LiquidGlassProps,
} from './';

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

interface DNSMethod {
  name: 'Native' | 'UDP' | 'TCP' | 'HTTPS' | 'Mock';
  icon: string;
  priority: number;
  status: 'active' | 'available' | 'failed' | 'unavailable';
  timing?: number; // ms
  error?: string;
}

interface DNSQuery {
  id: string;
  message: string;
  method: DNSMethod['name'];
  timestamp: Date;
  duration: number; // ms
  status: 'success' | 'failed' | 'timeout';
  response?: string;
  error?: string;
  retries?: number;
}

interface DNSServer {
  name: string;
  address: string;
  type: 'cloudflare' | 'google' | 'quad9' | 'custom';
  status: 'online' | 'slow' | 'offline' | 'unknown';
  latency?: number; // ms
}

interface LiquidGlassChatInterfaceProps extends LiquidGlassProps {
  /** Chat messages */
  messages: Array<{
    id: string;
    content: string;
    type: 'user' | 'assistant' | 'system';
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
  }>;
  
  /** Input value */
  inputValue: string;
  
  /** Input change handler */
  onInputChange: (text: string) => void;
  
  /** Send message handler */
  onSendMessage: () => void;
  
  /** Current DNS status */
  dnsStatus: {
    isConnected: boolean;
    currentMethod: DNSMethod['name'];
    server: string;
    latency?: number;
  };
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Enable DNS status display */
  showDNSStatus?: boolean;
  
  /** Custom styling */
  style?: ViewStyle;
}

interface LiquidGlassDNSStatusProps extends LiquidGlassProps {
  /** Available DNS methods */
  methods: DNSMethod[];
  
  /** Current active method */
  activeMethod: DNSMethod['name'];
  
  /** DNS server info */
  server: DNSServer;
  
  /** Connection status */
  isConnected: boolean;
  
  /** Show detailed status */
  showDetails?: boolean;
  
  /** Status press handler */
  onPress?: () => void;
  
  /** Custom styling */
  style?: ViewStyle;
}

interface LiquidGlassQueryLogProps extends LiquidGlassProps {
  /** DNS query history */
  queries: DNSQuery[];
  
  /** Maximum queries to display */
  maxQueries?: number;
  
  /** Show query details */
  showDetails?: boolean;
  
  /** Query press handler */
  onQueryPress?: (query: DNSQuery) => void;
  
  /** Clear log handler */
  onClearLog?: () => void;
  
  /** Custom styling */
  style?: ViewStyle;
}

interface LiquidGlassMethodBadgeProps extends LiquidGlassProps {
  /** DNS method */
  method: DNSMethod;
  
  /** Badge size */
  size?: 'small' | 'medium' | 'large';
  
  /** Show timing */
  showTiming?: boolean;
  
  /** Badge press handler */
  onPress?: () => void;
  
  /** Custom styling */
  style?: ViewStyle;
}

interface LiquidGlassConnectionIndicatorProps extends LiquidGlassProps {
  /** Connection status */
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  
  /** Connection strength (0-1) */
  strength?: number;
  
  /** Show signal animation */
  animated?: boolean;
  
  /** Custom styling */
  style?: ViewStyle;
}

interface LiquidGlassServerSelectorProps extends LiquidGlassProps {
  /** Available DNS servers */
  servers: DNSServer[];
  
  /** Selected server */
  selectedServer: string;
  
  /** Server selection handler */
  onServerSelect: (server: DNSServer) => void;
  
  /** Custom server option */
  allowCustom?: boolean;
  
  /** Custom server handler */
  onCustomServer?: (address: string) => void;
  
  /** Custom styling */
  style?: ViewStyle;
}

// ==================================================================================
// LIQUID GLASS CHAT INTERFACE
// ==================================================================================

/**
 * Complete chat interface with DNS status integration and glass effects
 */
export const LiquidGlassChatInterface: React.FC<LiquidGlassChatInterfaceProps> = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  dnsStatus,
  isLoading = false,
  showDNSStatus = true,
  style,
  intensity = 'thin',
  containerStyle,
  ...glassProps
}) => {
  const colorScheme = useColorScheme();
  const { capabilities } = useLiquidGlassCapabilities();
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);
  
  const handleSend = useCallback(() => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage();
    }
  }, [inputValue, isLoading, onSendMessage]);
  
  return (
    <LiquidGlassContainer
      intensity={adaptiveIntensity}
      style="systemMaterial"
      spacing={0}
      direction="vertical"
      sensorAware={capabilities?.features.sensorAware}
      environmentalAdaptation={capabilities?.features.environmentalCues}
      containerStyle={[styles.chatInterface, containerStyle]}
      {...glassProps}
    >
      {/* DNS Status Header */}
      {showDNSStatus && (
        <LiquidGlassDNSStatus
          methods={[
            {
              name: dnsStatus.currentMethod,
              icon: '🌐',
              priority: 1,
              status: dnsStatus.isConnected ? 'active' : 'failed',
              timing: dnsStatus.latency,
            },
          ]}
          activeMethod={dnsStatus.currentMethod}
          server={{
            name: dnsStatus.server,
            address: dnsStatus.server,
            type: 'cloudflare',
            status: dnsStatus.isConnected ? 'online' : 'offline',
            latency: dnsStatus.latency,
          }}
          isConnected={dnsStatus.isConnected}
          style={styles.dnsStatusHeader}
        />
      )}
      
      {/* Message List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <LiquidGlassChatBubble
            key={message.id}
            message={message.content}
            type={message.type}
            status={message.status}
            timestamp={message.timestamp}
            showTimestamp={true}
            animateOnAppear={true}
          />
        ))}
        
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <LiquidGlassCard
              intensity="ultraThin"
              style="hudMaterial"
              padding={12}
            >
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>DNS Query in progress...</Text>
              </View>
            </LiquidGlassCard>
          </View>
        )}
      </ScrollView>
      
      {/* Input Area */}
      <View style={styles.inputArea}>
        <LiquidGlassInput
          value={inputValue}
          onChangeText={onInputChange}
          placeholder="Ask anything via DNS..."
          multiline={true}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          rightAction={
            <LiquidGlassButton
              title="Send"
              onPress={handleSend}
              variant="primary"
              size="small"
              disabled={!inputValue.trim() || isLoading}
              haptics={true}
            />
          }
          style={styles.messageInput}
        />
      </View>
    </LiquidGlassContainer>
  );
};

// ==================================================================================
// LIQUID GLASS DNS STATUS
// ==================================================================================

/**
 * Real-time DNS connection status with method indicators
 */
export const LiquidGlassDNSStatus: React.FC<LiquidGlassDNSStatusProps> = ({
  methods,
  activeMethod,
  server,
  isConnected,
  showDetails = false,
  onPress,
  style,
  intensity = 'ultraThin',
  containerStyle,
  ...glassProps
}) => {
  const colorScheme = useColorScheme();
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  const [expanded, setExpanded] = useState(showDetails);
  
  const statusColors = useMemo(() => {
    const isDark = colorScheme === 'dark';
    
    if (isConnected) {
      return {
        background: 'rgba(52, 199, 89, 0.1)',
        text: '#34C759',
        indicator: '#34C759',
      };
    } else {
      return {
        background: 'rgba(255, 59, 48, 0.1)',
        text: '#FF3B30',
        indicator: '#FF3B30',
      };
    }
  }, [isConnected, colorScheme]);
  
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      setExpanded(!expanded);
    }
  }, [onPress, expanded]);
  
  return (
    <Pressable onPress={handlePress} style={style}>
      <LiquidGlassView
        intensity={adaptiveIntensity}
        style="hudMaterial"
        sensorAware={false}
        containerStyle={[
          styles.dnsStatus,
          { backgroundColor: statusColors.background },
          containerStyle,
        ]}
        {...glassProps}
      >
        <View style={styles.dnsStatusContent}>
          {/* Connection Indicator */}
          <LiquidGlassConnectionIndicator
            status={isConnected ? 'connected' : 'disconnected'}
            strength={isConnected ? 1 : 0}
            animated={true}
            style={styles.connectionIndicator}
          />
          
          {/* Status Text */}
          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
            <Text style={styles.statusDetails}>
              {activeMethod} • {server.name}
              {server.latency && ` • ${server.latency}ms`}
            </Text>
          </View>
          
          {/* Method Badge */}
          <LiquidGlassMethodBadge
            method={methods.find(m => m.name === activeMethod) || methods[0]}
            size="small"
            showTiming={false}
          />
        </View>
        
        {/* Expanded Details */}
        {expanded && (
          <View style={styles.expandedDetails}>
            <Text style={styles.detailsTitle}>DNS Methods</Text>
            {methods.map((method) => (
              <LiquidGlassMethodBadge
                key={method.name}
                method={method}
                size="medium"
                showTiming={true}
                style={styles.methodDetail}
              />
            ))}
          </View>
        )}
      </LiquidGlassView>
    </Pressable>
  );
};

// ==================================================================================
// LIQUID GLASS QUERY LOG
// ==================================================================================

/**
 * Interactive DNS query log with expandable entries
 */
export const LiquidGlassQueryLog: React.FC<LiquidGlassQueryLogProps> = ({
  queries,
  maxQueries = 50,
  showDetails = false,
  onQueryPress,
  onClearLog,
  style,
  intensity = 'thin',
  containerStyle,
  ...glassProps
}) => {
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  const displayQueries = useMemo(() => 
    queries.slice(-maxQueries).reverse(), 
    [queries, maxQueries]
  );
  
  return (
    <LiquidGlassView
      intensity={adaptiveIntensity}
      style="systemThinMaterial"
      containerStyle={[styles.queryLog, containerStyle]}
      {...glassProps}
    >
      {/* Header */}
      <View style={styles.logHeader}>
        <Text style={styles.logTitle}>DNS Query Log</Text>
        {onClearLog && (
          <LiquidGlassButton
            title="Clear"
            onPress={onClearLog}
            variant="ghost"
            size="small"
          />
        )}
      </View>
      
      {/* Query List */}
      <ScrollView style={styles.logList} showsVerticalScrollIndicator={false}>
        {displayQueries.map((query) => (
          <QueryLogEntry
            key={query.id}
            query={query}
            showDetails={showDetails}
            onPress={() => onQueryPress?.(query)}
          />
        ))}
        
        {displayQueries.length === 0 && (
          <View style={styles.emptyLog}>
            <Text style={styles.emptyText}>No DNS queries yet</Text>
          </View>
        )}
      </ScrollView>
    </LiquidGlassView>
  );
};

// Helper component for query log entries
const QueryLogEntry: React.FC<{
  query: DNSQuery;
  showDetails: boolean;
  onPress?: () => void;
}> = ({ query, showDetails, onPress }) => {
  const colorScheme = useColorScheme();
  const [expanded, setExpanded] = useState(showDetails);
  
  const statusColor = useMemo(() => {
    switch (query.status) {
      case 'success': return '#34C759';
      case 'failed': return '#FF3B30';
      case 'timeout': return '#FF9500';
      default: return '#8E8E93';
    }
  }, [query.status]);
  
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      setExpanded(!expanded);
    }
  }, [onPress, expanded]);
  
  return (
    <Pressable onPress={handlePress} style={styles.logEntry}>
      <LiquidGlassCard
        intensity="ultraThin"
        style="hudMaterial"
        padding={12}
        containerStyle={styles.logEntryCard}
      >
        <View style={styles.logEntryHeader}>
          <LiquidGlassMethodBadge
            method={{
              name: query.method,
              icon: '📡',
              priority: 1,
              status: query.status === 'success' ? 'active' : 'failed',
              timing: query.duration,
            }}
            size="small"
            showTiming={true}
          />
          
          <View style={styles.logEntryInfo}>
            <Text style={styles.logEntryMessage} numberOfLines={1}>
              {query.message}
            </Text>
            <Text style={styles.logEntryTime}>
              {query.timestamp.toLocaleTimeString()}
            </Text>
          </View>
          
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
        
        {expanded && (
          <View style={styles.logEntryDetails}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: statusColor }]}>
              {query.status.toUpperCase()}
            </Text>
            
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{query.duration}ms</Text>
            
            {query.retries && (
              <>
                <Text style={styles.detailLabel}>Retries:</Text>
                <Text style={styles.detailValue}>{query.retries}</Text>
              </>
            )}
            
            {query.error && (
              <>
                <Text style={styles.detailLabel}>Error:</Text>
                <Text style={[styles.detailValue, { color: '#FF3B30' }]}>
                  {query.error}
                </Text>
              </>
            )}
          </View>
        )}
      </LiquidGlassCard>
    </Pressable>
  );
};

// ==================================================================================
// LIQUID GLASS METHOD BADGE
// ==================================================================================

/**
 * DNS method indicator with status and timing
 */
export const LiquidGlassMethodBadge: React.FC<LiquidGlassMethodBadgeProps> = ({
  method,
  size = 'medium',
  showTiming = false,
  onPress,
  style,
  intensity = 'ultraThin',
  containerStyle,
  ...glassProps
}) => {
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  
  const badgeConfig = useMemo(() => {
    const baseConfig = {
      small: { padding: 4, fontSize: 10 },
      medium: { padding: 6, fontSize: 12 },
      large: { padding: 8, fontSize: 14 },
    }[size];
    
    const statusConfig = {
      active: { color: '#34C759', background: 'rgba(52, 199, 89, 0.1)' },
      available: { color: '#007AFF', background: 'rgba(0, 122, 255, 0.1)' },
      failed: { color: '#FF3B30', background: 'rgba(255, 59, 48, 0.1)' },
      unavailable: { color: '#8E8E93', background: 'rgba(142, 142, 147, 0.1)' },
    }[method.status];
    
    return { ...baseConfig, ...statusConfig };
  }, [size, method.status]);
  
  const BadgeContent = () => (
    <LiquidGlassView
      intensity={adaptiveIntensity}
      style="hudMaterial"
      containerStyle={[
        styles.methodBadge,
        {
          padding: badgeConfig.padding,
          backgroundColor: badgeConfig.background,
        },
        containerStyle,
      ]}
      {...glassProps}
    >
      <Text style={[styles.methodText, { 
        fontSize: badgeConfig.fontSize,
        color: badgeConfig.color,
      }]}>
        {method.name}
      </Text>
      
      {showTiming && method.timing && (
        <Text style={[styles.timingText, {
          fontSize: badgeConfig.fontSize - 1,
          color: badgeConfig.color,
        }]}>
          {method.timing}ms
        </Text>
      )}
    </LiquidGlassView>
  );
  
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={style}>
        <BadgeContent />
      </Pressable>
    );
  }
  
  return <BadgeContent />;
};

// ==================================================================================
// LIQUID GLASS CONNECTION INDICATOR
// ==================================================================================

/**
 * Animated connection status indicator
 */
export const LiquidGlassConnectionIndicator: React.FC<LiquidGlassConnectionIndicatorProps> = ({
  status,
  strength = 1,
  animated = true,
  style,
  intensity = 'ultraThin',
  containerStyle,
  ...glassProps
}) => {
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation for connecting state
  useEffect(() => {
    if (animated && status === 'connecting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [animated, status, pulseAnim]);
  
  const indicatorConfig = useMemo(() => {
    switch (status) {
      case 'connected':
        return { color: '#34C759', icon: '●' };
      case 'connecting':
        return { color: '#FF9500', icon: '◐' };
      case 'disconnected':
        return { color: '#8E8E93', icon: '○' };
      case 'error':
        return { color: '#FF3B30', icon: '✕' };
      default:
        return { color: '#8E8E93', icon: '○' };
    }
  }, [status]);
  
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: pulseAnim,
        },
      ]}
    >
      <LiquidGlassView
        intensity={adaptiveIntensity}
        style="hudMaterial"
        containerStyle={[styles.connectionIndicator, containerStyle]}
        {...glassProps}
      >
        <Text style={[styles.indicatorIcon, { color: indicatorConfig.color }]}>
          {indicatorConfig.icon}
        </Text>
      </LiquidGlassView>
    </Animated.View>
  );
};

// ==================================================================================
// LIQUID GLASS SERVER SELECTOR
// ==================================================================================

/**
 * DNS server selection interface with status indicators
 */
export const LiquidGlassServerSelector: React.FC<LiquidGlassServerSelectorProps> = ({
  servers,
  selectedServer,
  onServerSelect,
  allowCustom = false,
  onCustomServer,
  style,
  intensity = 'thin',
  containerStyle,
  ...glassProps
}) => {
  const adaptiveIntensity = useAdaptiveGlassIntensity(intensity);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  
  const handleCustomSubmit = useCallback(() => {
    if (customAddress.trim() && onCustomServer) {
      onCustomServer(customAddress.trim());
      setCustomAddress('');
      setShowCustomInput(false);
    }
  }, [customAddress, onCustomServer]);
  
  return (
    <LiquidGlassView
      intensity={adaptiveIntensity}
      style="systemThinMaterial"
      containerStyle={[styles.serverSelector, containerStyle]}
      {...glassProps}
    >
      <Text style={styles.selectorTitle}>DNS Server</Text>
      
      {servers.map((server) => (
        <Pressable
          key={server.address}
          onPress={() => onServerSelect(server)}
          style={styles.serverOption}
        >
          <LiquidGlassCard
            intensity="ultraThin"
            style="hudMaterial"
            padding={12}
            containerStyle={[
              styles.serverCard,
              selectedServer === server.address && styles.selectedServer,
            ]}
          >
            <View style={styles.serverInfo}>
              <View style={styles.serverDetails}>
                <Text style={styles.serverName}>{server.name}</Text>
                <Text style={styles.serverAddress}>{server.address}</Text>
              </View>
              
              <LiquidGlassConnectionIndicator
                status={
                  server.status === 'online' ? 'connected' :
                  server.status === 'slow' ? 'connecting' :
                  server.status === 'offline' ? 'error' : 'disconnected'
                }
                animated={false}
              />
              
              {server.latency && (
                <Text style={styles.latencyText}>{server.latency}ms</Text>
              )}
            </View>
          </LiquidGlassCard>
        </Pressable>
      ))}
      
      {allowCustom && (
        <>
          <LiquidGlassButton
            title="Custom Server"
            onPress={() => setShowCustomInput(!showCustomInput)}
            variant="ghost"
            size="small"
            style={styles.customButton}
          />
          
          {showCustomInput && (
            <LiquidGlassInput
              value={customAddress}
              onChangeText={setCustomAddress}
              placeholder="Enter DNS server address"
              onSubmitEditing={handleCustomSubmit}
              returnKeyType="done"
              rightAction={
                <LiquidGlassButton
                  title="Add"
                  onPress={handleCustomSubmit}
                  variant="primary"
                  size="small"
                />
              }
              style={styles.customInput}
            />
          )}
        </>
      )}
    </LiquidGlassView>
  );
};

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  // Chat Interface Styles
  chatInterface: {
    flex: 1,
    borderRadius: 0,
  },
  
  dnsStatusHeader: {
    borderRadius: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  
  messageList: {
    flex: 1,
  },
  
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  
  loadingIndicator: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  inputArea: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  },
  
  messageInput: {
    // Custom input styling handled by LiquidGlassInput
  },
  
  // DNS Status Styles
  dnsStatus: {
    padding: 12,
    borderRadius: 8,
  },
  
  dnsStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  connectionIndicator: {
    marginRight: 8,
  },
  
  statusInfo: {
    flex: 1,
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  statusDetails: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  },
  
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  
  methodDetail: {
    marginBottom: 4,
  },
  
  // Query Log Styles
  queryLog: {
    maxHeight: 300,
    borderRadius: 12,
  },
  
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  logList: {
    flex: 1,
  },
  
  emptyLog: {
    padding: 32,
    alignItems: 'center',
  },
  
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  
  logEntry: {
    marginHorizontal: 12,
    marginVertical: 4,
  },
  
  logEntryCard: {
    borderRadius: 8,
  },
  
  logEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  logEntryInfo: {
    flex: 1,
    marginLeft: 8,
  },
  
  logEntryMessage: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  logEntryTime: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  
  logEntryDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  },
  
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 4,
  },
  
  detailValue: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // Method Badge Styles
  methodBadge: {
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  
  methodText: {
    fontWeight: '600',
  },
  
  timingText: {
    marginLeft: 4,
    opacity: 0.8,
  },
  
  // Connection Indicator Styles
  connectionIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  indicatorIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Server Selector Styles
  serverSelector: {
    padding: 16,
    borderRadius: 12,
  },
  
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  serverOption: {
    marginBottom: 8,
  },
  
  serverCard: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  selectedServer: {
    borderColor: '#007AFF',
  },
  
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  serverDetails: {
    flex: 1,
  },
  
  serverName: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  serverAddress: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  
  latencyText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  
  customButton: {
    marginTop: 8,
  },
  
  customInput: {
    marginTop: 8,
  },
});

// ==================================================================================
// EXPORTS
// ==================================================================================

export {
  LiquidGlassChatInterface,
  LiquidGlassDNSStatus,
  LiquidGlassQueryLog,
  LiquidGlassMethodBadge,
  LiquidGlassConnectionIndicator,
  LiquidGlassServerSelector,
};

export type {
  LiquidGlassChatInterfaceProps,
  LiquidGlassDNSStatusProps,
  LiquidGlassQueryLogProps,
  LiquidGlassMethodBadgeProps,
  LiquidGlassConnectionIndicatorProps,
  LiquidGlassServerSelectorProps,
  DNSMethod,
  DNSQuery,
  DNSServer,
};