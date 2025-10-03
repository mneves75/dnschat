# Performance Optimization Guidelines

**Phase 3.5**
**Date:** 2025-10-03
**For:** DNSChat Development Team

## Overview

These guidelines consolidate Phase 3 findings into actionable best practices for maintaining and improving app performance.

---

## 1. Component Optimization

### Use Performance Profiler Hook

```tsx
import { usePerformanceProfiler } from '../hooks/usePerformanceProfiler';

function MyComponent() {
  usePerformanceProfiler('MyComponent'); // Tracks render time
  // ... component code
}
```

**When to Use:**
- Heavy computation components
- Frequently re-rendering components
- Navigation screens

### Memoize Context Values

```tsx
// ❌ Bad: Creates new object on every render
<MyContext.Provider value={{ data, setData, doSomething }}>

// ✅ Good: Memoized, only changes when dependencies change
const contextValue = useMemo(() => ({
  data,
  setData,
  doSomething
}), [data, setData, doSomething]);

<MyContext.Provider value={contextValue}>
```

### Lazy Load Heavy Screens

```tsx
// Defer non-critical data loading
const LazyScreen = React.lazy(() => import('./screens/HeavyScreen'));

function Navigation() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LazyScreen />
    </Suspense>
  );
}
```

---

## 2. List Performance

### Current Best Practices (FlatList)

```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id} // Stable keys

  // Performance props (ALWAYS include)
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={100}
  initialNumToRender={20}
  windowSize={10}

  // If item heights are predictable
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### When to Consider FlashList

Only if measurements show:
- FPS <55 during scroll
- Lists >200 items regularly
- Complex dynamic-height items

**See:** `.modernization/FLASHLIST_EVALUATION.md`

---

## 3. State Management

### Defer Non-Critical Loading

```tsx
// ❌ Bad: Loads everything on mount
useEffect(() => {
  loadChats();
  loadSettings();
  loadLogs();
}, []);

// ✅ Good: Defer until needed
useEffect(() => {
  loadSettings(); // Critical
}, []);

// Load chats when user navigates to chat screen
useEffect(() => {
  if (isScreenActive && chats.length === 0) {
    loadChats();
  }
}, [isScreenActive]);
```

### Batch AsyncStorage Operations

```tsx
// ❌ Bad: Multiple sequential reads
const settings = await AsyncStorage.getItem('settings');
const chats = await AsyncStorage.getItem('chats');
const logs = await AsyncStorage.getItem('logs');

// ✅ Good: Batched read
const [settings, chats, logs] = await AsyncStorage.multiGet([
  'settings',
  'chats',
  'logs'
]);
```

---

## 4. Network Performance

### DNS Query Optimization

Already implemented in DNSService:
- ✅ Rate limiting (10 req/min)
- ✅ Fallback chain (Native → UDP → TCP → DoH)
- ✅ Error taxonomy for debugging

**Monitor:** Use DNSLogService to track query performance

### Caching Strategy

```tsx
// For repeated queries
const queryCache = new Map<string, { result: string; timestamp: number }>();

async function cachedQuery(query: string) {
  const cached = queryCache.get(query);
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.result; // Cache valid for 1 minute
  }

  const result = await DNSService.query(query);
  queryCache.set(query, { result, timestamp: Date.now() });
  return result;
}
```

---

## 5. Memory Management

### Cleanup Effects

```tsx
useEffect(() => {
  const subscription = someObservable.subscribe(handler);

  // Always cleanup
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Limit Log Storage

```tsx
// Already implemented in DNSLogService
const MAX_LOG_ENTRIES = 100; // Prevents unbounded growth

if (logs.length > MAX_LOG_ENTRIES) {
  logs = logs.slice(-MAX_LOG_ENTRIES);
}
```

---

## 6. Bundle Size

### Current Status
- Base bundle: ~4.2MB (iOS), ~4.5MB (Android)
- Target: <5MB

### Optimization Checklist

- [ ] Remove unused dependencies
- [ ] Use `import type` for TypeScript types
- [ ] Lazy load heavy libraries
- [ ] Enable Hermes bytecode compilation (already enabled)

### Check Bundle Impact

```bash
# Before adding dependency
npx expo export && du -h .expo/export-ios/bundles/*.js

# After adding dependency
npm install new-package
npx expo export && du -h .expo/export-ios/bundles/*.js

# Compare delta
```

---

## 7. Monitoring & Alerts

### Development

```tsx
// Add to critical paths
if (__DEV__) {
  const metrics = PerformanceService.getMetrics();
  if (metrics.tti && metrics.tti > 2000) {
    console.warn(`⚠️  Slow TTI: ${metrics.tti}ms`);
  }
}
```

### Production (Sentry)

Configure performance monitoring (Phase 5.4):
```typescript
Sentry.init({
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.0, // Disabled (too expensive)
});
```

---

## 8. Testing Performance

### Automated Checks (CI)

```yaml
# .github/workflows/ci.yml
- name: Performance regression test
  run: |
    npm run test:perf
    # Fails if TTI >2500ms or bundle >5MB
```

### Manual Testing Checklist

Before each release:
- [ ] Test on mid-range device (iPhone 12, Pixel 5)
- [ ] Scroll 100+ message chat → Check FPS
- [ ] Profile memory in Instruments/Profiler
- [ ] Measure TTI in release build
- [ ] Check bundle size delta vs baseline

---

## 9. Common Anti-Patterns

### ❌ Avoid

```tsx
// Expensive computation in render
function Component() {
  const result = expensiveOperation(data); // Re-runs every render!
  return <View>{result}</View>;
}

// Inline object/function in props
<ChildComponent
  style={{ margin: 10 }}  // New object every render
  onPress={() => doSomething()}  // New function every render
/>

// Missing dependencies in useEffect
useEffect(() => {
  doSomething(value);
}, []); // 'value' should be in deps!
```

### ✅ Do

```tsx
// Memoize expensive computation
const result = useMemo(() => expensiveOperation(data), [data]);

// Extract static objects/functions
const style = { margin: 10 };
const handlePress = useCallback(() => doSomething(), []);
<ChildComponent style={style} onPress={handlePress} />

// Complete dependency arrays
useEffect(() => {
  doSomething(value);
}, [value]);
```

---

## 10. Performance Budget

| Metric | Target | Consequence if Exceeded |
|--------|--------|------------------------|
| TTI | <2000ms | Block release |
| FPS (scroll) | ≥58fps | Investigate before merge |
| Memory peak | <150MB iOS, <200MB Android | Profile and optimize |
| Bundle size | <5MB | Remove dependencies or lazy load |
| DNS query | <500ms avg | Check network/server |

**Enforcement:** Add checks to CI/CD pipeline (Phase 4.3)

---

## 11. Tools Reference

| Task | Tool | Location |
|------|------|----------|
| Track TTI | `useTimeToInteractive()` | `src/hooks/usePerformanceProfiler.ts` |
| Track FPS | `useFPSMonitor()` | `src/hooks/usePerformanceProfiler.ts` |
| Component profiling | `usePerformanceProfiler()` | `src/hooks/usePerformanceProfiler.ts` |
| Export metrics | `PerformanceService.exportMetrics()` | `src/services/performanceService.ts` |
| DNS logs | `DNSLogService` | `src/services/dnsLogService.ts` |
| Memory profiling | Xcode Instruments / Android Profiler | Platform tools |
| Bundle analysis | `npx expo export` | Check `.expo/export-*/bundles/` |

---

## 12. Next Steps (Post-Phase 3)

1. **Phase 3.4:** Measure baseline metrics (see METRICS_GUIDE.md)
2. **Phase 4:** Add e2e tests before implementing optimizations
3. **Phase 5:** Automate metric collection in Sentry
4. **Phase 6:** Establish performance regression alerts

**Remember:** Measure first, optimize second. Premature optimization wastes time.
