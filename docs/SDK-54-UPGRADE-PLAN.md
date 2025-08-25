# Expo SDK 54 Upgrade Implementation Plan

## Document Version
- **Created**: August 25, 2025
- **Author**: DNSChat Development Team
- **Status**: In Progress
- **Target SDK**: Expo SDK 54.0.0-preview.6

## Executive Summary
This document outlines the comprehensive plan to upgrade DNSChat from Expo SDK 53 to SDK 54, addressing all compatibility issues, dependency updates, and necessary code modifications.

## Current State Analysis

### Current Configuration
- **Expo SDK**: 53.x → 54.0.0-preview.6
- **React Native**: 0.79.5 → 0.81.0
- **React**: 18.3.1 → 19.1.0
- **Node**: 18.x or higher
- **Platform Support**: iOS, Android, Web

### Critical Dependencies
- `react-native-udp`: 4.1.7 (unmaintained, high risk)
- `react-native-tcp-socket`: 6.3.0 (untested with New Architecture)
- `dns-packet`: 5.6.1 (compatible)
- Native DNS modules (custom implementation)

## Upgrade Strategy

### Phase 1: Pre-Upgrade Preparation (15 minutes)
1. **Backup Current State**
   - Create git branch: `feature/sdk-54-upgrade`
   - Document current working features
   - Export critical configurations

2. **Clean Environment**
   ```bash
   # Clean all caches and build artifacts
   rm -rf node_modules
   rm -rf ios android
   rm -rf .expo
   rm -rf ~/Library/Developer/Xcode/DerivedData/DNSChat-*
   npx expo-doctor --clear-cache
   ```

3. **Dependency Audit**
   - Identify deprecated packages
   - Find replacement libraries
   - Document breaking changes

### Phase 2: Core Upgrade (30 minutes)

1. **Update Core Dependencies**
   ```bash
   # Install exact SDK 54 preview version
   npm install expo@54.0.0-preview.6
   npm install react@19.1.0 react-native@0.81.0
   
   # Fix other dependencies
   npx expo install --fix
   ```

2. **Update Configuration Files**
   
   **app.json modifications:**
   - Remove deprecated fields:
     - `ios.deploymentTarget` (move to expo-build-properties)
     - `ios.liquidGlassIcon` (custom field)
     - `android.targetSdkVersion` (deprecated)
     - `android.edgeToEdge` (move to plugin)
     - `android.predictiveBackGesture` (move to plugin)

   **expo-build-properties plugin:**
   ```json
   {
     "plugins": [
       ["expo-build-properties", {
         "ios": {
           "deploymentTarget": "16.0",
           "newArchEnabled": true
         },
         "android": {
           "targetSdkVersion": 36,
           "newArchEnabled": true
         }
       }]
     ]
   }
   ```

3. **TypeScript Configuration**
   - Enable strict React Native typings
   - Update tsconfig.json for TypeScript 5.9 compatibility

### Phase 3: Address Breaking Changes (45 minutes)

1. **React 19 Migration**
   - Review all component lifecycle methods
   - Update any deprecated React patterns
   - Test concurrent features compatibility

2. **Network Libraries Mitigation**
   
   **Option A: Maintain Current Libraries (Short-term)**
   - Add error boundaries around UDP/TCP components
   - Enhance HTTPS fallback as primary
   - Implement health checks for network modules
   
   **Option B: Migration to Maintained Libraries (Recommended)**
   - Replace `react-native-udp` with native implementation
   - Consider `react-native-tcp` as alternative
   - Prioritize built-in fetch API where possible

3. **iOS Build Issues**
   
   **Known CocoaPods XCFramework Issue:**
   ```bash
   # Workaround for preview builds
   cd ios
   rm -rf Pods build Podfile.lock
   rm -rf ~/Library/Caches/CocoaPods
   pod cache clean --all
   
   # Manual framework setup if needed
   mkdir -p Pods/ReactNativeDependencies/framework/packages/react-native
   pod install --repo-update
   ```

4. **Android Compatibility**
   - Update to Android 16 target
   - Test Material Design 3 components
   - Verify edge-to-edge display

### Phase 4: Feature Verification (30 minutes)

1. **Core Features Testing**
   - [ ] DNS query via native module
   - [ ] DNS over HTTPS fallback
   - [ ] DNS over UDP (monitor for crashes)
   - [ ] DNS over TCP (monitor for crashes)
   - [ ] Mock DNS service
   - [ ] Debug logging system
   - [ ] Settings persistence
   - [ ] Chat history storage

2. **UI/UX Testing**
   - [ ] Liquid Glass components (iOS 26)
   - [ ] Dark/Light theme switching
   - [ ] Keyboard handling
   - [ ] Navigation flows
   - [ ] Export functionality

3. **Platform-Specific Testing**
   - [ ] iOS Simulator (various versions)
   - [ ] iOS Device (if available)
   - [ ] Android Emulator
   - [ ] Android Device (if available)
   - [ ] Web browser

### Phase 5: Optimization (20 minutes)

1. **Performance Improvements**
   - Enable async requires (default in SDK 54)
   - Utilize TextDecoderStream for streaming
   - Implement React 19 concurrent features

2. **Bundle Size Optimization**
   - Remove unused dependencies
   - Enable tree shaking
   - Analyze with Metro bundler

3. **Build Time Optimization**
   - Leverage precompiled iOS frameworks
   - Enable ccache for Android
   - Configure incremental builds

## Risk Mitigation

### High-Risk Areas

1. **Network Libraries (CRITICAL)**
   - **Risk**: Unmaintained UDP/TCP libraries may crash
   - **Mitigation**: 
     - Wrap in try-catch blocks
     - Implement circuit breaker pattern
     - Default to HTTPS method
     - Add comprehensive logging

2. **iOS Build Failures (HIGH)**
   - **Risk**: CocoaPods XCFramework copying issue
   - **Mitigation**:
     - Document manual workarounds
     - Prepare rollback plan
     - Test on multiple machines

3. **React 19 Compatibility (MEDIUM)**
   - **Risk**: Breaking changes in component lifecycle
   - **Mitigation**:
     - Thorough testing of all components
     - Review React 19 migration guide
     - Use React DevTools profiler

### Rollback Plan

If critical issues arise:
1. `git checkout main`
2. `rm -rf node_modules ios android`
3. `npm install`
4. `npx expo prebuild`

## Implementation Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Pre-Upgrade Preparation | 15 min | ⏳ Pending |
| Core Upgrade | 30 min | ⏳ Pending |
| Address Breaking Changes | 45 min | ⏳ Pending |
| Feature Verification | 30 min | ⏳ Pending |
| Optimization | 20 min | ⏳ Pending |
| **Total** | **2.5 hours** | - |

## Success Criteria

- ✅ All core DNS methods functional
- ✅ No regression in existing features
- ✅ iOS and Android builds successful
- ✅ Performance metrics maintained or improved
- ✅ Zero critical errors in production

## Post-Upgrade Tasks

1. Update documentation
2. Update CHANGELOG.md
3. Notify team of changes
4. Monitor error tracking for 48 hours
5. Prepare hotfix plan if needed

## Known Issues & Workarounds

### Issue 1: CocoaPods XCFramework
**Error**: `cp: framework/packages/react-native/..: File exists`
**Workaround**: Clean build and manual framework setup (see Phase 3)

### Issue 2: react-native-udp Compatibility
**Error**: Potential crash with New Architecture
**Workaround**: Use native DNS or HTTPS as primary methods

### Issue 3: Web Bundle Errors
**Error**: Importing native-only modules
**Workaround**: Platform-specific imports with `.native.ts` and `.web.ts`

## References

- [Expo SDK 54 GitHub](https://github.com/expo/expo/tree/sdk-54)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54-beta)
- [React 19 Migration Guide](https://react.dev/blog/2024/12/05/react-19)
- [React Native 0.81 Release Notes](https://github.com/react-native-community/releases)

## Appendix: Command Reference

```bash
# Clean everything
npm run clean-all

# Upgrade to SDK 54
npm install expo@54.0.0-preview.6 react@19.1.0 react-native@0.81.0

# Fix dependencies
npx expo install --fix

# iOS build
npm run clean-ios
npm run ios

# Android build
npm run android

# Run tests
node test-sdk54-compatibility.js
node test-debug-logging.js
```

---

**Document Status**: Ready for Implementation
**Next Step**: Execute Phase 1 - Pre-Upgrade Preparation