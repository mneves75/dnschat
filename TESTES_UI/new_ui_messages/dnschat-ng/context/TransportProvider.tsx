import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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

  /**
   * CRITICAL FIX: Track the current query ID to prevent race conditions when
   * multiple queries are in flight.
   *
   * Problem: If executeQuery is called rapidly (e.g., user sends 2 messages within 100ms):
   * 1. Query A starts: setState(loading)
   * 2. Query B starts: setState(loading) (overwrites A's loading state)
   * 3. Query A completes: setState({ result: A }) (stale update, overwrites B)
   * 4. Query B completes: setState({ result: B }) (correct, but A's result was shown)
   *
   * Solution: Track queryId with useRef. Only update state if the response matches
   * the current query ID. This prevents stale updates from earlier queries.
   *
   * How it works:
   * - Each executeQuery call increments queryIdRef.current
   * - The closure captures this queryId
   * - When response arrives, check if queryId === queryIdRef.current
   * - Only update state if this is the latest query
   * - This is a standard pattern in async React code
   */
  const queryIdRef = useRef(0);

  const executeQuery = useCallback<TransportContextValue['executeQuery']>(
    async (options) => {
      // Increment query ID and capture it for this specific query attempt
      const queryId = ++queryIdRef.current;

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

        /**
         * CRITICAL: Only update state if this is still the current query.
         * If a newer query has started, queryIdRef.current will be higher than queryId.
         * This prevents stale results from overwriting newer query results.
         */
        if (queryId === queryIdRef.current) {
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
        }

        return result;
      } catch (error) {
        const casted = error instanceof Error ? error : new Error(String(error));

        /**
         * CRITICAL: Only update state if this is still the current query.
         * This prevents stale error from earlier queries from being displayed
         * after a newer query succeeds.
         */
        if (queryId === queryIdRef.current) {
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
        }

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
