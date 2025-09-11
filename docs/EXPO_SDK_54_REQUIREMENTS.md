# Expo SDK 54 Migration Requirements Specification

## Executive Summary

This document specifies the requirements for migrating the DNS Chat project from Expo SDK 54.0.0-preview.16 to the stable Expo SDK 54 release, ensuring full compatibility with React Native 0.81 New Architecture and implementing all available performance and feature improvements.

**Project Status**: Currently on Expo SDK 54.0.0-preview.16 with New Architecture enabled
**Target**: Stable Expo SDK 54 with full React Native 0.81 New Architecture implementation

## 1. Current State Analysis

### 1.1 Project Configuration
- **Expo Version**: 54.0.0-preview.16 (preview build)
- **React Native**: 0.81.1 (latest)
- **React**: 19.1.0 (latest)
- **New Architecture**: Enabled in app.json (`newArchEnabled: true`)
- **iOS Deployment Target**: 16.0
- **Java Version**: 17 (required for Android builds)

### 1.2 Native Modules
- **DNSNative**: Custom Swift/Java DNS resolution module
- **Expo GlassEffect**: Official iOS 26 glass via `expo-glass-effect` (autolinked)
- **react-native-bottom-tabs**: v0.10.0 (New Architecture compatible)
- **react-native-reanimated**: v3.17.4 (Legacy - needs v4 upgrade)

### 1.3 Critical Dependencies
- **Edge-to-Edge**: react-native-edge-to-edge v1.6.0 (configured)
- **Navigation**: React Navigation v7 (New Architecture compatible)
- **Storage**: AsyncStorage v2.1.2 (compatible)
- **Network**: Custom UDP/TCP socket implementations

## 2. Migration Requirements

### 2.1 Core SDK Migration (Priority: P0)

#### 2.1.1 Expo SDK Upgrade
- **REQUIRED**: Upgrade from `expo@54.0.0-preview.16` to `expo@^54.0.0` (stable)
- **Command**: `npx expo install expo@^54.0.0 --fix`
- **Impact**: Stability improvements, bug fixes, performance optimizations

#### 2.1.2 Metro Configuration
- **REQUIRED**: Create metro.config.js for SDK 54 optimizations
- **Features to Enable**:
  - `experimentalImportSupport: true` (default in SDK 54)
  - `experimentalTreeShaking: true`
  - Import stack traces (enabled by default)
  - Live bindings for ECMAScript compliance
- **Performance Impact**: Faster builds, better tree shaking, improved error reporting

#### 2.1.3 Babel Configuration
- **REQUIRED**: Create babel.config.js for React Compiler support
- **Features to Enable**:
  - React Compiler (default in SDK 54 template)
  - Static class block support
  - Import.meta transform (experimental)
- **Performance Impact**: Automatic memoization, better optimization

### 2.2 React Native 0.81 New Architecture (Priority: P0)

#### 2.2.1 Precompiled React Native for iOS
- **FEATURE**: Automatic in SDK 54 for significant build time improvements
- **Requirements**: 
  - Remove `use_frameworks!` if present (incompatible with precompiled frameworks)
  - Ensure Xcode 16.1+ (Xcode 26 recommended)
- **Performance Gain**: 10x faster iOS builds (120s → 10s for clean builds)

#### 2.2.2 Native Module Compatibility
- **CRITICAL**: Verify all custom native modules work with New Architecture
- **DNSNative Module**: 
  - ✅ Already implemented with proper TurboModule interface
  - ✅ iOS CheckedContinuation crash fix implemented
  - ✅ Android thread pool optimization implemented
- **Expo GlassEffect**:
  - ✅ iOS 26 Liquid Glass support provided by Expo (no custom pod)
  - ✅ Autolinked; compatible with precompiled React Native

#### 2.2.3 Reanimated v4 Migration
- **REQUIRED**: Upgrade from v3.17.4 to v4.x for New Architecture
- **Breaking Changes**:
  - Worklets now handled by `react-native-worklets`
  - New Architecture required (Legacy Architecture support removed)
  - Babel configuration changes handled automatically by babel-preset-expo
- **Commands**: 
  ```bash
  npx expo install react-native-reanimated@^4.0.0
  # Remove manual babel.config.js modifications (handled automatically)
  ```

### 2.3 iOS Platform Requirements (Priority: P0)

#### 2.3.1 Xcode and iOS Requirements
- **REQUIRED**: Xcode 16.1 minimum, Xcode 26 recommended
- **iOS Target**: Maintain iOS 16.0 minimum (current: 16.0)
- **Features Available**:
  - iOS 26 Liquid Glass icons and effects (already implemented)
  - Precompiled React Native frameworks
  - Icon Composer support (`.icon` files)

#### 2.3.2 CocoaPods Configuration
- **REQUIRED**: Update Podfile for SDK 54 compatibility
- **Key Changes**:
  - Remove RCT-Folly header workarounds (fixed in 0.81)
  - Update autolinking configuration
  - Ensure DNSNative pod remains compatible (GlassEffect is autolinked)
- **Performance**: Faster pod install with precompiled frameworks

#### 2.3.3 Native Module Updates
- **DNSNative**: 
  - ✅ Already fixed CheckedContinuation crash
  - ✅ Proper NWConnection cleanup implemented
  - 🔄 Verify compatibility with precompiled React Native
- **Expo GlassEffect**:
  - ✅ iOS 26 Liquid Glass effects implemented (official Expo module)
  - ✅ No custom UIKit integration required

### 2.4 Android Platform Requirements (Priority: P0)

#### 2.4.1 Android API and Java Requirements
- **REQUIRED**: Target Android 16 / API 36 (automatic in SDK 54)
- **REQUIRED**: Java 17 (already configured)
- **Edge-to-Edge**: Always enabled, cannot be disabled (breaking change)

#### 2.4.2 Edge-to-Edge Migration
- **BREAKING CHANGE**: Edge-to-edge is mandatory in Android 16
- **Current Status**: ✅ Already configured with react-native-edge-to-edge
- **Required Actions**:
  - Verify edge-to-edge layouts work correctly
  - Update `androidNavigationBar.enforceContrast` in app.json if needed
  - Remove react-native-edge-to-edge plugin if only used for `enforceNavigationBarContrast`

#### 2.4.3 Predictive Back Gesture
- **NEW FEATURE**: Available as opt-in in SDK 54
- **Recommendation**: Enable `android.predictiveBackGestureEnabled: true` in app.json
- **Testing Required**: Verify navigation stack behavior with predictive gestures

#### 2.4.4 Native Module Updates
- **DNSResolver.java**:
  - ✅ Thread pool optimization implemented (bounded 2-4 threads)
  - ✅ OutOfMemory crash prevention implemented
  - 🔄 Verify compatibility with New Architecture TurboModules

### 2.5 Dependencies and Autolinking (Priority: P1)

#### 2.5.1 Enhanced Autolinking
- **NEW FEATURE**: Transitive autolinking for React Native libraries
- **Impact**: Cleaner dependency management, fewer manual installations
- **Required Actions**:
  - Remove redundant dependency installations
  - Test that all native modules link correctly
  - Update documentation for simplified installation

#### 2.5.2 Dependency Upgrades
- **expo-file-system**: Migrate from legacy API to new stable API
- **expo-sqlite**: Consider new localStorage API for web compatibility
- **react-native-safe-area-context**: Update for edge-to-edge compatibility

### 2.6 Development Experience Improvements (Priority: P2)

#### 2.6.1 Expo CLI Enhancements
- **Auto CSS Prefixing**: Enabled by default with lightningcss
- **Import Stack Traces**: Enabled by default (better error reporting)
- **React Compiler**: Enabled by default (automatic memoization)
- **Owner Stacks**: Better error attribution in React components

#### 2.6.2 Metro Enhancements
- **ESM Support**: experimentalImportSupport enabled by default
- **Tree Shaking**: Better dead code elimination
- **Live Bindings**: ECMAScript-compliant import behavior

### 2.7 Testing and Validation (Priority: P0)

#### 2.7.1 DNS Functionality Testing
- **CRITICAL**: Verify all DNS resolution methods work correctly
- **Test Cases**:
  - Native DNS modules (iOS Swift, Android Java)
  - UDP DNS fallback
  - TCP DNS fallback  
  - DNS-over-HTTPS fallback
  - Mock DNS (development)
- **Command**: `node test-dns.js "test message"`

#### 2.7.2 Native Module Testing
- **DNSNative**: Test concurrent DNS operations, memory leaks, crashes
- **Expo GlassEffect**: Test iOS 26 effects via `expo-glass-effect`
- **Platform Testing**: iOS simulator, Android emulator, physical devices

#### 2.7.3 Performance Testing
- **iOS Build Times**: Measure precompiled framework improvements
- **App Performance**: Verify React Compiler optimizations
- **Memory Usage**: Ensure no regressions in resource management

## 3. Implementation Strategy

### 3.1 Phase 1: Core SDK Migration (Day 1)
1. Create new git branch: `expo-sdk-54-stable`
2. Upgrade Expo SDK to stable release
3. Run `npx expo-doctor@latest` for health check
4. Create metro.config.js and babel.config.js
5. Test basic app functionality

### 3.2 Phase 2: Native Module Validation (Day 1-2)
1. Test DNSNative module with New Architecture
2. Validate Expo GlassEffect integration
3. Upgrade Reanimated to v4
4. Verify all native dependencies

### 3.3 Phase 3: Platform-Specific Updates (Day 2-3)
1. Update iOS Podfile for SDK 54
2. Configure Android for API 36
3. Enable predictive back gesture
4. Test edge-to-edge layouts

### 3.4 Phase 4: Testing and Optimization (Day 3-4)
1. Comprehensive DNS functionality testing
2. Performance benchmarking
3. React Compiler verification
4. Build time measurement

### 3.5 Phase 5: Documentation and Cleanup (Day 4-5)
1. Update CHANGELOG.md
2. Update CLAUDE.md instructions
3. Update build scripts
4. Performance comparison documentation

## 4. Success Criteria

### 4.1 Functional Requirements
- ✅ All DNS resolution methods work correctly
- ✅ iOS and Android apps build successfully
- ✅ Native modules function without crashes
- ✅ New Architecture fully enabled and working
- ✅ Edge-to-edge layouts render correctly

### 4.2 Performance Requirements
- ✅ iOS build times improved by >50% (with precompiled React Native)
- ✅ App startup time maintained or improved
- ✅ Memory usage stable or improved
- ✅ No performance regressions

### 4.3 Compatibility Requirements
- ✅ iOS 16.0+ compatibility maintained
- ✅ Android API 29+ compatibility maintained
- ✅ All existing features work identically
- ✅ Development workflow preserved

## 5. Risk Assessment

### 5.1 High Risk
- **Reanimated v4 Migration**: Breaking changes requiring code updates
- **Precompiled React Native**: Potential incompatibilities with custom modules
- **Edge-to-Edge Mandatory**: Layout issues on Android

### 5.2 Medium Risk
- **Metro Configuration**: Build issues if misconfigured
- **React Compiler**: Potential optimization conflicts
- **Autolinking Changes**: Dependency resolution issues

### 5.3 Low Risk
- **Expo SDK Upgrade**: Minimal breaking changes from preview to stable
- **iOS 26 Features**: Backward compatible implementations
- **Performance Improvements**: Additive, not breaking

## 6. Rollback Plan

### 6.1 Emergency Rollback
- Revert to `expo@54.0.0-preview.16`
- Restore original package.json and package-lock.json
- Remove metro.config.js and babel.config.js
- Revert Podfile changes

### 6.2 Partial Rollback Options
- Disable React Compiler: Set environment variable
- Disable New Architecture: Update app.json
- Revert Reanimated: Downgrade to v3.17.4

## 7. Timeline

- **Day 1**: Core SDK migration and basic testing
- **Day 2**: Native module validation and Reanimated upgrade
- **Day 3**: Platform-specific configurations and testing
- **Day 4**: Performance testing and optimization
- **Day 5**: Documentation and final validation

**Total Duration**: 5 days
**Critical Path**: Native module compatibility testing

## 8. Resources Required

### 8.1 Development Environment
- macOS with Xcode 16.1+ (Xcode 26 recommended)
- Java 17 for Android development
- Node.js 20.19.4+
- Latest EAS CLI

### 8.2 Testing Devices
- iOS 16+ device/simulator
- Android API 29+ device/emulator
- Various screen sizes for edge-to-edge testing

### 8.3 Tools and Services
- EAS Build for testing
- Physical devices for final validation
- Performance monitoring tools

---

**Document Version**: 1.0  
**Last Updated**: 2025-09-10  
**Author**: Claude Code  
**Reviewer**: John Carmack (pending)

**Note**: This specification assumes John Carmack's code review standards and emphasizes performance, stability, and technical excellence throughout the migration process.
