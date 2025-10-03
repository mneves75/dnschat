# Performance Metrics Measurement Guide

**Phase 3.4**
**Date:** 2025-10-03

## Automated Metrics (PerformanceService)

### TTI (Time to Interactive)

**Measurement:**
```tsx
// Automatically tracked in App.tsx (Phase 3.1)
// Check dev console on app launch:
// "[Performance] TTI: XXXms"
```

**Target:** <2000ms on mid-range devices (iPhone 12, Pixel 5)

**How to Measure:**
1. Build release app: `npm run ios -- --configuration Release`
2. Launch on device (not simulator for accurate timing)
3. Check Metro logs for TTI output
4. Record in `.modernization/performance-baseline.json`

### FPS (Frames Per Second)

**Measurement:**
```tsx
import { useFPSMonitor } from '../hooks/usePerformanceProfiler';

function ChatScreen() {
  const fps = useFPSMonitor(true); // Enable monitoring

  useEffect(() => {
    console.log(`Current FPS: ${fps}`);
  }, [fps]);
}
```

**Target:** ≥58fps sustained during scroll

**How to Measure:**
1. Add `useFPSMonitor` to MessageList component
2. Scroll through 50+ messages
3. Record minimum FPS encountered

### Memory Usage

**iOS (Xcode Instruments):**
1. Product → Profile (⌘I)
2. Select "Allocations" template
3. Run app and navigate through screens
4. Record peak allocation

**Android (Android Profiler):**
1. View → Tool Windows → Profiler
2. Select Memory profiler
3. Record heap allocations
4. Target: <150MB peak

### Bundle Size

**Measurement:**
```bash
npx expo export --platform ios --output-dir .expo/export-ios
npx expo export --platform android --output-dir .expo/export-android

# Check bundle sizes
du -h .expo/export-ios/bundles/*.js
du -h .expo/export-android/bundles/*.js
```

**Target:** <5MB uncompressed JS bundle

---

## Manual Metrics

### Render Time (React DevTools)

1. Install React DevTools: `npm install -g react-devtools`
2. Run app in dev mode
3. Open DevTools, go to Profiler tab
4. Record interaction, analyze flamegraph

**Components to Profile:**
- AppContent
- MessageList
- ChatProvider

### Network Performance (DNS Queries)

**Already tracked** in DNSLogService:
```typescript
// src/services/dnsLogService.ts
// Logs include: transport, duration, success/failure
```

**Metrics:**
- Average query time: <500ms
- Success rate: >95%
- Fallback frequency: <10%

---

## Baseline Recording Template

Update `.modernization/performance-baseline.json`:

```json
{
  "timestamp": "2025-10-03T12:00:00Z",
  "version": "2.0.1",
  "measurements": {
    "tti": {
      "ios": { "value": 1450, "unit": "ms", "device": "iPhone 15 Pro" },
      "android": { "value": 1680, "unit": "ms", "device": "Pixel 8" }
    },
    "fps": {
      "ios": { "min": 58, "avg": 60, "scenario": "100 message scroll" },
      "android": { "min": 57, "avg": 59, "scenario": "100 message scroll" }
    },
    "memory": {
      "ios": { "peak": 128, "unit": "MB" },
      "android": { "peak": 145, "unit": "MB" }
    },
    "bundle_size": {
      "ios": { "value": 4.2, "unit": "MB", "compressed": 1.1 },
      "android": { "value": 4.5, "unit": "MB", "compressed": 1.2 }
    }
  }
}
```

---

## CI Integration (Future - Phase 4)

Add to `.github/workflows/ci.yml`:

```yaml
- name: Bundle size check
  run: |
    npx expo export --platform ios
    SIZE=$(du -sm .expo/export-ios/bundles/*.js | awk '{print $1}')
    if [ $SIZE -gt 5 ]; then
      echo "❌ Bundle size ${SIZE}MB exceeds 5MB limit"
      exit 1
    fi
```

---

## Reporting

**After each measurement session:**

1. Update `.modernization/performance-baseline.json`
2. Compare against targets
3. Document any regressions in OPEN_QUESTIONS.md
4. Create GitHub issue if metric fails target
