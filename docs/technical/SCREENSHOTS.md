# App Store Screenshot Generation

This document describes how to generate App Store screenshots for DNSChat using Fastlane snapshot.

## Overview

DNSChat uses Fastlane's `snapshot` tool to automatically generate screenshots for the App Store across multiple devices, languages, and orientations.

## Prerequisites

- Xcode 15+ installed
- Fastlane 2.228+ installed (already available globally)
- DNSChatUITests target added to Xcode project
- iOS Simulators installed (iPhone 16 Pro Max, iPhone 16 Plus, iPad Pro 13")

## Quick Start

```bash
# From project root
cd ios

# Generate all screenshots
fastlane screenshots

# Clean build and generate screenshots
fastlane clean_screenshots
```

## Configuration

### Devices and Languages

Screenshots are generated for:

**Devices:**
- iPhone 16 Pro Max (6.9" display) - 1320 x 2868 px
- iPhone 16 Plus (6.7" display) - 1290 x 2796 px
- iPad Pro 13-inch (M4) - 2048 x 2732 px

**Languages:**
- English (US) - `en-US`
- Portuguese (Brazil) - `pt-BR`

**Dark Mode:**
- Hero screens only (Chat conversation and Chat list)

### Fastlane Files

#### `ios/fastlane/Snapfile`

Configures screenshot generation:
- Device list
- Language list
- Launch arguments (`-SCREENSHOT_MODE 1`)
- Output directory (`ios/fastlane/screenshots/`)

#### `ios/fastlane/Fastfile`

Defines lanes:
- `screenshots` - Generate all screenshots
- `screenshots_with_frames` - Generate with device frames
- `clean_screenshots` - Clean derived data first

#### `ios/fastlane/Appfile`

App identifier and Apple ID configuration.

## Screenshot Test Cases

The `DNSChatUITests` target includes the following test methods:

1. **testOnboardingWelcome** - Welcome screen with feature highlights
2. **testChatConversation** - Chat screen with messages (light mode)
3. **testChatConversationDark** - Chat screen with messages (dark mode)
4. **testChatList** - Conversation list (light mode)
5. **testChatListDark** - Conversation list (dark mode)
6. **testDNSLogs** - DNS query logs with methods
7. **testSettings** - Settings screen
8. **testAbout** - About screen with app info

Each test:
- Waits for React Native to initialize (15 seconds timeout)
- Navigates to the target screen
- Waits for UI to stabilize (2 seconds)
- Captures screenshot with `snapshot("ScreenName")`

## Screenshot Mode (Mock Data)

**Status:** Partially Implemented

When launched with `-SCREENSHOT_MODE 1`, the app should:
1. Detect screenshot mode via `isScreenshotMode()` utility
2. Load predefined mock conversations via `getMockConversations()`
3. Load predefined DNS logs via `getMockDNSLogs()`
4. Disable real DNS queries

**Implementation File:** `src/utils/screenshotMode.ts`

**TODO:** Integrate screenshot mode into:
- `src/context/ChatContext.tsx` - Load mock conversations
- `src/services/dnsLogService.ts` - Load mock DNS logs
- Disable `DNSService` when in screenshot mode

## Accessibility Identifiers

All screens have `testID` props for UI test discovery:

- Chat screen: `chat-screen`
- Message list: `message-list`
- Chat input: `chat-input`
- Chat list: `chat-list`
- Logs screen: `logs-screen`
- Settings screen: `settings-screen`
- About screen: `about-screen`
- Onboarding welcome: `onboarding-welcome`
- Tab bar: `tab-bar`

## Output Structure

```
ios/fastlane/screenshots/
├── en-US/
│   ├── iPhone 16 Pro Max/
│   │   ├── 01-Onboarding-Welcome.png
│   │   ├── 02-Chat-Conversation.png
│   │   ├── 03-Chat-Conversation-Dark.png
│   │   ├── 04-Chat-List.png
│   │   ├── 05-Chat-List-Dark.png
│   │   ├── 06-DNS-Logs.png
│   │   ├── 07-Settings.png
│   │   └── 08-About.png
│   ├── iPhone 16 Plus/
│   │   └── [same files]
│   └── iPad Pro 13-inch (M4)/
│       └── [same files]
└── pt-BR/
    └── [same structure]
```

## Troubleshooting

### React Native Not Loading

If tests fail with "React Native failed to initialize":
- Increase timeout in `DNSChatUITests.swift` (line 16)
- Check Metro bundler is running
- Verify Xcode scheme includes UITest target

### Screenshots Not Captured

If `snapshot()` doesn't generate screenshots:
- Verify Fastlane is installed: `fastlane --version`
- Check `DNSChatUITests` is added to scheme test targets
- Ensure simulators are installed and booted

### Simulator Timeouts

If simulators timeout during screenshot generation:
- Set `concurrent_simulators: false` in Snapfile
- Increase simulator boot timeout
- Close other resource-intensive apps

### Wrong Language Captured

If screenshots show wrong language:
- Verify language codes in Snapfile (`en-US`, `pt-BR`)
- Check app supports the language in app.json
- Restart simulators between language runs

## Manual Xcode Integration

If the Ruby script fails to add the UITests target:

1. Open `DNSChat.xcodeproj` in Xcode
2. File > New > Target
3. Select "UI Testing Bundle"
4. Product Name: `DNSChatUITests`
5. Target to be Tested: `DNSChat`
6. Finish
7. Delete the generated `DNSChatUITests.swift` file
8. Add existing `ios/DNSChatUITests/DNSChatUITests.swift` to the target
9. Edit scheme > Test > Add DNSChatUITests

## Best Practices

1. **Clean Simulators:** Erase simulators before screenshot runs to ensure consistent state
2. **Mock Data:** Always use mock data for consistent, professional screenshots
3. **Test on Device:** Verify visual accuracy on physical device before submitting
4. **Version Consistency:** Generate screenshots for each App Store submission
5. **Light and Dark:** Capture both themes for hero screens to showcase design

## Future Enhancements

- [ ] Complete screenshot mode integration in ChatContext
- [ ] Complete screenshot mode integration in DNSLogService
- [ ] Add device frame support with `frameit`
- [ ] Add marketing text overlays for screenshots
- [ ] Generate App Store preview videos
- [ ] Automate screenshot upload with `deliver`

## References

- [Fastlane snapshot documentation](https://docs.fastlane.tools/actions/snapshot/)
- [App Store screenshot requirements](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/)
- [XCUITest documentation](https://developer.apple.com/documentation/xctest/user_interface_tests)

## Maintenance

**Always run screenshot generation before each App Store submission.**

When to regenerate screenshots:
- Major UI redesigns
- New features visible in screenshots
- iOS version upgrades
- Language updates or additions
- Liquid Glass design changes
