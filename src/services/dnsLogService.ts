import AsyncStorage from "@react-native-async-storage/async-storage";
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { LOGGING_CONSTANTS, STORAGE_CONSTANTS } from '../constants/appConstants';
import { decryptIfEncrypted, encryptString, isEncryptedPayload } from './encryptionService';
import { isScreenshotMode, getMockDNSLogs } from '../utils/screenshotMode';
import { devLog, devWarn } from "../utils/devLog";

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
  chatId?: string;
  chatTitle?: string;
  query: string;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  finalStatus: "pending" | "success" | "failure";
  finalMethod?: "native" | "udp" | "tcp" | "https" | "mock";
  response?: string;
  entries: DNSLogEntry[];
}

type StoredDNSLogEntry = Omit<DNSLogEntry, 'timestamp'> & {
  timestamp: string | number | Date;
};

type StoredDNSQueryLog = Omit<DNSQueryLog, 'startTime' | 'endTime' | 'entries'> & {
  startTime: string | number | Date;
  endTime?: string | number | Date;
  entries?: StoredDNSLogEntry[];
};

const STORAGE_KEY = STORAGE_CONSTANTS.LOGS_KEY;
const LOGS_BACKUP_KEY = STORAGE_CONSTANTS.LOGS_BACKUP_KEY;
const MAX_LOGS = LOGGING_CONSTANTS.MAX_LOGS;
const LOG_RETENTION_DAYS = LOGGING_CONSTANTS.LOG_RETENTION_DAYS;
const STORAGE_SIZE_WARNING_MB = LOGGING_CONSTANTS.STORAGE_SIZE_WARNING_MB;

export class DNSLogService {
  private static activeQueryLogs: Map<string, DNSQueryLog> = new Map();
  private static queryLogs: DNSQueryLog[] = [];
  private static listeners: Set<(logs: DNSQueryLog[]) => void> = new Set();
  private static idCounter = 0;
  private static cleanupIntervalId: ReturnType<typeof setInterval> | null = null;
  private static persistenceQueue: Promise<void> = Promise.resolve();
  private static redactText(value: string): string {
    const hash = bytesToHex(sha256(utf8ToBytes(value)));
    return `sha256:${hash} len:${value.length}`;
  }

  static redactTextForLog(value: string): string {
    return this.redactText(value);
  }

  private static async createCorruptionBackupPayload(
    error: unknown,
    storedPayload: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const payloadWasEncrypted = isEncryptedPayload(storedPayload);

    try {
      const protectedPayload = payloadWasEncrypted
        ? storedPayload
        : await encryptString(storedPayload);

      return JSON.stringify({
        timestamp,
        error: error instanceof Error ? error.message : String(error),
        payload: protectedPayload,
        payloadWasEncrypted,
      });
    } catch (backupEncryptionError) {
      devWarn(
        "[DNSLogService] Failed to encrypt corrupted DNS logs backup payload",
        backupEncryptionError,
      );
      return JSON.stringify({
        timestamp,
        error: error instanceof Error ? error.message : String(error),
        payloadRedacted: true,
        payloadWasEncrypted,
      });
    }
  }

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
    let stored: string | null = null;
    try {
      // SCREENSHOT MODE: Load mock DNS logs for deterministic UI captures
      if (isScreenshotMode()) {
        devLog("[DNSLogService] Screenshot mode detected, loading mock DNS logs");
        this.queryLogs = getMockDNSLogs("en-US"); // Default to English, will be overridden by locale
        this.notifyListeners();
        return;
      }

      // NORMAL MODE: Load logs from storage
      stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const wasEncrypted = isEncryptedPayload(stored);
        const decrypted = await decryptIfEncrypted(stored);
        const parsed = JSON.parse(decrypted) as unknown;
        if (Array.isArray(parsed)) {
          this.queryLogs = (parsed as StoredDNSQueryLog[]).map((log) => {
            const { startTime, endTime: storedEndTime, entries: storedEntries, ...rest } = log;
            const endTime = storedEndTime ? new Date(storedEndTime) : undefined;
            const normalizedEntries = Array.isArray(storedEntries)
              ? storedEntries.map((entry) => ({
                  ...entry,
                  timestamp: new Date(entry.timestamp),
                }))
              : [];
            return {
              ...rest,
              startTime: new Date(startTime),
              ...(endTime ? { endTime } : {}),
              entries: normalizedEntries,
            };
          });
          if (!wasEncrypted) {
            await this.writePersistentLogs();
            devWarn("[DNSLogService] Migrated legacy plaintext DNS logs to encrypted payload");
          }
        } else {
          this.queryLogs = [];
        }
      }
    } catch (error) {
      devWarn("[DNSLogService] Failed to load DNS logs", error);
      if (stored) {
        try {
          const backupPayload = await this.createCorruptionBackupPayload(error, stored);
          await AsyncStorage.setItem(LOGS_BACKUP_KEY, backupPayload);
          await AsyncStorage.removeItem(STORAGE_KEY);
          devWarn("[DNSLogService] Corrupted DNS logs backed up and cleared", {
            key: LOGS_BACKUP_KEY,
          });
        } catch (backupError) {
          devWarn("[DNSLogService] Failed to backup corrupted DNS logs", backupError);
        }
      }
      this.queryLogs = [];
    }

    // Initialize cleanup scheduler after loading logs (skip in screenshot mode)
    if (!isScreenshotMode()) {
      await this.initializeCleanupScheduler();
    }
  }

  /**
   * Clean up all listeners to prevent memory leaks
   */
  static cleanupListeners(): void {
    this.listeners.clear();
  }

  static startQuery(
    query: string,
    context?: { chatId?: string; chatTitle?: string },
  ): string {
    const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const redacted = this.redactText(query);
    const rawChatTitle = context?.chatTitle?.trim() || undefined;
    const chatTitle = rawChatTitle ? this.redactText(rawChatTitle) : undefined;
    const chatId = context?.chatId || undefined;

    const queryLog: DNSQueryLog = {
      id: queryId,
      ...(chatId ? { chatId } : {}),
      ...(chatTitle ? { chatTitle } : {}),
      query: redacted,
      startTime: new Date(),
      finalStatus: "pending",
      entries: [],
    };
    this.activeQueryLogs.set(queryId, queryLog);
    this.addLog(queryId, {
      id: this.generateUniqueId(`${queryId}-start`),
      timestamp: new Date(),
      message: `Starting DNS query`,
      method: "native",
      status: "attempt",
      details: `query=${redacted}`,
    });

    return queryId;
  }

  static addLog(queryId: string, entry: DNSLogEntry) {
    const queryLog = this.activeQueryLogs.get(queryId);
    if (!queryLog) return;

    queryLog.entries.push(entry);
    this.notifyListeners();
  }

  static logMethodAttempt(
    queryId: string,
    method: DNSLogEntry["method"],
    details?: string,
  ) {
    const queryLog = this.activeQueryLogs.get(queryId);
    if (!queryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${queryLog.id}-${method}-attempt`),
      timestamp: new Date(),
      message: `Attempting ${method.toUpperCase()} DNS query`,
      method,
      status: "attempt",
      ...(details !== undefined ? { details } : {}),
    };

    this.addLog(queryId, entry);
  }

  static logMethodSuccess(
    queryId: string,
    method: DNSLogEntry["method"],
    duration: number,
    details?: string,
  ) {
    const queryLog = this.activeQueryLogs.get(queryId);
    if (!queryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${queryLog.id}-${method}-success`),
      timestamp: new Date(),
      message: `${method.toUpperCase()} query successful`,
      method,
      status: "success",
      duration,
      ...(details !== undefined ? { details } : {}),
    };

    this.addLog(queryId, entry);
  }

  static logMethodFailure(
    queryId: string,
    method: DNSLogEntry["method"],
    error: string,
    duration?: number,
  ) {
    const queryLog = this.activeQueryLogs.get(queryId);
    if (!queryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${queryLog.id}-${method}-failure`),
      timestamp: new Date(),
      message: `${method.toUpperCase()} query failed`,
      method,
      status: "failure",
      error,
      ...(duration !== undefined ? { duration } : {}),
    };

    this.addLog(queryId, entry);
  }

  static logFallback(
    queryId: string,
    fromMethod: DNSLogEntry["method"],
    toMethod: DNSLogEntry["method"],
  ) {
    const queryLog = this.activeQueryLogs.get(queryId);
    if (!queryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${queryLog.id}-fallback`),
      timestamp: new Date(),
      message: `Falling back from ${fromMethod.toUpperCase()} to ${toMethod.toUpperCase()}`,
      method: fromMethod,
      status: "fallback",
      details: `Next attempt: ${toMethod}`,
    };

    this.addLog(queryId, entry);
  }

  /**
   * Log server-level fallback (e.g., llm.pieter.com:53 → ch.at:53)
   * Distinct from transport-level fallback (native → udp → tcp)
   */
  static logServerFallback(queryId: string, fromServer: string, toServer: string) {
    const queryLog = this.activeQueryLogs.get(queryId);
    if (!queryLog) return;

    const entry: DNSLogEntry = {
      id: this.generateUniqueId(`${queryLog.id}-server-fallback`),
      timestamp: new Date(),
      message: `Server fallback: ${fromServer} → ${toServer}`,
      method: "native",
      status: "fallback",
      details: `Trying next server: ${toServer}`,
    };

    this.addLog(queryId, entry);
  }

  static async endQuery(
    queryId: string,
    success: boolean,
    response?: string,
    finalMethod?: DNSLogEntry["method"],
  ) {
    const queryLog = this.activeQueryLogs.get(queryId);
    if (!queryLog) return;

    const resolvedFinalMethod =
      finalMethod ?? this.getLastTrackedMethod(queryLog) ?? "native";

    queryLog.endTime = new Date();
    queryLog.totalDuration =
      queryLog.endTime.getTime() -
      queryLog.startTime.getTime();
    queryLog.finalStatus = success ? "success" : "failure";
    queryLog.finalMethod = resolvedFinalMethod;
    if (response) {
      queryLog.response = this.redactText(response);
    } else {
      delete queryLog.response;
    }

    const finalEntry: DNSLogEntry = {
      id: this.generateUniqueId(`${queryLog.id}-end`),
      timestamp: new Date(),
      message: success
        ? `Query completed successfully via ${resolvedFinalMethod.toUpperCase()}`
        : "Query failed after all attempts",
      method: resolvedFinalMethod,
      status: success ? "success" : "failure",
      duration: queryLog.totalDuration,
    };

    this.addLog(queryId, finalEntry);

    await this.enqueuePersistentMutation(() => {
      this.activeQueryLogs.delete(queryId);
      this.queryLogs.unshift({ ...queryLog, entries: [...queryLog.entries] });

      if (this.queryLogs.length > MAX_LOGS) {
        this.queryLogs = this.queryLogs.slice(0, MAX_LOGS);
      }

      return true;
    });
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
      ...(details !== undefined ? { details } : {}),
    };

    const log: DNSQueryLog = {
      id,
      query: `[settings] ${message}`,
      startTime: timestamp,
      endTime: timestamp,
      totalDuration: 0,
      finalStatus: "success",
      finalMethod: "native",
      ...(details !== undefined ? { response: details } : {}),
      entries: [entry],
    };

    await this.enqueuePersistentMutation(() => {
      this.queryLogs.unshift(log);
      if (this.queryLogs.length > MAX_LOGS) {
        this.queryLogs = this.queryLogs.slice(0, MAX_LOGS);
      }
      return true;
    });
    this.notifyListeners();
  }

  static async saveLogs() {
    await this.enqueuePersistentMutation(() => true);
  }

  static async deleteLog(logId: string) {
    const changed = await this.enqueuePersistentMutation(() => {
      const nextLogs = this.queryLogs.filter((log) => log.id !== logId);
      if (nextLogs.length === this.queryLogs.length) {
        return this.activeQueryLogs.delete(logId);
      }

      this.queryLogs = nextLogs;
      return true;
    });
    if (changed) {
      this.notifyListeners();
    }
  }

  static getLogs(): DNSQueryLog[] {
    const activeLogs = Array.from(this.activeQueryLogs.values())
      .sort((left, right) => right.startTime.getTime() - left.startTime.getTime())
      .map((log) => ({ ...log, entries: [...log.entries] }));
    return [...activeLogs, ...this.queryLogs];
  }

  static getCurrentQueryLog(): DNSQueryLog | null {
    const activeLogs = Array.from(this.activeQueryLogs.values())
      .sort((left, right) => right.startTime.getTime() - left.startTime.getTime());
    const latest = activeLogs[0];
    return latest ? { ...latest, entries: [...latest.entries] } : null;
  }

  static async clearLogs() {
    const changed = await this.enqueuePersistentMutation(
      () => {
        const hasLogs = this.queryLogs.length > 0 || this.activeQueryLogs.size > 0;
        this.queryLogs = [];
        this.activeQueryLogs.clear();
        return hasLogs;
      },
      () => AsyncStorage.removeItem(STORAGE_KEY),
    );
    if (changed) {
      this.notifyListeners();
    }
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
    const changed = await this.enqueuePersistentMutation(() => {
      let removedCount = 0;
      for (let i = this.queryLogs.length - 1; i >= 0; i--) {
        const log = this.queryLogs[i];
        if (!log) {
          continue;
        }
        const logDate = new Date(log.startTime);
        if (logDate <= thirtyDaysAgo) {
          this.queryLogs.splice(i, 1);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        devLog(
          `Cleaned up ${removedCount} old DNS logs (older than ${LOG_RETENTION_DAYS} days)`,
        );
      }

      return removedCount > 0;
    });

    if (changed) {
      devLog(
        `[DNSLogService] Cleanup persisted after removing logs older than ${LOG_RETENTION_DAYS} days`,
      );
      this.notifyListeners();
    }
  }

  private static getLastTrackedMethod(
    queryLog: DNSQueryLog,
  ): DNSLogEntry["method"] | undefined {
    for (let index = queryLog.entries.length - 1; index >= 0; index--) {
      const entry = queryLog.entries[index];
      if (entry?.method) {
        return entry.method;
      }
    }
    return undefined;
  }

  private static async writePersistentLogs(): Promise<void> {
    const payload = await encryptString(JSON.stringify(this.queryLogs));
    await AsyncStorage.setItem(STORAGE_KEY, payload);
  }

  private static async enqueuePersistentMutation(
    mutate: () => boolean | Promise<boolean>,
    persist: () => Promise<void> = () => this.writePersistentLogs(),
  ): Promise<boolean> {
    let changed = false;

    const run = this.persistenceQueue
      .then(async () => {
        changed = await mutate();
        if (!changed) {
          return;
        }
        await persist();
      })
      .catch((error) => {
        devWarn("[DNSLogService] Failed to persist DNS logs", error);
      });

    this.persistenceQueue = run;
    await run;
    return changed;
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
        devWarn(
          `[DNSLogService] DNS logs storage size (${sizeInMB.toFixed(2)}MB) exceeds warning threshold (${STORAGE_SIZE_WARNING_MB}MB)`,
        );
      }

      return sizeInMB;
    } catch (error) {
      devWarn("[DNSLogService] Failed to check storage size", error);
      return 0;
    }
  }

  /**
   * Initialize cleanup scheduler (call this on app startup)
   */
  static async initializeCleanupScheduler(): Promise<void> {
    // Clean up old logs on startup
    await this.cleanupOldLogs();

    if (this.cleanupIntervalId) {
      return;
    }

    // Schedule periodic cleanup (daily)
    this.cleanupIntervalId = setInterval(async () => {
      await this.cleanupOldLogs();
    }, LOGGING_CONSTANTS.CLEANUP_INTERVAL_MS);
  }

  static stopCleanupScheduler(): void {
    if (!this.cleanupIntervalId) {
      return;
    }
    clearInterval(this.cleanupIntervalId);
    this.cleanupIntervalId = null;
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
      attempt: "...",
      success: "OK",
      failure: "X",
      fallback: "<-",
    };
    return icons[status] || "•";
  }
}
