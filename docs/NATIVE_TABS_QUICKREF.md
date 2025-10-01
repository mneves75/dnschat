# Native Tabs Migration - Quick Reference

## 🎯 TL;DR

**Recommendation**: ✅ **MIGRATE**  
**Effort**: 8-12 hours (1-2 days)  
**Risk**: Medium  
**ROI**: 4 months payback  
**Status**: Ready to proceed

---

## 📊 Quick Comparison

| Aspect | Custom Tabs | Native Tabs |
|--------|-------------|-------------|
| **Code** | 550 lines | ~80 lines |
| **iOS 26 Features** | Manual | Automatic |
| **Maintenance** | High | Low |
| **API Status** | Stable | Experimental |
| **Migration Time** | N/A | 8-12 hours |

---

## 🚀 Quick Start (After Approval)

```bash
# 1. Create branch
git checkout -b feature/native-tabs-migration

# 2. Replace app/(app)/(tabs)/_layout.tsx with:
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function AppTabsLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <Icon sf="newspaper.fill" />
        <Label>Chats</Label>
      </NativeTabs.Trigger>
      {/* Add other tabs... */}
    </NativeTabs>
  );
}

# 3. Test
npm run ios

# 4. See full plan: docs/NATIVE_TABS_MIGRATION_PLAN.md
```

---

## ✅ What We Get

### iOS 26 Features (Automatic)
- ✨ Native liquid glass tab bar
- 📉 Hide tab bar on scroll down
- 🔍 Native search tab support
- 📱 Auto-positioning (iPhone bottom, iPad top, Vision Pro side)
- 🎨 Dynamic color adaptation

### Code Reduction
- ❌ Delete `GlassTabBar.tsx` (445 lines)
- ❌ Delete `tabHelpers.ts` (43 lines)
- ❌ Simplify `useTabBarPadding.ts` (60 → 10 lines)
- **Total**: -550 lines

---

## ⚠️ Trade-offs

### What We Lose
- Full customization control
- Custom floating position
- Manual color tuning
- Android custom glass (falls back to standard)

### What We Risk
- Experimental API may change
- 8-12 hours migration effort
- Testing across iOS versions needed

---

## 📋 Migration Phases

| Phase | Duration | Goal |
|-------|----------|------|
| 0. Prep | 1-2h | Setup, backups, docs |
| 1. Basic | 3-4h | Replace custom with native |
| 2. Features | 2-3h | Enable iOS 26 features |
| 3. Cleanup | 1-2h | Delete custom code |
| 4. Testing | 2-3h | Full test matrix |
| 5. Docs | 1h | Update documentation |
| **TOTAL** | **10-15h** | **Complete migration** |

---

## 🔄 Code Changes Preview

### Before (Custom)
```tsx
// app/(app)/(tabs)/_layout.tsx - 163 lines
<Tabs
  tabBar={(props) => {
    const { tabs, activeRouteKey } = buildGlassTabs(...);
    return (
      <FloatingGlassTabBar
        tabs={tabs}
        activeTabId={activeRouteKey}
        onTabPress={...}
      />
    );
  }}
>
  <Tabs.Screen
    name="index"
    options={{
      tabBarIcon: ({ color }) => <Image ... />,
    }}
  />
</Tabs>
```

### After (Native)
```tsx
// app/(app)/(tabs)/_layout.tsx - ~40 lines
<NativeTabs minimizeBehavior="onScrollDown">
  <NativeTabs.Trigger name="index">
    <Icon sf="newspaper.fill" />
    <Label>Chats</Label>
  </NativeTabs.Trigger>
</NativeTabs>
```

**Reduction**: 163 → 40 lines (75% smaller)

---

## 🧪 Test Checklist (Phase 4)

```
iOS 26+:
  [ ] Liquid glass effect visible
  [ ] Tab bar minimizes on scroll
  [ ] Dynamic color adaptation works
  [ ] All 3 tabs functional

iOS 17-25:
  [ ] Basic tabs functional
  [ ] Icons render correctly
  [ ] No glass-related crashes

Android:
  [ ] Standard tabs work
  [ ] All features except glass
  [ ] Max 5 tabs (we have 3)

All Platforms:
  [ ] Tab switching smooth
  [ ] Content doesn't overlap
  [ ] Localization works
  [ ] Dev tab hidden in prod
```

---

## 🎯 Decision Criteria

### ✅ GO if:
- iOS 26 features are priority
- Can allocate 8-12 hours
- Want long-term maintenance reduction
- No critical deadline < 2 weeks

### 🛑 NO-GO if:
- Custom features essential
- Cannot allocate testing time
- Production deadline imminent
- Team lacks capacity

---

## 💡 Key Insights

1. **You're already on the right branch** (`ios26-liquid-glass`)
2. **Recent tab bar fixes** show maintenance burden
3. **Expo SDK 54** has native tabs (not bleeding edge)
4. **4-month payback** on time investment
5. **Apple maintains** the implementation going forward

---

## 📞 Support

- **Full Plan**: `docs/NATIVE_TABS_MIGRATION_PLAN.md`
- **Current Implementation**: `src/components/glass/GlassTabBar.tsx`
- **Expo Docs**: https://docs.expo.dev/router/advanced/native-tabs/
- **Questions**: Ping @mvneves or team

---

## 🚦 Current Status

```
┌─────────────────────────────────────┐
│  AWAITING APPROVAL TO PROCEED       │
│                                     │
│  Ready to start immediately after  │
│  current uncommitted changes are   │
│  committed.                        │
│                                     │
│  Estimated completion: 2 days      │
└─────────────────────────────────────┘
```

---

**Last Updated**: October 1, 2025  
**Prepared by**: AI Assistant  
**Review by**: @mvneves

