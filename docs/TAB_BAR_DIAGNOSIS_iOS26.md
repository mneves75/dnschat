# Tab Bar Missing on iOS 26 - Diagnostic Plan

**Device**: iPhone 17 Pro, iOS 26  
**Status**: 🔴 CRITICAL - Tab bar not appearing despite native tabs support  
**Date**: October 1, 2025

---

## Situation

User is running on **iOS 26** (which supports native glass tabs), but the bottom tab bar is **completely missing**. This means:
- ✅ Platform condition is TRUE
- ✅ Icons SHOULD be rendering
- ✅ Glass effects SHOULD be enabled
- ❌ Tab bar is STILL not visible

---

## Diagnostic Steps

### Step 1: Check Console Logs

I've added extensive logging to `app/(app)/(tabs)/_layout.tsx`. Run the app and check the console for:

```
🔵 [TABS] AppTabsLayout rendering
🔵 [TABS] Platform: ios Version: 26.x.x
🔵 [TABS] Glass effects enabled: true
🔵 [TABS] __DEV__: true
🔵 [TABS] Tabs to render: [...]
🔵 [TABS] Rendering trigger for index, hidden=false
🔵 [TABS] Rendering trigger for logs, hidden=false
🔵 [TABS] Rendering trigger for about, hidden=false
🔵 [TABS] Rendering trigger for dev-logs, hidden=false
```

**Look for**:
1. Is the component rendering at all?
2. What's the Platform.Version value?
3. Are all tabs marked as `hidden=false`?
4. Are there any errors or warnings after these logs?

### Step 2: Check for Native Errors

Look in the Xcode console or Metro bundler output for:
- Native module errors
- NativeTabs initialization errors
- react-native-screens errors
- Any UITabBar related errors

### Step 3: Check Navigation Stack

The tab bar might be hidden by incorrect navigation setup. Check if:
1. The Stack navigator is rendering the (tabs) screen correctly
2. The tabs screen has `headerShown: false` (it does)
3. There's no layout issue hiding the tab bar

### Step 4: Check LiquidGlass Wrapper

In `app/_layout.tsx`, there's a LiquidGlassWrapper around the entire app on iOS 26+:

```tsx
if (glassSupported && Platform.OS === "ios") {
  return (
    <LiquidGlassWrapper variant="regular" shape="rect" enableContainer sensorAware>
      {content}
    </LiquidGlassWrapper>
  );
}
```

This might be interfering. **Test**: Comment out this wrapper temporarily to see if tab bar appears.

---

## Possible Issues on iOS 26

### Issue A: Icon Configuration Problem

Even though we're rendering `<Icon sf={tab.icon} />`, the icon prop structure might be wrong:

**Current**:
```tsx
icon: { default: 'newspaper', selected: 'newspaper.fill' }
```

**Expected by Icon component** (from expo-router source):
```tsx
sf: { default: 'newspaper', selected: 'newspaper.fill' }
// OR
sf: 'newspaper'
```

**Fix to Test**:
```tsx
<Icon sf={tab.icon} />
```

This should work because `tab.icon` is already the right structure, but let's verify the Icon component is receiving it correctly.

### Issue B: Hidden Tab Logic Bug

The source code for NativeTabs checks:
```javascript
function shouldTabBeVisible(options) {
    return options.hidden === false;  // Must be EXPLICITLY false!
}
```

If `hidden` is `undefined`, the tab won't show. Our code:
```tsx
const hidden = tab.hideInProduction && (typeof __DEV__ === 'undefined' || !__DEV__);
```

For normal tabs: `hidden = false && ... = false` ✓  
For dev-logs: `hidden = true && ... = true or false` ✓

This should be fine, but the logs will confirm.

### Issue C: NativeTabs Not Mounting

The NativeTabs component might not be rendering at all. Possible causes:

1. **Import Issue**: Maybe the import is broken?
   ```tsx
   import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
   ```
   
2. **Version Mismatch**: expo-router version might not support NativeTabs properly
   - Check: `expo-router@~6.0.9` in package.json ✓

3. **react-native-screens Issue**: The underlying native component might not be working
   - Check: `react-native-screens@~4.16.0` ✓

### Issue D: Tab Bar Position/Visibility

The tab bar might be rendering but:
- Positioned off-screen
- Transparent/invisible
- Behind other content
- Minimized by default

**Test**: Try adding explicit styling:
```tsx
<NativeTabs
  backgroundColor="#FF0000"  // Bright red to make it visible
  minimizeBehavior="never"    // Don't minimize
  // ...
>
```

---

## Quick Tests to Run

### Test 1: Simplest Possible Tabs
Replace the entire AppTabsLayout with:

```tsx
export default function AppTabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" hidden={false}>
        <Label>Tab 1</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logs" hidden={false}>
        <Label>Tab 2</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

If this works → Our configuration is wrong  
If this fails → NativeTabs itself is broken

### Test 2: Standard Tabs Fallback
Replace NativeTabs with standard Tabs:

```tsx
import { Tabs } from 'expo-router';

export default function AppTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Chats' }} />
      <Tabs.Screen name="logs" options={{ title: 'Logs' }} />
      <Tabs.Screen name="about" options={{ title: 'About' }} />
    </Tabs>
  );
}
```

If this works → NativeTabs is the problem  
If this fails → Navigation setup is broken

### Test 3: Remove Glass Wrapper
In `app/_layout.tsx`, comment out the glass wrapper:

```tsx
// if (glassSupported && Platform.OS === "ios") {
//   return (
//     <LiquidGlassWrapper ...>
//       {content}
//     </LiquidGlassWrapper>
//   );
// }

return content;  // Just return content directly
```

If tabs appear → Glass wrapper is interfering  
If tabs still missing → Not a glass issue

---

## What to Report Back

Please share:

1. **Console logs** from the `🔵 [TABS]` markers
2. **Any errors or warnings** in Metro or Xcode console
3. **Screenshot** of the app showing the empty space where tabs should be
4. **Result of Test 2** (standard Tabs) - does it work?

---

## Emergency Rollback

If we can't fix this quickly, use standard Tabs:

```tsx
import { Tabs } from 'expo-router';
import { useLocalization } from '../../../src/i18n/LocalizationProvider';

export default function AppTabsLayout() {
  const { t } = useLocalization();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000' },
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.chats') }} />
      <Tabs.Screen name="logs" options={{ title: t('tabs.logs') }} />
      <Tabs.Screen name="about" options={{ title: t('tabs.about') }} />
      {__DEV__ && (
        <Tabs.Screen name="dev-logs" options={{ title: t('tabs.devLogs') }} />
      )}
    </Tabs>
  );
}
```

This will **100% work** as a fallback.

---

**Next**: Run the app with logging enabled and report the console output.

