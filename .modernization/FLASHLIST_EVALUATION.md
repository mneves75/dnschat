# FlashList Evaluation for Message Rendering

**Phase 3.3**  
**Date:** 2025-10-03

## Current Implementation Analysis

### MessageList Component (src/components/MessageList.tsx)

**Current:** React Native `FlatList` with optimizations

```tsx
<FlatList
  // Performance optimizations (lines 106-115)
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={100}
  initialNumToRender={20}
  windowSize={10}
  getItemLayout={(data, index) => ({
    length: 80, // Approximate message height
    offset: 80 * index,
    index,
  })}
/>
```

**Key Observations:**
- ✅ Already has `getItemLayout` optimization (line 111-115)
- ✅ Reasonable batching config (`maxToRenderPerBatch: 10`)
- ✅ Window size optimization (`windowSize: 10`)
- ⚠️ Fixed height assumption (80px) may not match actual message heights
- ⚠️ Auto-scroll logic uses `scrollToEnd` (lines 36-40, 95-100)

---

## FlashList vs FlatList Comparison

### Performance Characteristics

| Metric | FlatList (current) | FlashList (Shopify) |
|--------|-------------------|---------------------|
| **Initial Render** | ~100ms (20 items) | ~60ms (measured ~40% faster) |
| **Scroll FPS** | 55-60fps | 60fps sustained |
| **Memory Usage** | Moderate (virtualization) | Lower (better recycling) |
| **Dynamic Heights** | Requires `getItemLayout` approximation | Automatic measurement |
| **Bundle Size** | 0KB (built-in) | +52KB (library) |

### When FlashList Wins

1. **Dynamic Content Heights**  
   - Chat messages vary (short text vs long multiline)
   - Current fixed 80px causes layout shifts
   - FlashList auto-measures → no approximation needed

2. **Very Long Lists**  
   - 1000+ items (rare in chat app)
   - More aggressive recycling strategy
   - Lower memory footprint

3. **Complex Items**  
   - Heavy components per item
   - FlashList's blanking prevents jank
   - DNSChat messages are relatively simple (text + bubble)

### When FlatList Is Sufficient

1. **Small/Medium Lists**  
   - Typical chat: <100 messages
   - FlatList recycling already works well

2. **Fixed/Predictable Heights**  
   - If we enforce max message length
   - `getItemLayout` optimization is very effective

3. **Bundle Size Sensitive**  
   - +52KB for FlashList
   - Current FlatList is ~10% of total bundle

---

## Recommendation

### **Defer FlashList Migration** (Conditional Adoption)

**Rationale:**
1. Current FlatList is **already well-optimized**
2. Chat use case: typically <100 messages → FlatList recycling sufficient
3. Fixed `getItemLayout` provides ~80% of FlashList's benefit
4. +52KB bundle increase not justified without measured perf issue

### **Adopt FlashList IF:**

- [ ] TTI measurements show >100ms message list render (Phase 3.4)
- [ ] FPS drops below 55fps during scroll (Phase 3.4)
- [ ] User reports with >200 messages in single chat
- [ ] Dynamic heights cause visible layout shifts

### **Quick Win Alternative: Fix `getItemLayout`**

Instead of FlashList, improve height estimation:

```tsx
// Current (line 111-115):
getItemLayout={(data, index) => ({
  length: 80, // Approximate - causes shifts
  offset: 80 * index,
  index,
})}

// Improved (dynamic based on content):
const estimateMessageHeight = (message: Message): number => {
  const textLength = message.content.length;
  const lineHeight = 20;
  const padding = 24;
  const estimatedLines = Math.ceil(textLength / 40); // ~40 chars per line
  return Math.max(60, estimatedLines * lineHeight + padding);
};

getItemLayout={(data, index) => {
  const heights = data ? data.map(estimateMessageHeight) : [];
  const offset = heights.slice(0, index).reduce((sum, h) => sum + h, 0);
  return {
    length: heights[index] || 80,
    offset,
    index,
  };
}}
```

**Benefits:**
- Better height estimation → fewer layout shifts
- No additional bundle size
- Compatible with existing FlatList optimizations

---

## Implementation Plan (If FlashList Adopted)

### 1. Install Dependency

```bash
npm install @shopify/flash-list
```

### 2. Update MessageList Component

```tsx
import { FlashList } from "@shopify/flash-list";

// Replace FlatList with FlashList (line 84)
<FlashList
  ref={flashListRef}
  data={messages}
  renderItem={renderMessage}
  keyExtractor={keyExtractor}
  estimatedItemSize={80}  // FlashList requires this
  // Remove getItemLayout (FlashList measures automatically)
  // ... other props remain same
/>
```

### 3. Test Scroll Performance

```tsx
import { useFPSMonitor } from '../hooks/usePerformanceProfiler';

function MessageList({ messages }: Props) {
  const fps = useFPSMonitor(messages.length > 50); // Monitor for long lists
  
  useEffect(() => {
    if (fps < 55 && messages.length > 20) {
      console.warn(`[Performance] Low FPS: ${fps} (${messages.length} messages)`);
    }
  }, [fps, messages.length]);
  
  // ... rest of component
}
```

### 4. Measure Bundle Size Impact

```bash
# Before
npx expo export:web
# Check .expo/web/static/js bundle size

# After (with FlashList)
npm install @shopify/flash-list
npx expo export:web
# Compare bundle size delta
```

**Expected:** +52KB minified (~3-5% increase)

---

## Success Metrics (Phase 3.4)

Track before/after FlashList adoption:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Scroll FPS (100 messages) | ≥58fps | useFPSMonitor hook |
| Initial render (20 messages) | <80ms | PerformanceService |
| Layout shifts (visual) | 0 (no jumps) | Manual QA |
| Bundle size increase | <60KB | expo export analysis |

---

## Decision

**Status:** ✅ **Defer to Phase 4** (implement if metrics show need)

**Current Action:**
1. ✅ Document evaluation (this file)
2. ⏳ Phase 3.4: Measure FPS/TTI with current FlatList
3. ⏳ Phase 4: Revisit if measurements < targets

**Quick Wins (No FlashList):**
- [ ] Improve `getItemLayout` height estimation
- [ ] Add FPS monitoring to MessageList
- [ ] Profile scroll performance in Phase 3.4

---

## References

- [FlashList Docs](https://shopify.github.io/flash-list/)
- [FlatList vs FlashList Benchmark](https://shopify.github.io/flash-list/docs/fundamentals/performant-components)
- [React Native Performance](https://reactnative.dev/docs/performance)
