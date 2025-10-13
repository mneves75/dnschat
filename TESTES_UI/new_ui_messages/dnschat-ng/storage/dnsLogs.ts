import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildMessageId } from '@/context/MessageProvider';

const STORAGE_KEY = 'dnschat-ng/dnsLogs/v1';
const MAX_LOG_ENTRIES = 200;

export type DNSLogEntry = {
  id: string;
  conversationId: string;
  message: string;
  domain: string;
  transport: string;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
  createdAt: number;
};

export async function loadDNSLogs(): Promise<DNSLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DNSLogEntry[];
  } catch (error) {
    console.warn('[DNSLogStorage] Failed to load logs', error);
    return [];
  }
}

export async function appendDNSLog(entry: Omit<DNSLogEntry, 'id'>): Promise<DNSLogEntry[]> {
  const existing = await loadDNSLogs();
  const logEntry: DNSLogEntry = {
    id: buildMessageId(),
    ...entry
  };
  const next = [logEntry, ...existing].slice(0, MAX_LOG_ENTRIES);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('[DNSLogStorage] Failed to append log', error);
  }
  return next;
}

export async function clearDNSLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[DNSLogStorage] Failed to clear logs', error);
  }
}
