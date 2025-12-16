# DNS Chat v3.0.2 - Release Notes

## What's New in This Version

**iOS 26 Liquid Glass Redesign**
Experience DNS Chat like never before with our complete UI transformation following Apple's latest iOS 26 Liquid Glass design language. Every pixel has been crafted to deliver stunning visual depth with native glass effects, SF Pro typography, and fluid 60fps animations.

**Comprehensive VoiceOver Accessibility**
We've achieved world-class accessibility with full VoiceOver support across all onboarding screens. Every button, input, and interactive element now includes proper accessibility roles, labels, and hints - validated by 22 automated tests.

**Simplified DNS Configuration**
Settings have been streamlined in v3 with intelligent defaults. The app now automatically manages your DNS transport priority (Native → UDP → TCP) without manual configuration. DNS-over-HTTPS has been removed to simplify the experience.

**Immersive Haptic Feedback**
Feel your app interactions with native iOS haptic feedback. Success vibrations for completed queries, error haptics for failures, and subtle selection feedback for every button press create a more tactile, engaging experience.

**Critical Bug Fixes**
- Fixed memory leak in WelcomeScreen causing animation cleanup issues
- Resolved race condition in FirstChatScreen affecting message sending
- Corrected hardcoded transparent colors throughout the app
- Fixed OnboardingContainer dark mode StatusBar theme bug

**Enhanced Color System**
Added semantic `palette.transparent` constant for consistent transparency handling across light and dark modes, eliminating hardcoded color values.

---

## Technical Improvements

- React Native 0.81 with New Architecture (Fabric) enabled
- React 19.1 with React Compiler for automatic optimization
- iOS Network.framework DNS resolver (native Swift implementation)
- 17-style SF Pro typography system
- Settings v3 migration with automatic upgrade
- expo-haptics v15 integration
- Enhanced AsyncStorage persistence

## Requirements

- iOS 16.0 or later
- 10 MB download

Thank you for using DNS Chat! Your privacy matters.

---
**Character Count:** ~1950 (well within App Store Connect limit)

