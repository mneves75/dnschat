# DNSChat Fastlane Screenshot Automation

Automated App Store screenshot generation using Fastlane + AXe CLI.

## Overview

This automation captures all required App Store screenshots across multiple device sizes and appearance modes:

**iPhone Screenshots** (5 screens × 4 device sizes = 20 screenshots):
- Chat Empty State
- Chat Active Conversation
- Chat List
- Settings
- About

**iPad Screenshots** (3 screens × 2 device sizes = 6 screenshots):
- Chat Landscape
- Settings Landscape
- About Landscape

**Appearance Modes**:
- Light Mode
- Dark Mode

## Prerequisites

### 1. Install Fastlane

```bash
# Already installed at /usr/local/bin/fastlane
fastlane --version
```

### 2. Install AXe CLI

```bash
# Already installed at /opt/homebrew/bin/axe
axe --version
```

### 3. Required Simulators

All required simulators must exist before running automation:

```bash
# Check for required simulators
xcrun simctl list devices | grep -E "(iPhone 16 Pro Max|iPhone 16 Pro|iPhone 16 \(|iPhone SE \(3rd|iPad Pro 13-inch \(M4\)|iPad Pro 11-inch \(M4\))"
```

**Required Simulators**:
- iPhone 16 Pro Max (2868×1320px)
- iPhone 16 Pro (2622×1206px)
- iPhone 16 (2556×1179px)
- iPhone SE (3rd generation) (1334×750px)
- iPad Pro 13-inch (M4) (2064×2752px)
- iPad Pro 11-inch (M4) (1668×2388px)

### 4. Build the App

The app must compile successfully before generating screenshots:

```bash
# From project root
npm run ios
```

## Quick Start

### Test with One Device

Test the automation with iPhone 16 Pro Max only:

```bash
cd ios
fastlane screenshots_test
```

This will:
1. Boot iPhone 16 Pro Max simulator
2. Build and install app
3. Capture 5 screenshots in light mode
4. Capture 5 screenshots in dark mode
5. Save screenshots to `./screenshots/`

### Generate All Screenshots

Generate complete App Store screenshot set:

```bash
cd ios
fastlane screenshots
```

This will:
1. Process all 6 device sizes sequentially
2. Boot each simulator automatically
3. Build and install app once per device
4. Capture screenshots in light and dark modes
5. Organize screenshots by device size and appearance

**Estimated time**: 45-60 minutes (includes build time per device)

## Output Structure

Screenshots are organized in `./screenshots/` directory:

```
screenshots/
├── iPhone-6.9/          # iPhone 16 Pro Max
│   ├── light/
│   │   ├── 1_chat_empty.png
│   │   ├── 2_chat_active.png
│   │   ├── 3_chat_list.png
│   │   ├── 4_settings.png
│   │   └── 5_about.png
│   └── dark/
│       ├── 1_chat_empty.png
│       ├── 2_chat_active.png
│       ├── 3_chat_list.png
│       ├── 4_settings.png
│       └── 5_about.png
├── iPhone-6.3/          # iPhone 16 Pro
│   └── ...
├── iPhone-6.1/          # iPhone 16
│   └── ...
├── iPhone-4.7/          # iPhone SE
│   └── ...
├── iPad-13/             # iPad Pro 13-inch
│   └── ...
└── iPad-11/             # iPad Pro 11-inch
    └── ...
```

## How It Works

### 1. Fastfile (Main Automation)

`Fastfile` orchestrates the entire screenshot generation:

- **Device Management**: Finds, boots, and configures simulators
- **App Installation**: Builds and installs app for each device
- **Appearance Control**: Switches between light/dark modes
- **Screenshot Capture**: Coordinates navigation and capture

### 2. Navigation Scripts

`scripts/navigate_*.sh` use AXe CLI to navigate the app:

- `navigate_chat_empty.sh` - Navigate to empty chat state
- `navigate_chat_active.sh` - Send messages to create active chat
- `navigate_chat_list.sh` - Navigate to chat list
- `navigate_settings.sh` - Navigate to settings screen
- `navigate_about.sh` - Navigate to about screen
- `navigate_chat_landscape.sh` - Chat in landscape (iPad)
- `navigate_settings_landscape.sh` - Settings in landscape (iPad)
- `navigate_about_landscape.sh` - About in landscape (iPad)

### 3. AXe CLI Commands Used

- `axe describe-ui` - Get UI hierarchy (find elements)
- `axe tap` - Tap buttons, tabs, text fields
- `axe type` - Type text into fields
- `axe screenshot` - Capture simulator screenshot
- `axe launch` - Launch app with bundle ID

## Troubleshooting

### App Build Fails

```bash
# Clean build artifacts
cd ios
rm -rf build/ Pods/
pod install

# Try building manually
npm run ios
```

### Simulator Not Found

```bash
# List all available simulators
xcrun simctl list devices

# Create missing simulator (example for iPhone SE)
xcrun simctl create "iPhone SE (3rd generation)" \
    "com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation" \
    "com.apple.CoreSimulator.SimRuntime.iOS-18-6"
```

### Navigation Script Fails

Navigation scripts use accessibility labels to find UI elements. If the app UI changes:

1. Run `axe describe-ui --udid <UDID>` to see current UI hierarchy
2. Update script to match new element labels
3. Test navigation manually with AXe commands

Example:
```bash
# Boot simulator and launch app
xcrun simctl boot <UDID>
axe launch --bundle-id com.mvneves.dnschat --udid <UDID>

# Inspect UI
axe describe-ui --udid <UDID>

# Test tap
axe tap --text "Settings" --udid <UDID>
```

### AXe Screenshot Fails

Check AXe is installed and accessible:

```bash
which axe
axe --version
```

### Fastlane Ruby Errors

Ensure correct Ruby version:

```bash
ruby --version  # Should be 2.6.0 or higher
gem list fastlane
```

## Manual Verification

After automation completes:

1. **Check Screenshot Count**:
   ```bash
   find screenshots/ -name "*.png" | wc -l
   # Expected: 52 screenshots (26 light + 26 dark)
   ```

2. **Verify Appearance Modes**:
   - Light mode screenshots should show light backgrounds
   - Dark mode screenshots should show dark backgrounds
   - Glass effects should be visible in both modes

3. **Check iOS 26 HIG Compliance**:
   - Transparent glass backgrounds (not solid white/black)
   - Semantic colors adapting to light/dark
   - SF Pro typography (title2, subheadline)
   - LiquidGlassSpacing system used

4. **Verify Screenshot Dimensions**:
   ```bash
   # Check iPhone 16 Pro Max dimensions (should be 2868×1320)
   sips -g pixelWidth -g pixelHeight screenshots/iPhone-6.9/light/1_chat_empty.png
   ```

## Customization

### Add New Screen

1. Create navigation script:
   ```bash
   cd ios/fastlane/scripts
   cp navigate_chat_empty.sh navigate_new_screen.sh
   # Edit navigate_new_screen.sh with navigation logic
   chmod +x navigate_new_screen.sh
   ```

2. Update Fastfile:
   ```ruby
   screens = ["chat_empty", "chat_active", "chat_list", "settings", "about", "new_screen"]
   ```

### Change Device Sizes

Edit `Fastfile` `IPHONE_DEVICES` or `IPAD_DEVICES` arrays:

```ruby
IPHONE_DEVICES = [
  {
    name: "iPhone 15 Pro Max",  # Change device name
    udid: nil,
    width: 2796,                 # Update dimensions
    height: 1290,
    folder: "iPhone-6.7"         # Update folder name
  }
]
```

### Skip Specific Devices

Comment out devices in `Fastfile`:

```ruby
IPHONE_DEVICES = [
  # { name: "iPhone SE (3rd generation)", ... }, # Skip iPhone SE
  { name: "iPhone 16 Pro Max", ... },
]
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Generate Screenshots
on:
  workflow_dispatch:

jobs:
  screenshots:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: |
          npm install
          brew install axe

      - name: Setup simulators
        run: |
          xcrun simctl create "iPhone SE (3rd generation)" \
            "com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation" \
            "com.apple.CoreSimulator.SimRuntime.iOS-18-6"

      - name: Generate screenshots
        run: |
          cd ios
          fastlane screenshots

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        with:
          name: app-store-screenshots
          path: screenshots/
```

## Performance

**Screenshot Generation Times** (approximate):

- Single device (10 screenshots): ~5-7 minutes
- All devices (52 screenshots): ~45-60 minutes

**Optimization Tips**:

1. Use `screenshots_test` to verify changes quickly (one device only)
2. Run automation overnight for full screenshot sets
3. Parallelize across multiple Mac machines if available
4. Cache built app to skip repeated builds

## App Store Upload

### Prepare for Upload

1. Generate screenshots: `fastlane screenshots`
2. Verify screenshot quality and dimensions
3. Organize by device size for App Store Connect

### App Store Connect Requirements

**iPhone 6.9"** (iPhone 16 Pro Max):
- Path: `screenshots/iPhone-6.9/light/`
- Dimensions: 2868×1320px
- Required: 1-10 screenshots

**iPhone 6.3"** (iPhone 16 Pro):
- Path: `screenshots/iPhone-6.3/light/`
- Dimensions: 2622×1206px
- Required: 1-10 screenshots

**iPhone 6.1"** (iPhone 16):
- Path: `screenshots/iPhone-6.1/light/`
- Dimensions: 2556×1179px
- Required: 1-10 screenshots

**iPhone 4.7"** (iPhone SE):
- Path: `screenshots/iPhone-4.7/light/`
- Dimensions: 1334×750px
- Required: 1-10 screenshots

**iPad Pro 13"**:
- Path: `screenshots/iPad-13/light/`
- Dimensions: 2064×2752px (portrait)
- Required: 1-10 screenshots

**iPad Pro 11"**:
- Path: `screenshots/iPad-11/light/`
- Dimensions: 1668×2388px (portrait)
- Required: 1-10 screenshots

## Next Steps

After screenshot generation:

1. Review all screenshots for quality
2. Update `docs/TODO-SCREENSHOTS.md` checklist
3. Upload to App Store Connect
4. Update marketing materials with new screenshots
5. Archive screenshots with version number

## Support

For issues with:
- **Fastlane**: https://docs.fastlane.tools/
- **AXe CLI**: https://github.com/AXe-iOS/AXe
- **DNSChat specific**: Check `docs/TODO-SCREENSHOTS.md`
