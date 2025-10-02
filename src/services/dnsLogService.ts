import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGGING_CONSTANTS } from '../constants/appConstants';

export interface DNSLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  method: "native" | "udp" | "tcp" | "https" | "mock";
  status: "attempt" | "success" | "failure" | "fallback";
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
  finalStatus: "pending" | "success" | "failure";
  finalMethod?: "native" | "udp" | "tcp" | "https" | "mock";
  response?: string;
  entries: DNSLogEntry[];
}

const STORAGE_KEY = "@dns_query_logs";
const MAX_LOGS = LOGGING_CONSTANTS.MAX_LOGS;
const LOG_RETENTION_DAYS = LOGGING_CONSTANTS.LOG_RETENTION_DAYS;
const STORAGE_SIZE_WARNING_MB = LOGGING_CONSTANTS.STORAGE_SIZE_WARNING_MB;

export class DNSLogService {
  private static currentQueryLog: DNSQueryLog | null = null;
  private static queryLogs: DNSQueryLog[] = [];
  private static listeners: Set<(logs: DNSQueryLog[]) => void> = new Set();
  private static idCounter = 0;

  /**
   * Generate a truly unique ID using multiple sources of entropy
   * Combines timestamp, performance counter, auto-incrementing counter, and random string
   */
  private static generateUniqueId(prefix: string): string {
    const timestamp = Date.now();
    const counter = ++this.idCounter;
    const random = Math.random().toString(36).substr(2, 5);

    // Platform-safe performance counter
    let performance = 0;
    try {
      if (typeof globalThis.performance !== 'undefined' && globalThis.performance.now) {
        performance = Math.floor(globalThis.performance.now() * 1000);
      }
    } catch {
      // Fallback if performance API is not available
      performance = Math.floor(Math.random() * 1000000);
    }

    return `${prefix}-${timestamp}-${performance}-${counter}-${random}`;
  }

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
      console.error("Failed to load DNS logs:", error);
      this.queryLogs = [];
    }

    // Initialize cleanup scheduler after loading logs
    await this.initializeCleanupScheduler();
  }

  /**
   * Clean up all listeners to prevent memory leaks
   */
  static cleanupListeners(): void {
    this.listeners.clear();
  }

  static startQuery(query: string): string {
    const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.currentQueryLog = {
      id: queryId,
      query,
      startTime: new Date(),
      finalStatus: "pending",
      entries: [],
    };

    this.addLog({
      id: this.generateUniqueId(`${queryId}-start`),
      timestamp: new Date(),
      message: `Starting DNS query: "${query}"`,
      method: "native",
      status: "attempt",
    });

    return queryId;
  }

  static addLog(entry: DNSLogEntry) {
    if (!this.currentQueryLog) return;

    this.currentQueryLog.entries.push(entry);
    this.notifyListeners();
  }

  static logMethodAttempt(method: DNSLogEntry["method"], details?: string) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${this.currentQueryLog.id}-${method}-attempt`),
      timestamp: new Date(),
      message: `Attempting ${method.toUpperCase()} DNS query`,
      method,
      status: "attempt",
      details,
    };

    this.addLog(entry);
  }

  static logMethodSuccess(
    method: DNSLogEntry["method"],
    duration: number,
    details?: string,
  ) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${this.currentQueryLog.id}-${method}-success`),
      timestamp: new Date(),
      message: `${method.toUpperCase()} query successful`,
      method,
      status: "success",
      details,
      duration,
    };

    this.addLog(entry);
  }

  static logMethodFailure(
    method: DNSLogEntry["method"],
    error: string,
    duration?: number,
  ) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${this.currentQueryLog.id}-${method}-failure`),
      timestamp: new Date(),
      message: `${method.toUpperCase()} query failed`,
      method,
      status: "failure",
      error,
      duration,
    };

    this.addLog(entry);
  }

  static logFallback(
    fromMethod: DNSLogEntry["method"],
    toMethod: DNSLogEntry["method"],
  ) {
    if (!this.currentQueryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${this.currentQueryLog.id}-fallback`),
      timestamp: new Date(),
      message: `Falling back from ${fromMethod.toUpperCase()} to ${toMethod.toUpperCase()}`,
      method: fromMethod,
      status: "fallback",
      details: `Next attempt: ${toMethod}`,
    };

    this.addLog(entry);
  }

  static async endQuery(
    success: boolean,
    response?: string,
    finalMethod?: DNSLogEntry["method"],
  ) {
    if (!this.currentQueryLog) return;

    this.currentQueryLog.endTime = new Date();
    this.currentQueryLog.totalDuration =
      this.currentQueryLog.endTime.getTime() -
      this.currentQueryLog.startTime.getTime();
    this.currentQueryLog.finalStatus = success ? "success" : "failure";
    this.currentQueryLog.finalMethod = finalMethod;
    this.currentQueryLog.response = response;

    const finalEntry: DNSLogEntry = {
      id: this.generateUniqueId(`${this.currentQueryLog.id}-end`),
      timestamp: new Date(),
      message: success
        ? `Query completed successfully via ${finalMethod?.toUpperCase()}`
        : "Query failed after all attempts",
      method: finalMethod || "mock",
      status: success ? "success" : "failure",
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

  static async recordSettingsEvent(message: string, details?: string) {
    const timestamp = new Date();
    const id = this.generateUniqueId("settings");

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${id}-entry`),
      timestamp,
      message,
      method: "native",
      status: "success",
      details,
    };

    const log: DNSQueryLog = {
      id,
      query: `[settings] ${message}`,
      startTime: timestamp,
      endTime: timestamp,
      totalDuration: 0,
      finalStatus: "success",
      finalMethod: "native",
      response: details,
      entries: [entry],
    };

    this.queryLogs.unshift(log);
    if (this.queryLogs.length > MAX_LOGS) {
      this.queryLogs = this.queryLogs.slice(0, MAX_LOGS);
    }

    await this.saveLogs();
    this.notifyListeners();
  }

  static async saveLogs() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queryLogs));
    } catch (error) {
      console.error("Failed to save DNS logs:", error);
    }
  }

  static async deleteLog(logId: string) {
    const nextLogs = this.queryLogs.filter((log) => log.id !== logId);
    if (nextLogs.length === this.queryLogs.length) {
      return;
    }
    this.queryLogs = nextLogs;
    if (this.currentQueryLog?.id === logId) {
      this.currentQueryLog = null;
    }
    await this.saveLogs();
    this.notifyListeners();
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

  /**
   * Clean up old logs based on retention policy (30 days)
   * PERFORMANCE FIX: Use more efficient cleanup with early termination
   */
  static async cleanupOldLogs(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const oldLogsCount = this.queryLogs.length;

    // PERFORMANCE FIX: Use splice for in-place removal instead of filter
    // This is more efficient for large arrays
    let removedCount = 0;
    for (let i = this.queryLogs.length - 1; i >= 0; i--) {
      const logDate = new Date(this.queryLogs[i].startTime);
      if (logDate <= thirtyDaysAgo) {
        this.queryLogs.splice(i, 1);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old DNS logs (older than ${LOG_RETENTION_DAYS} days)`);
      await this.saveLogs();
      this.notifyListeners();
    }
  }

  /**
   * Check storage size and warn if approaching limit
   */
  static async checkStorageSize(): Promise<number> {
    try {
      const logsJson = JSON.stringify(this.queryLogs);
      const sizeInBytes = new Blob([logsJson]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > STORAGE_SIZE_WARNING_MB) {
        console.warn(`⚠️ DNS logs storage size (${sizeInMB.toFixed(2)}MB) exceeds warning threshold (${STORAGE_SIZE_WARNING_MB}MB)`);
      }

      return sizeInMB;
    } catch (error) {
      console.error("Failed to check storage size:", error);
      return 0;
    }
  }

  /**
   * Initialize cleanup scheduler (call this on app startup)
   */
  static async initializeCleanupScheduler(): Promise<void> {
    // Clean up old logs on startup
    await this.cleanupOldLogs();

    // Schedule periodic cleanup (daily)
    setInterval(async () => {
      await this.cleanupOldLogs();
    }, LOGGING_CONSTANTS.CLEANUP_INTERVAL_MS);
  }

  private static notifyListeners() {
    const logs = this.getLogs();
    this.listeners.forEach((listener) => listener(logs));
  }

  static formatDuration(ms: number | undefined): string {
    if (ms === undefined || ms === null || isNaN(ms)) {
      return "—";
    }
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  static getMethodColor(method: DNSLogEntry["method"] | undefined): string {
    if (!method) return "#757575";

    const colors = {
      native: "#4CAF50",
      udp: "#2196F3",
      tcp: "#FF9800",
      https: "#9C27B0",
      mock: "#607D8B",
    };
    return colors[method] || "#757575";
  }

  static getStatusIcon(status: DNSLogEntry["status"] | undefined): string {
    if (!status) return "•";

    const icons = {
      attempt: "🔄",
      success: "✅",
      failure: "❌",
      fallback: "↩️",
    };
    return icons[status] || "•";
  }
}
