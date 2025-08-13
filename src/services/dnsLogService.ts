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
}

const STORAGE_KEY = '@dns_query_logs';
const MAX_LOGS = 100;

export class DNSLogService {
  private static currentQueryLog: DNSQueryLog | null = null;
  private static queryLogs: DNSQueryLog[] = [];
  private static listeners: Set<(logs: DNSQueryLog[]) => void> = new Set();

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

  static startQuery(query: string): string {
    const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentQueryLog = {
      id: queryId,
      query,
      startTime: new Date(),
      finalStatus: 'pending',
      entries: [],
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
    details?: string
  ) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: `${this.currentQueryLog.id}-${method}-${Date.now()}`,
      timestamp: new Date(),
      message: `Attempting ${method.toUpperCase()} DNS query`,
      method,
      status: 'attempt',
      details,
    };

    this.addLog(entry);
  }

  static logMethodSuccess(
    method: DNSLogEntry['method'],
    duration: number,
    details?: string
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
    };

    this.addLog(entry);
  }

  static logMethodFailure(
    method: DNSLogEntry['method'],
    error: string,
    duration?: number
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
}