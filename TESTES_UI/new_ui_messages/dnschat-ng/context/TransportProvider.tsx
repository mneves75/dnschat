import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

import { DNSTransportService, QueryOptions, QueryResult } from '@/services/DNSTransportService';
import { usePreferences } from '@/context/PreferencesProvider';
import { buildDnsQueryLabel } from '@/utils/dnsLabel';
import { stripControlCharacters } from '@/utils/validation';
import { useDNSLogActions } from '@/context/DNSLogProvider';

type TransportState = {
  status: 'idle' | 'loading' | 'error';
  error: Error | null;
  lastResult: QueryResult | null;
};

type TransportContextValue = TransportState & {
  executeQuery: (options: Omit<QueryOptions, 'transports'>) => Promise<QueryResult>;
  resetError: () => void;
};

const TransportContext = createContext<TransportContextValue | undefined>(undefined);

export function TransportProvider({ children }: PropsWithChildren) {
  const preferences = usePreferences();
  const [state, setState] = useState<TransportState>({ status: 'idle', error: null, lastResult: null });
  const { recordLog } = useDNSLogActions();

  const executeQuery = useCallback<TransportContextValue['executeQuery']>(
    async (options) => {
      setState((current) => ({ ...current, status: 'loading', error: null }));
      const startedAt = Date.now();
      // Mirror DNSTransportService sanitization so logs describe the exact label we will query,
      // keeping analytics aligned with the on-the-wire request.
      const sanitizedMessage = stripControlCharacters(options.message);
      const queryLabel = buildDnsQueryLabel(sanitizedMessage, options.conversationId);
      const domain = `${queryLabel}.${preferences.serverHost}`;
      try {
        const result = await DNSTransportService.executeQuery({
          ...options,
          message: sanitizedMessage,
          server: preferences.serverHost,
          transports: preferences.transport
        });
        await recordLog({
          conversationId: options.conversationId,
          message: sanitizedMessage,
          domain: result.domain,
          transport: result.transport,
          durationMs: result.durationMs,
          success: true,
          createdAt: startedAt
        });
        setState({ status: 'idle', error: null, lastResult: result });
        return result;
      } catch (error) {
        const casted = error instanceof Error ? error : new Error(String(error));
        await recordLog({
          conversationId: options.conversationId,
          message: sanitizedMessage,
          domain,
          transport: 'fallback',
          durationMs: Date.now() - startedAt,
          success: false,
          errorMessage: casted.message,
          createdAt: startedAt
        });
        setState({ status: 'error', error: casted, lastResult: null });
        throw casted;
      }
    },
    [preferences.serverHost, preferences.transport, recordLog]
  );

  const resetError = useCallback(() => {
    setState((current) => (current.error ? { ...current, status: 'idle', error: null } : current));
  }, []);

  const value = useMemo<TransportContextValue>(
    () => ({ ...state, executeQuery, resetError }),
    [state, executeQuery, resetError]
  );

  return <TransportContext.Provider value={value}>{children}</TransportContext.Provider>;
}

export function useTransport() {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within TransportProvider');
  }
  return context;
}
