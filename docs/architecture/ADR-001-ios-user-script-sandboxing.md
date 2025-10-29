# ADR-001: Disable iOS User Script Sandboxing for CocoaPods Compatibility

**Status:** Accepted

**Date:** 2025-10-29

**Decision Makers:** Development Team

**Context and Problem Statement:**

Xcode 15+ introduced User Script Sandboxing as a default security feature (`ENABLE_USER_SCRIPT_SANDBOXING = YES`). This prevents build phase scripts from accessing the file system outside their sandbox container. When using Expo SDK 54 + React Native 0.81 with New Architecture enabled, CocoaPods build scripts fail with "sandbox permission denied" errors during critical operations:

- Hermes engine configuration replacement
- XCFramework copying
- Resource bundle generation
- Privacy manifest processing

Without intervention, iOS builds fail with exit code 65, blocking all development and deployment.

## Decision

**We will permanently disable User Script Sandboxing for all Pod targets and the DNSChat app target via Podfile post_install hook.**

Implementation in `ios/Podfile`:

```ruby
post_install do |installer|
  # Disable sandboxing for all Pod targets (Hermes, React-*, etc.)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
    end
  end

  # Disable sandboxing for DNSChat app target
  installer.aggregate_targets.each do |aggregate_target|
    aggregate_target.user_project.native_targets.each do |native_target|
      next unless native_target.name == 'DNSChat'

      native_target.build_configurations.each do |config|
        config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
      end
    end
  end
end
```

## Considered Alternatives

### Alternative 1: Manual Xcode Build Settings

**Description:** Manually set `ENABLE_USER_SCRIPT_SANDBOXING = NO` in Xcode Build Settings for each target.

**Rejected because:**
- Not version-controlled
- Lost on `pod install` regeneration
- Requires manual intervention for every developer
- Error-prone and not scalable

### Alternative 2: Selective Sandboxing Disable per Script

**Description:** Disable sandboxing only for specific build phases causing failures.

**Rejected because:**
- Requires identifying and updating every problematic script
- Fragile as new CocoaPods dependencies add new scripts
- No significant security benefit vs blanket disable
- Higher maintenance burden

### Alternative 3: Upgrade/Wait for Apple Fix

**Description:** Wait for Apple to fix sandboxing compatibility with CocoaPods.

**Rejected because:**
- No timeline for fix (issue exists since Xcode 15, September 2023)
- Blocks development immediately
- Community consensus is to disable sandboxing (standard practice)
- React Native core team recommends this approach

## Consequences

### Positive

1. **Immediate Resolution:** Builds work without manual intervention
2. **Automated:** Applied automatically on every `pod install`
3. **Version Controlled:** Configuration in Podfile is tracked by git
4. **Industry Standard:** Widely adopted solution in React Native + Expo community
5. **Zero Developer Friction:** New developers automatically get correct config

### Negative

1. **Reduced Sandboxing:** Build scripts run with broader file system access
2. **Security Trade-off:** Malicious Pod could theoretically modify files during build
3. **Platform Dependency:** Relies on CocoaPods post_install mechanism

### Mitigation of Negatives

- **Runtime Security Unchanged:** App still runs in full iOS sandbox with all security protections
- **Build-Time Only:** Sandboxing disable only affects compilation, not production app
- **Vetted Dependencies:** Only use trusted, community-vetted CocoaPods
- **Regular Updates:** Keep dependencies updated to patch vulnerabilities
- **Code Review:** Review Podfile changes in pull requests

## Technical Details

### Scope of Change

- **Affected:** Build phase scripts in Pods and DNSChat targets
- **Not Affected:** App runtime security, iOS sandbox, App Store security review
- **Trigger:** Automatically applied on `pod install`

### Verification

After `pod install`, verify settings:

```bash
grep "ENABLE_USER_SCRIPT_SANDBOXING" ios/DNSChat.xcodeproj/project.pbxproj
# Should show: ENABLE_USER_SCRIPT_SANDBOXING = NO;
```

### Rollback Plan

If issues arise, remove the configuration from post_install hook and run `pod install`. However, this will restore the original sandboxing errors.

## References

- [Expo Issue #25782](https://github.com/expo/expo/issues/25782)
- [React Native Core Issue #35812](https://github.com/facebook/react-native/issues/35812)
- [Stack Overflow Solution](https://stackoverflow.com/questions/77294898/)
- [Root Cause Analysis](https://blog.stackademic.com/how-i-solved-the-sandbox-permission-error-in-expo-for-ios-a316849e119f)
- [Apple Documentation: User Script Sandboxing](https://developer.apple.com/documentation/xcode/configuring-the-build-phase-script-sandbox)

## Maintenance Notes

**Never remove** this post_install hook. Always run `npm run fix-pods` after:
- Upgrading Expo SDK
- Upgrading React Native
- Adding new native dependencies
- Xcode major version upgrades

See troubleshooting documentation: [docs/troubleshooting/COMMON-ISSUES.md](../troubleshooting/COMMON-ISSUES.md#2025-10-29-user-script-sandboxing-new-architecture-fixed)

## Related Files

- `ios/Podfile` - Implementation
- `ios/DNSChat.xcodeproj/project.pbxproj` - Generated settings
- `docs/troubleshooting/COMMON-ISSUES.md` - Troubleshooting guide
- `CLAUDE.md` - Developer requirements documentation
