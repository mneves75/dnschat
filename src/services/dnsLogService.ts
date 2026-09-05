import AsyncStorage from "@react-native-async-storage/async-storage";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import {
  LOGGING_CONSTANTS,
  STORAGE_CONSTANTS,
} from "../constants/appConstants";
import {
  EncryptionKeyCorruptionError,
  EncryptionKeyUnavailableError,
  decryptIfEncrypted,
  encryptString,
  isEncryptedPayload,
} from "./encryptionService";
import { isScreenshotMode, getMockDNSLogs } from "../utils/screenshotMode";
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

const STORAGE_KEY = STORAGE_CONSTANTS.LOGS_KEY;
const LOGS_BACKUP_KEY = STORAGE_CONSTANTS.LOGS_BACKUP_KEY;
const MAX_LOGS = LOGGING_CONSTANTS.MAX_LOGS;
const LOG_RETENTION_DAYS = LOGGING_CONSTANTS.LOG_RETENTION_DAYS;
const DNS_METHODS: readonly DNSLogEntry["method"][] = [
  "native",
  "udp",
  "tcp",
  "https",
  "mock",
];
const DNS_ENTRY_STATUSES: readonly DNSLogEntry["status"][] = [
  "attempt",
  "success",
  "failure",
  "fallback",
];
const DNS_FINAL_STATUSES: readonly DNSQueryLog["finalStatus"][] = [
  "pending",
  "success",
  "failure",
];

class DNSLogStorageCorruptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DNSLogStorageCorruptionError";
  }
}

export class DNSLogService {
  private static activeQueryLogs: Map<string, DNSQueryLog> = new Map();
  private static queryLogs: DNSQueryLog[] = [];
  private static listeners: Set<(logs: DNSQueryLog[]) => void> = new Set();
  private static idCounter = 0;
  private static cleanupIntervalId: ReturnType<typeof setInterval> | null =
    null;
  private static persistenceQueue: Promise<void> = Promise.resolve();
  private static notifyScheduled = false;
  private static initialized = false;
  private static initializationInFlight: Promise<void> | null = null;
  /**
   * Per-query map of raw, unredacted sensitive values (prompt text + chat title)
   * to their pre-compiled redaction regexes, used to scrub those exact strings
   * out of log entry `details`/`error` text. The patterns are compiled once per
   * query in `startQuery()` (PERFORMANCE: previously a `new RegExp` was built
   * per sensitive value per entry in `sanitizeEntry`).
   * Lifecycle: populated in `startQuery()`; dropped in `endQuery()` (success or
   * failure) and `clearLogs()`. `DNSService.queryLLM()` wraps its
   * body in try/finally so an early throw still finalizes the query and clears
   * this entry — these values must never outlive the query that produced them.
   */
  private static sensitiveValuesByQueryId: Map<string, RegExp[]> = new Map();
  private static redactText(value: string): string {
    const hash = bytesToHex(sha256(utf8ToBytes(value)));
    return `sha256:${hash} len:${value.length}`;
  }

  static redactTextForLog(value: string): string {
    return this.redactText(value);
  }

  private static redactInlineValue(value: string): string {
    return `[redacted ${this.redactText(value)}]`;
  }

  private static escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private static buildSensitiveValuePattern(sensitiveValue: string): RegExp {
    const escaped = this.escapeRegExp(sensitiveValue);
    return new RegExp(`(^|[^A-Za-z0-9-])(${escaped})(?=$|[^A-Za-z0-9-])`, "g");
  }

  private static redactSensitiveValue(value: string, pattern: RegExp): string {
    // Safe to reuse a /g pattern: String.prototype.replace resets lastIndex
    // for global regexes before and after matching.
    return value.replace(
      pattern,
      (_match, prefix: string, matchedValue: string) =>
        `${prefix}${this.redactInlineValue(matchedValue)}`,
    );
  }

  private static redactKnownDnsQueries(value: string): string {
    // Match a single RFC 1035 label (alphanumeric start/end, <=63 chars) joined
    // to a known LLM zone. The leading boundary group + trailing negative class
    // avoid over-redacting malformed fragments (e.g. "-foo.ch.at") and mirror
    // the boundary handling in redactSensitiveValue() instead of relying on
    // lookbehind, which is not guaranteed across Hermes versions.
    return value.replace(
      /(^|[^A-Za-z0-9-])([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:llm\.pieter\.com|ch\.at))(?![A-Za-z0-9-])/gi,
      (_match, prefix: string, query: string) =>
        `${prefix}${this.redactInlineValue(query)}`,
    );
  }

  private static redactMultipartTxtFragments(value: string): string {
    return value.replace(
      /\b(\d+\/\d+:)([^,\s]+)/g,
      (_match, prefix: string, fragment: string) =>
        `${prefix}${this.redactInlineValue(fragment)}`,
    );
  }

  private static sanitizeEntryText(queryId: string, value: string): string {
    let sanitized = value;
    const patterns = this.sensitiveValuesByQueryId.get(queryId);
    if (patterns) {
      for (const pattern of patterns) {
        sanitized = this.redactSensitiveValue(sanitized, pattern);
      }
    }
    sanitized = this.redactKnownDnsQueries(sanitized);
    sanitized = this.redactMultipartTxtFragments(sanitized);
    return sanitized;
  }

  private static sanitizeEntry(
    queryId: string,
    entry: DNSLogEntry,
  ): DNSLogEntry {
    return {
      ...entry,
      ...(entry.details !== undefined
        ? { details: this.sanitizeEntryText(queryId, entry.details) }
        : {}),
      ...(entry.error !== undefined
        ? { error: this.sanitizeEntryText(queryId, entry.error) }
        : {}),
    };
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private static requireString(
    record: Record<string, unknown>,
    key: string,
    context: string,
  ): string {
    const value = record[key];
    if (typeof value !== "string" || value.length === 0) {
      throw new DNSLogStorageCorruptionError(`${context} has invalid ${key}`);
    }
    return value;
  }

  private static optionalString(
    record: Record<string, unknown>,
    key: string,
    context: string,
  ): string | undefined {
    const value = record[key];
    if (value === undefined) {
      return undefined;
    }
    if (typeof value !== "string") {
      throw new DNSLogStorageCorruptionError(`${context} has invalid ${key}`);
    }
    return value;
  }

  private static optionalDuration(
    record: Record<string, unknown>,
    key: string,
    context: string,
  ): number | undefined {
    const value = record[key];
    if (value === undefined) {
      return undefined;
    }
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new DNSLogStorageCorruptionError(`${context} has invalid ${key}`);
    }
    return value;
  }

  private static parseStoredDate(value: unknown, context: string): Date {
    if (typeof value !== "string" && typeof value !== "number") {
      throw new DNSLogStorageCorruptionError(`${context} is invalid`);
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new DNSLogStorageCorruptionError(`${context} is invalid`);
    }
    return date;
  }

  private static parseStoredEntry(
    candidate: unknown,
    logIndex: number,
    entryIndex: number,
  ): DNSLogEntry {
    const context = `DNS log entry ${entryIndex} in log ${logIndex}`;
    if (!this.isRecord(candidate)) {
      throw new DNSLogStorageCorruptionError(`${context} is not an object`);
    }

    const method = this.requireString(candidate, "method", context);
    if (!DNS_METHODS.includes(method as DNSLogEntry["method"])) {
      throw new DNSLogStorageCorruptionError(`${context} has invalid method`);
    }
    const status = this.requireString(candidate, "status", context);
    if (!DNS_ENTRY_STATUSES.includes(status as DNSLogEntry["status"])) {
      throw new DNSLogStorageCorruptionError(`${context} has invalid status`);
    }

    const details = this.optionalString(candidate, "details", context);
    const error = this.optionalString(candidate, "error", context);
    const duration = this.optionalDuration(candidate, "duration", context);
    return {
      id: this.requireString(candidate, "id", context),
      timestamp: this.parseStoredDate(
        candidate["timestamp"],
        `${context} timestamp`,
      ),
      message: this.requireString(candidate, "message", context),
      method: method as DNSLogEntry["method"],
      status: status as DNSLogEntry["status"],
      ...(details !== undefined ? { details } : {}),
      ...(error !== undefined ? { error } : {}),
      ...(duration !== undefined ? { duration } : {}),
    };
  }

  private static parseStoredLog(
    candidate: unknown,
    logIndex: number,
  ): DNSQueryLog {
    const context = `DNS log ${logIndex}`;
    if (!this.isRecord(candidate)) {
      throw new DNSLogStorageCorruptionError(`${context} is not an object`);
    }

    const finalStatus = this.requireString(candidate, "finalStatus", context);
    if (
      !DNS_FINAL_STATUSES.includes(finalStatus as DNSQueryLog["finalStatus"])
    ) {
      throw new DNSLogStorageCorruptionError(
        `${context} has invalid finalStatus`,
      );
    }
    const finalMethod = this.optionalString(candidate, "finalMethod", context);
    if (
      finalMethod !== undefined &&
      !DNS_METHODS.includes(finalMethod as DNSLogEntry["method"])
    ) {
      throw new DNSLogStorageCorruptionError(
        `${context} has invalid finalMethod`,
      );
    }

    const storedEntries = candidate["entries"];
    if (storedEntries !== undefined && !Array.isArray(storedEntries)) {
      throw new DNSLogStorageCorruptionError(`${context} has invalid entries`);
    }
    const entries = (storedEntries ?? []).map((entry, entryIndex) =>
      this.parseStoredEntry(entry, logIndex, entryIndex),
    );
    const chatId = this.optionalString(candidate, "chatId", context);
    const chatTitle = this.optionalString(candidate, "chatTitle", context);
    const response = this.optionalString(candidate, "response", context);
    const endTimeValue = candidate["endTime"];
    const endTime =
      endTimeValue === undefined
        ? undefined
        : this.parseStoredDate(endTimeValue, `${context} endTime`);
    const totalDuration = this.optionalDuration(
      candidate,
      "totalDuration",
      context,
    );

    return {
      id: this.requireString(candidate, "id", context),
      ...(chatId !== undefined ? { chatId } : {}),
      ...(chatTitle !== undefined ? { chatTitle } : {}),
      query: this.requireString(candidate, "query", context),
      startTime: this.parseStoredDate(
        candidate["startTime"],
        `${context} startTime`,
      ),
      ...(endTime !== undefined ? { endTime } : {}),
      ...(totalDuration !== undefined ? { totalDuration } : {}),
      finalStatus: finalStatus as DNSQueryLog["finalStatus"],
      ...(finalMethod !== undefined
        ? { finalMethod: finalMethod as DNSLogEntry["method"] }
        : {}),
      ...(response !== undefined ? { response } : {}),
      entries,
    };
  }

  private static parseStoredLogs(parsed: unknown): DNSQueryLog[] {
    if (!Array.isArray(parsed)) {
      throw new DNSLogStorageCorruptionError(
        "Persisted DNS logs are not an array",
      );
    }
    return parsed.map((candidate, index) =>
      this.parseStoredLog(candidate, index),
    );
  }

  private static redactLegacyText(value: string): string {
    return /^sha256:[0-9a-f]{64} len:\d+$/.test(value)
      ? value
      : this.redactText(value);
  }

  private static migrateLegacyLog(log: DNSQueryLog): DNSQueryLog {
    return {
      ...log,
      ...(log.chatTitle !== undefined
        ? { chatTitle: this.redactLegacyText(log.chatTitle) }
        : {}),
      query: this.redactLegacyText(log.query),
      ...(log.response !== undefined
        ? { response: this.redactLegacyText(log.response) }
        : {}),
      entries: log.entries.map((entry) => ({
        ...entry,
        message: "Legacy DNS log entry",
        ...(entry.details !== undefined
          ? { details: this.redactLegacyText(entry.details) }
          : {}),
        ...(entry.error !== undefined
          ? { error: this.redactLegacyText(entry.error) }
          : {}),
      })),
    };
  }

  private static async createCorruptionBackupPayload(
    error: unknown,
    storedPayload: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const payloadWasEncrypted = isEncryptedPayload(storedPayload);
    const protectedPayload = payloadWasEncrypted
      ? storedPayload
      : await encryptString(storedPayload);

    return JSON.stringify({
      timestamp,
      // JSON parser errors can quote decrypted or legacy plaintext content.
      error: this.redactText(
        error instanceof Error ? error.message : String(error),
      ),
      payload: protectedPayload,
      payloadWasEncrypted,
    });
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
      if (
        typeof globalThis.performance !== "undefined" &&
        globalThis.performance.now
      ) {
        performance = Math.floor(globalThis.performance.now() * 1000);
      }
    } catch {
      // Fallback if performance API is not available
      performance = Math.floor(Math.random() * 1000000);
    }

    return `${prefix}-${timestamp}-${performance}-${counter}-${random}`;
  }

  private static async loadPersistentLogs(): Promise<boolean> {
    let stored: string | null = null;
    let storageReadCompleted = false;
    try {
      if (isScreenshotMode()) {
        devLog(
          "[DNSLogService] Screenshot mode detected, loading mock DNS logs",
        );
        this.queryLogs = getMockDNSLogs();
        this.notifyListeners();
        return true;
      }

      stored = await AsyncStorage.getItem(STORAGE_KEY);
      storageReadCompleted = true;
      if (!stored) {
        this.queryLogs = [];
        return false;
      }

      const wasEncrypted = isEncryptedPayload(stored);
      const decrypted = await decryptIfEncrypted(stored);
      const parsed = this.parseStoredLogs(JSON.parse(decrypted) as unknown);
      this.queryLogs = wasEncrypted
        ? parsed
        : parsed.map((log) => this.migrateLegacyLog(log));

      if (!wasEncrypted) {
        await this.writePersistentLogs();
        devWarn(
          "[DNSLogService] Migrated legacy plaintext DNS logs to encrypted and redacted payload",
        );
      }
    } catch (error) {
      if (!storageReadCompleted) {
        devWarn("[DNSLogService] Failed to read DNS logs", error);
        throw error;
      }

      if (
        error instanceof EncryptionKeyCorruptionError ||
        error instanceof EncryptionKeyUnavailableError
      ) {
        devWarn(
          "[DNSLogService] Encryption key cannot be used; preserving encrypted DNS logs",
          error,
        );
        throw error;
      }

      devWarn("[DNSLogService] Failed to load DNS logs", error);
      if (!stored) {
        this.queryLogs = [];
        return false;
      }

      let backupPayload: string;
      try {
        backupPayload = await this.createCorruptionBackupPayload(error, stored);
        await AsyncStorage.setItem(LOGS_BACKUP_KEY, backupPayload);
      } catch (backupError) {
        devWarn(
          "[DNSLogService] Failed to backup corrupted DNS logs",
          backupError,
        );
        throw backupError;
      }

      await AsyncStorage.removeItem(STORAGE_KEY);
      this.queryLogs = [];
      devWarn("[DNSLogService] Corrupted DNS logs backed up and cleared", {
        key: LOGS_BACKUP_KEY,
      });
    }

    return false;
  }

  private static enqueueInitializationRead(): Promise<boolean> {
    const run = this.persistenceQueue.then(() => this.loadPersistentLogs());
    this.persistenceQueue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  static initialize(): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }
    if (this.initializationInFlight) {
      return this.initializationInFlight;
    }

    const run = this.enqueueInitializationRead().then(
      async (screenshotMode) => {
        if (!screenshotMode) {
          await this.initializeCleanupScheduler();
        }
      },
    );
    this.initializationInFlight = run;
    void run.then(
      () => {
        this.initialized = true;
        this.initializationInFlight = null;
      },
      () => {
        this.initializationInFlight = null;
      },
    );
    return run;
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
    // Compile each sensitive-value redaction pattern once per query; the Set
    // dedupes raw values (e.g. title === query) before compilation.
    const sensitivePatterns = Array.from(
      new Set(
        [query, rawChatTitle].filter((value): value is string => !!value),
      ),
      (value) => this.buildSensitiveValuePattern(value),
    );
    this.sensitiveValuesByQueryId.set(queryId, sensitivePatterns);
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

  /**
   * Register additional per-query sensitive values (e.g. the sanitized DNS label
   * and the composed query name) so any log/error text embedding them is redacted.
   * Defense-in-depth: the sanitized label is a lossy-but-readable form of the raw
   * prompt that neither the raw-prompt pattern nor the FQDN-with-known-zone matcher
   * covers on its own. Idempotent — re-registering the same value is harmless.
   */
  static registerSensitiveValues(queryId: string, values: string[]): void {
    const existing = this.sensitiveValuesByQueryId.get(queryId);
    if (!existing) {
      // No active query registered for this id (e.g. logging already ended);
      // nothing to attach the patterns to.
      return;
    }
    const additionalPatterns = Array.from(
      new Set(values.filter((value): value is string => !!value)),
      (value) => this.buildSensitiveValuePattern(value),
    );
    if (additionalPatterns.length > 0) {
      existing.push(...additionalPatterns);
    }
  }

  static addLog(queryId: string, entry: DNSLogEntry) {
    const queryLog = this.activeQueryLogs.get(queryId);
    if (!queryLog) return;

    queryLog.entries.push(this.sanitizeEntry(queryId, entry));
    this.scheduleNotifyListeners();
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
      queryLog.endTime.getTime() - queryLog.startTime.getTime();
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

    // PERFORMANCE: the in-memory transition happens synchronously so getLogs()
    // and every subscriber observe the terminal state as soon as endQuery
    // returns. Sensitive values are dropped here too, so they never outlive the
    // query even if the write below fails.
    //
    // Ordering note: this no longer runs inside the persistence queue, so a
    // query finishing while a clearLogs() is queued is discarded by that clear
    // rather than surviving it. clearLogs must keep its in-memory clear inside
    // the queue - it only clears after the storage removal succeeds, so a
    // failed clear cannot report a deletion that did not happen.
    this.activeQueryLogs.delete(queryId);
    this.sensitiveValuesByQueryId.delete(queryId);
    this.queryLogs.unshift({ ...queryLog, entries: [...queryLog.entries] });

    if (this.queryLogs.length > MAX_LOGS) {
      this.queryLogs = this.queryLogs.slice(0, MAX_LOGS);
    }

    this.notifyListeners();

    // PERFORMANCE: writePersistentLogs() re-encrypts the whole log store and
    // hex-encodes it. Awaiting it here put that on the message-send critical
    // path, between the DNS response arriving and queryLLM returning. Writes
    // stay serialized on the persistence queue, so no write can overwrite a
    // newer one; the caller simply no longer waits for this one.
    // enqueuePersistentMutation already logs and swallows write failures.
    void this.enqueuePersistentWrite();
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

  static getLogs(): DNSQueryLog[] {
    const activeLogs = Array.from(this.activeQueryLogs.values())
      .sort(
        (left, right) => right.startTime.getTime() - left.startTime.getTime(),
      )
      .map((log) => ({ ...log, entries: [...log.entries] }));
    return [...activeLogs, ...this.queryLogs];
  }

  static async clearLogs() {
    // The in-memory clear stays inside the queued task, after the removals
    // succeed: if storage removal fails the logs must survive, so the UI never
    // reports a deletion that did not happen. Consequence, asserted in
    // dnsLogService.concurrent.spec.ts: a query that finishes while a clear is
    // queued is wiped by that clear, because endQuery finalizes in memory
    // immediately while this clear runs a turn later.
    const run = this.persistenceQueue.then(async () => {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY),
        AsyncStorage.removeItem(LOGS_BACKUP_KEY),
      ]);

      const changed =
        this.queryLogs.length > 0 || this.activeQueryLogs.size > 0;
      this.queryLogs = [];
      this.activeQueryLogs.clear();
      this.sensitiveValuesByQueryId.clear();
      return changed;
    });

    this.persistenceQueue = run.then(
      () => undefined,
      (error) => {
        devWarn("[DNSLogService] Failed to clear DNS logs", error);
      },
    );

    const changed = await run;
    if (changed) {
      this.notifyListeners();
    }
  }

  static subscribe(listener: (logs: DNSQueryLog[]) => void) {
    this.listeners.add(listener);
    listener(this.getLogs());
    return () => this.listeners.delete(listener);
  }

  /**
   * Clean up old logs based on retention policy (30 days)
   * PERFORMANCE FIX: Use more efficient cleanup with early termination
   */
  static async cleanupOldLogs(): Promise<void> {
    const thirtyDaysAgo = new Date(
      Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
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

  /**
   * Queue a write of the current in-memory logs. Use when the caller has
   * already mutated state itself and only needs it persisted.
   */
  private static enqueuePersistentWrite(): Promise<boolean> {
    return this.enqueuePersistentMutation(() => true);
  }

  private static async enqueuePersistentMutation(
    mutate: () => boolean | Promise<boolean>,
    persist: () => Promise<void> = () => this.writePersistentLogs(),
  ): Promise<boolean> {
    let changed = false;

    const run = this.persistenceQueue.then(async () => {
      changed = await mutate();
      if (!changed) {
        return;
      }
      await persist();
    });

    this.persistenceQueue = run.catch((error) => {
      devWarn("[DNSLogService] Failed to persist DNS logs", error);
    });
    await this.persistenceQueue;
    return changed;
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

  /**
   * PERFORMANCE: a single DNS query emits 10-25 addLog() calls. Notifying per
   * entry ran getLogs() - a sort plus a shallow clone of every log and its
   * entries - and re-rendered the Logs screen that many times while the query
   * was still in flight. Entries added within one microtask checkpoint now
   * collapse into a single notification. Terminal transitions (endQuery,
   * clearLogs, recovery) still call notifyListeners() directly, so a
   * subscriber never observes a stale final state.
   */
  private static scheduleNotifyListeners() {
    if (this.listeners.size === 0) return;
    if (this.notifyScheduled) return;
    this.notifyScheduled = true;
    queueMicrotask(() => {
      // A synchronous flush in between clears the flag and already delivered
      // this batch; drop the queued run instead of notifying twice.
      if (!this.notifyScheduled) return;
      this.notifyScheduled = false;
      this.notifyListeners();
    });
  }

  private static notifyListeners() {
    this.notifyScheduled = false;
    // PERFORMANCE: getLogs() sorts and shallow-clones up to MAX_LOGS query
    // logs; skip that entirely when nobody is subscribed. Persistence is
    // handled by the callers (enqueuePersistentMutation) and is unaffected
    // by this early return.
    if (this.listeners.size === 0) return;
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
