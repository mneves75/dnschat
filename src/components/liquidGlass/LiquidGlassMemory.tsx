import React from "react";

export interface MemoryStats {
  totalGlassElements: number;
  maxGlassElements: number;
  memoryPressure: "low" | "medium" | "high";
}

export interface MemoryConfig {
  maxGlassElements: number;
}

interface LiquidGlassMemoryContextValue {
  stats: MemoryStats;
  updateConfig: (config: Partial<MemoryConfig>) => void;
}

const LiquidGlassMemoryContext = React.createContext<LiquidGlassMemoryContextValue | undefined>(
  undefined,
);

const DEFAULT_STATS: MemoryStats = {
  totalGlassElements: 0,
  maxGlassElements: 50,
  memoryPressure: "low",
};

export const LiquidGlassMemoryProvider: React.FC<{
  config?: Partial<MemoryConfig>;
  children?: React.ReactNode;
}> = ({ config, children }) => {
  const [stats, setStats] = React.useState<MemoryStats>({
    ...DEFAULT_STATS,
    maxGlassElements: config?.maxGlassElements ?? DEFAULT_STATS.maxGlassElements,
  });

  const updateConfig = React.useCallback((incoming: Partial<MemoryConfig>) => {
    setStats((current) => ({
      ...current,
      maxGlassElements: incoming.maxGlassElements ?? current.maxGlassElements,
    }));
  }, []);

  const value = React.useMemo<LiquidGlassMemoryContextValue>(
    () => ({ stats, updateConfig }),
    [stats, updateConfig],
  );

  return (
    <LiquidGlassMemoryContext.Provider value={value}>
      {children}
    </LiquidGlassMemoryContext.Provider>
  );
};

export const useLiquidGlassMemory = (config?: Partial<MemoryConfig>) => {
  const context = React.useContext(LiquidGlassMemoryContext);

  React.useEffect(() => {
    if (context && config?.maxGlassElements) {
      context.updateConfig({ maxGlassElements: config.maxGlassElements });
    }
  }, [context, config?.maxGlassElements]);

  if (!context) {
    return {
      stats: DEFAULT_STATS,
      updateConfig: () => {},
    };
  }

  return context;
};

export const withLiquidGlassMemory = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  const Wrapped: React.FC<P> = (props) => (
    <LiquidGlassMemoryProvider>
      <Component {...props} />
    </LiquidGlassMemoryProvider>
  );
  Wrapped.displayName = `WithLiquidGlassMemory(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
};
