import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DNSLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  method: 'native' | 'udp' | 'tcp' | 'https' | 'mock';
  status: 'attempt' | 'success' | 'failure' | 'fallback';
  details?: string;
  error?: string;
  duration?: number;
  // Debug mode fields
  debugData?: {
    rawRequest?: string;
    rawResponse?: string;
    dnsPacket?: any;
    networkInfo?: {
      server: string;
      port: number;
      protocol: string;
    };
    retryAttempt?: number;
    headers?: Record<string, string>;
    stackTrace?: string;
  };
}

export interface DNSQueryLog {
  id: string;
  query: string;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  finalStatus: 'pending' | 'success' | 'failure';
  finalMethod?: 'native' | 'udp' | 'tcp' | 'https' | 'mock';
  response?: string;
  entries: DNSLogEntry[];
  // Debug mode fields
  debugContext?: {
    chatId?: string;
    messageId?: string;
    userId?: string;
    appVersion?: string;
    platform?: string;
    deviceInfo?: {
      model: string;
      os: string;
      version: string;
    };
    settingsSnapshot?: {
      dnsServer: string;
      preferDnsOverHttps: boolean;
      dnsMethodPreference: string;
      debugMode: boolean;
    };
    conversationHistory?: Array<{
      role: 'user' | 'assistant';
      message: string;
      timestamp: Date;
    }>;
  };
}

const STORAGE_KEY = '@dns_query_logs';
const MAX_LOGS = 100;
const MAX_DEBUG_STRING_LENGTH = 10000; // 10KB max for any debug string
const MAX_CONVERSATION_HISTORY = 10; // Keep only last 10 messages

export class DNSLogService {
  private static currentQueryLog: DNSQueryLog | null = null;
  private static queryLogs: DNSQueryLog[] = [];
  private static listeners: Set<(logs: DNSQueryLog[]) => void> = new Set();
  private static debugMode: boolean = false;

  static async initialize() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.queryLogs = parsed.map((log: any) => ({
          ...log,
          startTime: new Date(log.startTime),
          endTime: log.endTime ? new Date(log.endTime) : undefined,
          entries: log.entries.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          })),
        }));
      }
    } catch (error) {
      console.error('Failed to load DNS logs:', error);
      this.queryLogs = [];
    }
  }

  static setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
    console.log(`🐛 DNSLogService debug mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  static getDebugMode(): boolean {
    return this.debugMode;
  }

  private static truncateString(str: string | undefined, maxLength: number = MAX_DEBUG_STRING_LENGTH): string | undefined {
    if (!str) return str;
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '... [TRUNCATED]';
  }

  private static sanitizeDebugData(debugData: DNSLogEntry['debugData']): DNSLogEntry['debugData'] {
    if (!debugData) return debugData;
    
    // Safely stringify and truncate dnsPacket
    let sanitizedPacket = undefined;
    if (debugData.dnsPacket) {
      try {
        // Handle circular references with a replacer
        const seen = new WeakSet();
        const packetStr = JSON.stringify(debugData.dnsPacket, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        }, 2);
        
        // If too large, just store a truncated string representation
        sanitizedPacket = packetStr.length > 1000 
          ? { truncated: true, preview: packetStr.substring(0, 1000) + '...' }
          : debugData.dnsPacket;
      } catch (e) {
        // Handle any serialization errors
        sanitizedPacket = { error: 'Could not serialize DNS packet', type: typeof debugData.dnsPacket };
      }
    }
    
    return {
      ...debugData,
      rawRequest: this.truncateString(debugData.rawRequest),
      rawResponse: this.truncateString(debugData.rawResponse),
      stackTrace: this.truncateString(debugData.stackTrace, 5000),
      dnsPacket: sanitizedPacket,
    };
  }

  private static sanitizeDebugContext(debugContext: DNSQueryLog['debugContext']): DNSQueryLog['debugContext'] {
    if (!debugContext) return debugContext;
    
    return {
      ...debugContext,
      // Limit conversation history safely
      conversationHistory: debugContext.conversationHistory 
        ? debugContext.conversationHistory.slice(-MAX_CONVERSATION_HISTORY).map(msg => ({
            ...msg,
            message: this.truncateString(msg.message, 500) || '',
          }))
        : undefined,
    };
  }

  static startQuery(query: string, debugContext?: DNSQueryLog['debugContext']): string {
    const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentQueryLog = {
      id: queryId,
      query,
      startTime: new Date(),
      finalStatus: 'pending',
      entries: [],
      ...(this.debugMode && debugContext ? { debugContext: this.sanitizeDebugContext(debugContext) } : {}),
    };

    this.addLog({
      id: `${queryId}-start`,
      timestamp: new Date(),
      message: `Starting DNS query: "${query}"`,
      method: 'native',
      status: 'attempt',
    });

    return queryId;
  }

  static addLog(entry: DNSLogEntry) {
    if (!this.currentQueryLog) return;

    this.currentQueryLog.entries.push(entry);
    this.notifyListeners();
  }

  static logMethodAttempt(
    method: DNSLogEntry['method'],
    details?: string,
    debugData?: DNSLogEntry['debugData']
  ) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: `${this.currentQueryLog.id}-${method}-${Date.now()}`,
      timestamp: new Date(),
      message: `Attempting ${method.toUpperCase()} DNS query`,
      method,
      status: 'attempt',
      details,
      // Only include debug data if debug mode is enabled, and sanitize it
      ...(this.debugMode && debugData ? { debugData: this.sanitizeDebugData(debugData) } : {}),
    };

    this.addLog(entry);
  }

  static logMethodSuccess(
    method: DNSLogEntry['method'],
    duration: number,
    details?: string,
    debugData?: DNSLogEntry['debugData']
  ) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: `${this.currentQueryLog.id}-${method}-success-${Date.now()}`,
      timestamp: new Date(),
      message: `${method.toUpperCase()} query successful`,
      method,
      status: 'success',
      details,
      duration,
      ...(this.debugMode && debugData ? { debugData: this.sanitizeDebugData(debugData) } : {}),
    };

    this.addLog(entry);
  }

  static logMethodFailure(
    method: DNSLogEntry['method'],
    error: string,
    duration?: number,
    debugData?: DNSLogEntry['debugData']
  ) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: `${this.currentQueryLog.id}-${method}-failure-${Date.now()}`,
      timestamp: new Date(),
      message: `${method.toUpperCase()} query failed`,
      method,
      status: 'failure',
      error,
      duration,
      ...(this.debugMode && debugData ? { debugData } : {}),
    };

    this.addLog(entry);
  }

  static logFallback(
    fromMethod: DNSLogEntry['method'],
    toMethod: DNSLogEntry['method']
  ) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: `${this.currentQueryLog.id}-fallback-${Date.now()}`,
      timestamp: new Date(),
      message: `Falling back from ${fromMethod.toUpperCase()} to ${toMethod.toUpperCase()}`,
      method: fromMethod,
      status: 'fallback',
      details: `Next attempt: ${toMethod}`,
    };

    this.addLog(entry);
  }

  static async endQuery(
    success: boolean,
    response?: string,
    finalMethod?: DNSLogEntry['method']
  ) {
    if (!this.currentQueryLog) return;

    this.currentQueryLog.endTime = new Date();
    this.currentQueryLog.totalDuration =
      this.currentQueryLog.endTime.getTime() -
      this.currentQueryLog.startTime.getTime();
    this.currentQueryLog.finalStatus = success ? 'success' : 'failure';
    this.currentQueryLog.finalMethod = finalMethod;
    this.currentQueryLog.response = response;

    const finalEntry: DNSLogEntry = {
      id: `${this.currentQueryLog.id}-end`,
      timestamp: new Date(),
      message: success
        ? `Query completed successfully via ${finalMethod?.toUpperCase()}`
        : 'Query failed after all attempts',
      method: finalMethod || 'mock',
      status: success ? 'success' : 'failure',
      duration: this.currentQueryLog.totalDuration,
    };

    this.addLog(finalEntry);

    // Add to persistent storage
    this.queryLogs.unshift({ ...this.currentQueryLog });
    
    // Limit the number of stored logs
    if (this.queryLogs.length > MAX_LOGS) {
      this.queryLogs = this.queryLogs.slice(0, MAX_LOGS);
    }

    await this.saveLogs();
    this.currentQueryLog = null;
    this.notifyListeners();
  }

  static async saveLogs() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queryLogs));
    } catch (error) {
      console.error('Failed to save DNS logs:', error);
    }
  }

  static getLogs(): DNSQueryLog[] {
    const logs = [...this.queryLogs];
    
    // Include current query if in progress
    if (this.currentQueryLog) {
      logs.unshift({ ...this.currentQueryLog });
    }
    
    return logs;
  }

  static getCurrentQueryLog(): DNSQueryLog | null {
    return this.currentQueryLog;
  }

  static async clearLogs() {
    this.queryLogs = [];
    this.currentQueryLog = null;
    await AsyncStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }

  static subscribe(listener: (logs: DNSQueryLog[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notifyListeners() {
    const logs = this.getLogs();
    this.listeners.forEach(listener => listener(logs));
  }

  static formatDuration(ms: number | undefined): string {
    if (ms === undefined || ms === null || isNaN(ms)) {
      return '—';
    }
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  static getMethodColor(method: DNSLogEntry['method'] | undefined): string {
    if (!method) return '#757575';
    
    const colors = {
      native: '#4CAF50',
      udp: '#2196F3',
      tcp: '#FF9800',
      https: '#9C27B0',
      mock: '#607D8B',
    };
    return colors[method] || '#757575';
  }

  static getStatusIcon(status: DNSLogEntry['status'] | undefined): string {
    if (!status) return '•';
    
    const icons = {
      attempt: '🔄',
      success: '✅',
      failure: '❌',
      fallback: '↩️',
    };
    return icons[status] || '•';
  }

  static exportLogAsJSON(log: DNSQueryLog): string {
    try {
      // Create a comprehensive export object
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          exportVersion: '1.0.0',
          logId: log.id,
        },
        query: {
          text: log.query,
          startTime: log.startTime,
          endTime: log.endTime,
          totalDuration: log.totalDuration,
          finalStatus: log.finalStatus,
          finalMethod: log.finalMethod,
        },
        response: log.response,
        debugContext: log.debugContext,
        timeline: log.entries.map(entry => ({
          timestamp: entry.timestamp,
          method: entry.method,
          status: entry.status,
          message: entry.message,
          duration: entry.duration,
          details: entry.details,
          error: entry.error,
          ...(entry.debugData ? { debugData: entry.debugData } : {}),
        })),
        statistics: {
          totalEntries: log.entries.length,
          methodsAttempted: [...new Set(log.entries.map(e => e.method).filter(Boolean))],
          successCount: log.entries.filter(e => e.status === 'success').length,
          failureCount: log.entries.filter(e => e.status === 'failure').length,
          fallbackCount: log.entries.filter(e => e.status === 'fallback').length,
        },
      };

      // Use a replacer to handle circular references
      const seen = new WeakSet();
      return JSON.stringify(exportData, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        return value;
      }, 2);
    } catch (error) {
      console.error('Failed to export log as JSON:', error);
      // Return a minimal error export
      return JSON.stringify({
        error: 'Export failed',
        logId: log.id,
        query: log.query,
        timestamp: new Date().toISOString(),
      }, null, 2);
    }
  }

  static generateExportFilename(log: DNSQueryLog): string {
    const date = new Date(log.startTime);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    const querySnippet = log.query.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
    return `dns-log-${dateStr}-${timeStr}-${querySnippet}.json`;
  }
}