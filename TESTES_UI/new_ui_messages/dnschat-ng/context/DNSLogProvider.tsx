import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { appendDNSLog, clearDNSLogs, loadDNSLogs, type DNSLogEntry } from '@/storage/dnsLogs';

type DNSLogContextValue = {
  logs: DNSLogEntry[];
  isHydrated: boolean;
  recordLog: (entry: Omit<DNSLogEntry, 'id'>) => Promise<void>;
  clearLogs: () => Promise<void>;
};

const DNSLogContext = createContext<DNSLogContextValue | undefined>(undefined);

export function DNSLogProvider({ children }: PropsWithChildren) {
  const [logs, setLogs] = useState<DNSLogEntry[]>([]);
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadDNSLogs();
      if (cancelled) return;
      setLogs(stored);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const recordLog = useCallback(async (entry: Omit<DNSLogEntry, 'id'>) => {
    // Optimistically push the entry so the UI reflects activity immediately; replace with the
    // definitive Append storage response once AsyncStorage resolves.
    const optimisticId = `dnslog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setLogs((current) => [{ id: optimisticId, ...entry }, ...current].slice(0, 200));
    const persisted = await appendDNSLog(entry);
    setLogs(persisted);
  }, []);

  const clear = useCallback(async () => {
    await clearDNSLogs();
    setLogs([]);
  }, []);

  const value = useMemo(
    () => ({
      logs,
      isHydrated,
      recordLog,
      clearLogs: clear
    }),
    [logs, isHydrated, recordLog, clear]
  );

  return <DNSLogContext.Provider value={value}>{children}</DNSLogContext.Provider>;
}

export function useDNSLogs() {
  const context = useContext(DNSLogContext);
  if (!context) {
    throw new Error('useDNSLogs must be used within DNSLogProvider');
  }
  return context.logs;
}

export function useDNSLogActions() {
  const context = useContext(DNSLogContext);
  if (!context) {
    throw new Error('useDNSLogActions must be used within DNSLogProvider');
  }
  return {
    recordLog: context.recordLog,
    clearLogs: context.clearLogs,
    isHydrated: context.isHydrated
  };
}
