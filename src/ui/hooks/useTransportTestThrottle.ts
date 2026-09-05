import { useRef } from "react";

export type TransportKind = "native" | "udp" | "tcp";

const DEFAULT_INTERVAL = 1200;

/**
 * Shared throttling for DNS transport diagnostics.
 * Prevents users from spamming the same test buttons and overwhelming the resolver,
 * in line with docs/SETTINGS.md guidance.
 */
export function useTransportTestThrottle() {
  const chainLastRunRef = useRef(0);
  const forcedLastRunRef = useRef<Record<TransportKind, number>>({
    native: 0,
    udp: 0,
    tcp: 0,
  });

  const checkChainAvailability = () => {
    const now = Date.now();
    if (now - chainLastRunRef.current < DEFAULT_INTERVAL) {
      return "screen.settings.sections.transportTest.chainThrottleMessage" as const;
    }
    return null;
  };

  const registerChainRun = () => {
    chainLastRunRef.current = Date.now();
  };

  const checkForcedAvailability = (transport: TransportKind) => {
    const now = Date.now();
    if (now - forcedLastRunRef.current[transport] < DEFAULT_INTERVAL) {
      return "screen.settings.sections.transportTest.forcedThrottleMessage" as const;
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
