import { useRef } from "react";

export type TransportKind = "native" | "udp" | "tcp" | "https";

export interface TransportThrottleConfig {
  intervalMs?: number;
  forcedIntervalMs?: number;
}

const DEFAULT_INTERVAL = 1200;
export const CHAIN_THROTTLE_MESSAGE =
  "Aguarde um instante antes de testar novamente.";
export const FORCED_THROTTLE_MESSAGE =
  "Evite testes consecutivos no mesmo transporte em sequência curta.";

/**
 * Shared throttling for DNS transport diagnostics.
 * Prevents users from spamming the same test buttons and overwhelming the resolver,
 * in line with docs/SETTINGS.md guidance.
 */
export function useTransportTestThrottle(config: TransportThrottleConfig = {}) {
  const chainInterval = config.intervalMs ?? DEFAULT_INTERVAL;
  const forcedInterval = config.forcedIntervalMs ?? DEFAULT_INTERVAL;

  const chainLastRunRef = useRef(0);
  const forcedLastRunRef = useRef<Record<TransportKind, number>>({
    native: 0,
    udp: 0,
    tcp: 0,
    https: 0,
  });

  const checkChainAvailability = () => {
    const now = Date.now();
    if (now - chainLastRunRef.current < chainInterval) {
      return CHAIN_THROTTLE_MESSAGE;
    }
    return null;
  };

  const registerChainRun = () => {
    chainLastRunRef.current = Date.now();
  };

  const checkForcedAvailability = (transport: TransportKind) => {
    const now = Date.now();
    if (now - forcedLastRunRef.current[transport] < forcedInterval) {
      return FORCED_THROTTLE_MESSAGE;
    }
    return null;
  };

  const registerForcedRun = (transport: TransportKind) => {
    forcedLastRunRef.current[transport] = Date.now();
  };

  return {
    checkChainAvailability,
    registerChainRun,
    checkForcedAvailability,
    registerForcedRun,
  };
}
