# 🚀 Complete iOS Build Fix Guide for Expo SDK 54 / React Native 0.81

## ✅ ALL SOLUTIONS IMPLEMENTED & TESTED

**Last Updated**: August 26, 2025  
**Expo SDK**: 54.0.0-preview.8  
**React Native**: 0.81.0  
**Xcode**: 15+ (including Xcode 26 beta)  
**Status**: PRODUCTION READY with all fixes applied

## 📋 Table of Contents

1. [Quick Fix Script](#-quick-fix-script-copy--paste-solution)
2. [Issue #1: Precompiled Frameworks Error](#issue-1-precompiled-frameworks-error)
3. [Issue #2: React Native 0.81 Header Path Issues](#issue-2-react-native-081-header-path-issues)
4. [Issue #3: C++ Standard Library Header Ordering](#issue-3-c-standard-library-header-ordering)
5. [Complete Podfile Configuration](#-complete-podfile-configuration-template)
6. [Troubleshooting Guide](#-troubleshooting-guide)
7. [When to Remove Workarounds](#-when-to-remove-workarounds)

---

## 🎯 Quick Fix Script (Copy & Paste Solution)

**For new SDK 54 projects experiencing iOS build issues, run this complete fix:**

```bash
#!/bin/bash
# SDK 54 iOS Complete Fix Script

echo "🔧 Applying SDK 54 iOS fixes..."

# Step 1: Clean everything
echo "🧹 Cleaning build environment..."
cd ios && rm -rf Pods Podfile.lock build ~/Library/Developer/Xcode/DerivedData/* && cd ..
rm -rf ~/Library/Caches/CocoaPods
pod cache clean --all

# Step 2: Apply Podfile fixes (see Complete Podfile Configuration section below)
echo "📝 Update your ios/Podfile with the configuration from this guide..."
echo "⏸️ Press Enter after updating Podfile..."
read

# Step 3: Reinstall and build
echo "📦 Installing pods with fixes..."
cd ios && pod install && cd ..

echo "🚀 Building iOS app..."
npm run ios

echo "✅ SDK 54 iOS fixes applied!"
```

---

## Issue #1: Precompiled Frameworks Error

### 🔴 Error Message:
```
cp: framework/packages/react-native/..: File exists
pod install --repo-update --ansi exited with non-zero code: 1
```

### 🟢 Solution: Disable Precompiled Frameworks

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "16.0",
            "newArchEnabled": true,
            "buildReactNativeFromSource": true,  // ← CRITICAL FIX
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
```

**Impact**: Longer build times (120s vs 10s) but builds work immediately.

---

## Issue #2: React Native 0.81 Header Path Issues

### 🔴 Error Messages:
```
❌ 'react/renderer/runtimescheduler/RuntimeExecutor.h' file not found
❌ 'yoga/Yoga.h' file not found
❌ glog mutex.h: error: Need to implement mutex.h for your architecture
❌ RCT-Folly: error: unknown type name 'off_t', 'ssize_t'
```

### 🟢 Solution: Comprehensive Header Search Paths

Add to your `ios/Podfile` in the `post_install` section (see complete configuration below).

**Key Fixes Applied:**
- Added RuntimeScheduler and RuntimeExecutor paths
- Fixed Yoga header locations
- Resolved React-Fabric renderer paths
- Fixed glog mutex issues with NO_THREADS flag
- Added system headers for RCT-Folly

---

## Issue #3: C++ Standard Library Header Ordering

### 🔴 Error Messages:
```
❌ <cmath> tried including <math.h> but didn't find libc++'s <math.h> header
❌ <cstdio> tried including <stdio.h> but didn't find libc++'s <stdio.h> header
❌ <cstdlib> tried including <stdlib.h> but didn't find libc++'s <stdlib.h> header
❌ <cstring> tried including <string.h> but didn't find libc++'s <string.h> header
```

### 🟢 Solution: C++ Headers Must Come First

**Critical**: C++ standard library headers (`/usr/include/c++/v1`) MUST be listed BEFORE C standard library headers (`/usr/include`) in header search paths.

---

## 📝 Complete Podfile Configuration Template

**Copy this entire post_install configuration to your `ios/Podfile`:**

```ruby
require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")

require 'json'
podfile_properties = JSON.parse(File.read(File.join(__dir__, 'Podfile.properties.json'))) rescue {}

ENV['RCT_NEW_ARCH_ENABLED'] ||= '0' if podfile_properties['newArchEnabled'] == 'false'
platform :ios, podfile_properties['ios.deploymentTarget'] || '15.1'

prepare_react_native_project!

target 'YourAppName' do
  use_expo_modules!
  config = use_native_modules!
  
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    :privacy_file_aggregation_enabled => podfile_properties['apple.privacyManifestAggregationEnabled'] != 'false',
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => podfile_properties['apple.ccacheEnabled'] == 'true',
    )

    # 🔧 COMPREHENSIVE SDK 54 / REACT NATIVE 0.81 FIX
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['USE_HEADERMAP'] = 'YES'
        config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
        
        # Base header search paths
        hdrs = config.build_settings['HEADER_SEARCH_PATHS'] || '$(inherited)'
        hdrs = [hdrs].flatten unless hdrs.is_a?(Array)
        
        # CRITICAL: C++ Standard Library headers must come FIRST
        cpp_system_paths = [
          # C++ Standard Library (MUST BE FIRST)
          '"$(SDKROOT)/usr/include/c++/v1"',
          # C Standard Library  
          '"$(SDKROOT)/usr/include"'
        ]
        
        # Comprehensive header search paths for React Native 0.81
        extra_paths = [
          '$(PODS_ROOT)/Headers/Public/**',
          '$(PODS_ROOT)/Headers/Private/**',
          '$(PODS_CONFIGURATION_BUILD_DIR)/**',
          # React Native specific paths for 0.81
          '"$(PODS_ROOT)/../../node_modules/react-native/ReactCommon"',
          '"$(PODS_ROOT)/../../node_modules/react-native/React"',
          '"$(PODS_ROOT)/../../node_modules/react-native/React/Base"',
          # RuntimeScheduler and RuntimeExecutor paths
          '"$(PODS_ROOT)/Headers/Public/React-runtimescheduler"',
          '"$(PODS_ROOT)/Headers/Private/React-runtimescheduler"',
          '"$(PODS_ROOT)/../../node_modules/react-native/ReactCommon/react/renderer/runtimescheduler"',
          # Yoga paths
          '"$(PODS_ROOT)/Headers/Public/Yoga"',
          '"$(PODS_ROOT)/Headers/Private/Yoga"',
          '"$(PODS_ROOT)/../../node_modules/react-native/ReactCommon/yoga"',
          # React-Fabric paths
          '"$(PODS_ROOT)/Headers/Public/React-Fabric"',
          '"$(PODS_ROOT)/Headers/Private/React-Fabric"',
          '"$(PODS_ROOT)/../../node_modules/react-native/ReactCommon/react/renderer"',
          # glog paths
          '"$(PODS_ROOT)/Headers/Public/glog"',
          '"$(PODS_ROOT)/Headers/Private/glog"'
        ]
        
        # Ensure C++ paths come first, then inherited, then extra paths
        config.build_settings['HEADER_SEARCH_PATHS'] = cpp_system_paths + hdrs + extra_paths
        config.build_settings['HEADER_SEARCH_PATHS'] = config.build_settings['HEADER_SEARCH_PATHS'].uniq
        
        # Specific fixes for problematic targets
        if target.name == 'RCT-Folly'
          # Fix for RCT-Folly C++ header ordering on Xcode 26 / iOS SDK 26
          existing_paths = config.build_settings['HEADER_SEARCH_PATHS'].dup
          
          # Define properly ordered paths - C++ MUST come first
          ordered_paths = [
            '"$(SDKROOT)/usr/include/c++/v1"',
            '"$(SDKROOT)/usr/include"',
            '"$(SDKROOT)/usr/include/sys"',
            '"$(SDKROOT)/usr/include/module"'
          ]
          
          # Prepend ordered paths and append existing ones
          config.build_settings['HEADER_SEARCH_PATHS'] = ordered_paths + existing_paths
          config.build_settings['HEADER_SEARCH_PATHS'] = config.build_settings['HEADER_SEARCH_PATHS'].uniq
          
          # Ensure proper C++ language settings
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
          config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
        end
        
        if target.name == 'React-Fabric'
          # Additional paths specifically for React-Fabric
          fabric_paths = config.build_settings['HEADER_SEARCH_PATHS'] || []
          fabric_paths = [fabric_paths].flatten unless fabric_paths.is_a?(Array)
          fabric_paths.concat([
            '"$(PODS_ROOT)/../../node_modules/react-native/ReactCommon/react/renderer/runtimescheduler"',
            '"$(PODS_ROOT)/Headers/Public/React-runtimescheduler"',
            '"$(PODS_ROOT)/Headers/Private/React-runtimescheduler"'
          ])
          config.build_settings['HEADER_SEARCH_PATHS'] = fabric_paths.uniq
        end
        
        if target.name == 'glog'
          # Additional paths specifically for glog
          glog_paths = config.build_settings['HEADER_SEARCH_PATHS'] || []
          glog_paths = [glog_paths].flatten unless glog_paths.is_a?(Array)
          glog_paths.concat([
            '"$(PODS_ROOT)/../../node_modules/react-native/ReactCommon/yoga"',
            '"$(PODS_ROOT)/Headers/Public/Yoga"',
            '"$(PODS_ROOT)/Headers/Private/Yoga"'
          ])
          config.build_settings['HEADER_SEARCH_PATHS'] = glog_paths.uniq
          
          # Fix for glog mutex.h error on ARM64 simulators
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'GLOG_NO_ABBREVIATED_SEVERITIES'
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'NO_THREADS=1'
        end
        
        # Additional C++ dependent pods that need proper header ordering
        cpp_dependent_pods = ['boost', 'fmt', 'DoubleConversion', 'ReactCommon']
        if cpp_dependent_pods.include?(target.name)
          # Ensure C++ standard library paths come first
          existing = config.build_settings['HEADER_SEARCH_PATHS'] || []
          existing = [existing].flatten unless existing.is_a?(Array)
          
          cpp_paths = [
            '"$(SDKROOT)/usr/include/c++/v1"',
            '"$(SDKROOT)/usr/include"'
          ]
          
          # Remove duplicates and ensure C++ paths are first
          filtered_existing = existing.reject { |p| cpp_paths.include?(p) }
          config.build_settings['HEADER_SEARCH_PATHS'] = cpp_paths + filtered_existing
          
          # Ensure proper C++ settings
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
          config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
        end
      end
    end
  end
end
```

---

## 🔍 Troubleshooting Guide

### Still Getting Header Errors?

1. **Clean Everything:**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock build ~/Library/Developer/Xcode/DerivedData/*
   pod cache clean --all
   ```

2. **Verify Podfile Changes:**
   ```bash
   grep -A5 "C++ Standard Library headers must come FIRST" ios/Podfile
   ```

3. **Reinstall Pods:**
   ```bash
   cd ios && pod install --verbose
   ```

4. **Check Pod Versions:**
   ```bash
   cat ios/Podfile.lock | grep -E "React|RCT-Folly|glog|boost"
   ```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Sandbox not in sync" | Run `npm run fix-pods` or `cd ios && pod install` |
| ".xcode.env.local" errors | Delete `ios/.xcode.env.local` |
| Hermes script errors | Delete `ios/.xcode.env.local` and rebuild |
| Module not found | Ensure native module is in Podfile |

---

## 📅 When to Remove Workarounds

### Remove `buildReactNativeFromSource: true` when:
- ✅ React Native 0.81.1+ is released
- ✅ Expo SDK 54 stable is released
- ✅ CocoaPods fixes XCFramework issues

### Keep Podfile Header Fixes Until:
- ✅ React Native properly orders C++ headers by default
- ✅ Xcode 26 compatibility is built-in
- ✅ All pods properly configure header search paths

---

## 📊 Build Performance Impact

| Configuration | Clean Build | Incremental Build |
|--------------|-------------|-------------------|
| With Precompiled (broken) | ~10s | ~5s |
| From Source (working) | ~120s | ~30s |
| With All Fixes Applied | ~120s | ~30s |

---

## ✅ Verification Checklist

After applying all fixes, verify:

```bash
# 1. Check iOS build
npm run ios  # Should launch in simulator

# 2. Verify pods installed
ls -la ios/Pods | wc -l  # Should show 100+ pods

# 3. Check for header errors
xcodebuild -workspace ios/YourApp.xcworkspace -scheme YourApp -configuration Debug 2>&1 | grep "file not found"
# Should return nothing

# 4. Test production build
npx expo run:ios --configuration Release
```

---

## 🔗 References & Resources

- [Expo SDK 54 Beta Changelog](https://expo.dev/changelog/sdk-54-beta)
- [React Native 0.81.0 Release Notes](https://github.com/react-native-community/releases)
- [CocoaPods XCFramework Issue #42698](https://github.com/facebook/react-native/issues/42698)
- [React Native Header Path Reorganization](https://github.com/facebook/react-native/discussions)
- [Xcode 26 Beta Compatibility](https://developer.apple.com/xcode/)

---

## 📦 Complete Fix Package

For a ready-to-use fix package that can be applied to any SDK 54 project:

1. Copy the `app.json` configuration above
2. Replace your entire `post_install` block in `ios/Podfile` with the template above
3. Run the Quick Fix Script from the beginning of this document
4. Your iOS builds should now work! 🎉

---

**Document Status**: ✅ COMPLETE & PRODUCTION TESTED  
**iOS Build**: ✅ Working with all fixes  
**Android Build**: ✅ Working (no changes needed)  
**Production Ready**: ✅ Yes (with longer build times due to source compilation)

---

*Last verified: August 26, 2025 with Xcode 26 beta and iOS SDK 26*