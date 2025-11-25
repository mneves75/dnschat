# App Store Screenshot Update TODO

## Overview

All screenshots need to be updated to reflect iOS 26 HIG compliance changes:
- Semantic colors (proper light/dark mode adaptation)
- Transparent glass backgrounds with blur effects
- Updated empty states with new typography (title2 + subheadline)
- No yellow glow on plus icon
- Accessibility improvements visible (44pt touch targets, VoiceOver labels)

## Priority: HIGH

**Current screenshots show outdated UI**:
- ❌ Yellow glow on plus icon in chat list (FIXED)
- ❌ Hardcoded colors that don't adapt to dark mode (FIXED)
- ❌ Wrong typography in empty states (FIXED)
- ❌ Incorrect spacing (FIXED)
- ❌ Solid backgrounds instead of glass effects (FIXED)

**Users will see mismatch between screenshots and actual app!**

---

## iPhone Screenshots Required

### iPhone 16 Pro Max (6.9" - 2868×1320px)

**Required Screenshots** (5 total):

1. **Chat Screen - Empty State** (PRIMARY)
   - Shows translucent glass effect background (not solid white)
   - New typography: "Start a conversation!" (title2), subtitle (subheadline)
   - Semantic colors (light mode vs dark mode comparison)
   - Input field with placeholder "Ask me anything..."
   - Send button (gray/inactive state)
   - Demonstrates iOS 26 Liquid Glass design

2. **Chat Screen - Active Conversation**
   - Blue message bubbles using semantic accentTint (not hardcoded #007AFF)
   - Gray assistant bubbles using semantic surface (not hardcoded #F0F0F0)
   - Proper send button colors (blue when active, gray when inactive)
   - Glass effect on message area container
   - Demonstrates semantic color adaptation

3. **Chat List Screen**
   - NO yellow glow on plus icon (critical fix to show)
   - Glass card effects visible on chat items
   - 44pt touch target on "New Chat" button (demonstrate with accessibility inspector overlay if possible)
   - Multiple conversations with different timestamps
   - Statistics section at bottom

4. **Settings Screen**
   - Theme-aware UI demonstrating light/dark mode
   - Glass effects on settings panels
   - Accessibility settings visible
   - DNS method selection
   - All interactive elements with proper touch targets

5. **About Screen**
   - Updated typography throughout
   - Proper spacing with LiquidGlassSpacing system
   - Credits and attribution
   - Links to GitHub, Twitter, etc.

### iPhone 16 Pro (6.3" - 2622×1206px)
Same 5 screenshots as above, optimized for this resolution

### iPhone 16 (6.1" - 2556×1179px)
Same 5 screenshots as above, optimized for this resolution

### iPhone SE (2nd/3rd gen) (4.7" - 1334×750px)
Same 5 screenshots as above, optimized for this resolution

---

## iPad Screenshots Required

### iPad Pro 13" (2064×2752px) - Portrait & Landscape

**Required Screenshots** (3 total):

1. **Chat Screen - Landscape**
   - Glass effects prominent and visible
   - Sidebar navigation (if applicable)
   - Semantic colors in tablet layout
   - Demonstrates responsive design
   - Proper glass blur on larger screen

2. **Settings - Landscape**
   - Two-column layout (if applicable)
   - All settings panels with glass effects
   - DNS configuration visible
   - Theme selection showing light/dark options

3. **About - Landscape**
   - Full width layout
   - Proper typography scaling for tablet
   - All credits and links visible
   - Glass effects throughout

### iPad Pro 11" (1668×2388px) - Portrait & Landscape
Same 3 screenshots as above, optimized for this resolution

---

## Screenshot Modes Checklist

For each primary screenshot (Chat Empty State, Chat Active, Chat List), capture:

- [ ] **Light Mode** - Default iOS appearance
- [ ] **Dark Mode** - iOS dark appearance
- [ ] **High Contrast Light** - Accessibility > Increase Contrast enabled in light mode
- [ ] **High Contrast Dark** - Accessibility > Increase Contrast enabled in dark mode

For App Store, prioritize:
- **Light Mode** (1st screenshot set)
- **Dark Mode** (2nd screenshot set or alternating)

---

## Detailed Screenshot Specifications

### Chat Screen - Empty State (MOST IMPORTANT)

**Why this is critical**:
- Shows off iOS 26 Liquid Glass design
- Demonstrates glass effect vs old solid white background
- New typography system visible
- Semantic colors obvious

**Capture details**:
1. Open DNSChat app in iOS 26+ simulator
2. Navigate to a new/empty chat
3. Ensure:
   - Background shows glass blur (slightly see-through)
   - Heading text: "Start a conversation!" in proper title2 font
   - Subtitle: "Send a message to begin chatting with the AI assistant." in subheadline font
   - Input field at bottom with "Ask me anything..." placeholder
   - Send button is gray/inactive (no message typed)
4. Take screenshot in both light and dark mode

**Annotation ideas** (for marketing):
- Arrow pointing to glass effect: "iOS 26 Liquid Glass"
- Circle around typography: "SF Pro typography"
- Highlight send button: "Semantic colors"

### Chat Screen - Active Conversation

**Capture details**:
1. Send 2-3 messages to create a conversation
2. Ensure messages show:
   - User messages: Blue bubbles (semantic accentTint)
   - AI messages: Gray bubbles (semantic surface)
   - Both adapt properly to light/dark mode
3. Send button should be blue (active state) with text in input field
4. Take screenshot showing full conversation

### Chat List Screen

**Capture details**:
1. Create 3-4 test conversations with different names/times
2. Ensure:
   - Plus icon has NO yellow glow (just glass effect)
   - Each chat item shows glass card effect
   - Touch targets are clearly 44pt (consider accessibility inspector overlay)
   - Statistics section visible at bottom
3. Take screenshot in both light and dark mode

---

## Tools & Setup

### Required
- **Xcode 15+** with iOS 26+ simulator
- **iPhone 16 Pro Max simulator** (or real device)
- **iPad Pro 13" simulator** (or real device)
- **Simulator screenshot tool**: ⌘S (Command+S) in simulator
- **Accessibility Inspector**: Xcode > Open Developer Tool > Accessibility Inspector

### Optional (for annotations)
- **Sketch / Figma** - Add annotations, arrows, highlights
- **Pixelmator / Photoshop** - Image editing for marketing versions
- **App Store Connect** - Direct upload and preview

### Simulator Setup
```bash
# List available simulators
xcrun simctl list devices

# Boot iPhone 16 Pro Max simulator
xcrun simctl boot "iPhone 16 Pro Max"

# Open Simulator app
open -a Simulator

# Change appearance to dark mode
xcrun simctl ui booted appearance dark

# Change appearance to light mode
xcrun simctl ui booted appearance light

# Enable Increase Contrast (via Settings app in simulator)
# Settings > Accessibility > Display & Text Size > Increase Contrast
```

---

## App Store Screenshot Dimensions

### iPhone
| Device | Size | Orientation |
|--------|------|-------------|
| iPhone 16 Pro Max | 2868×1320 | Portrait |
| iPhone 16 Pro | 2622×1206 | Portrait |
| iPhone 16 | 2556×1179 | Portrait |
| iPhone SE (2nd/3rd gen) | 1334×750 | Portrait |

### iPad
| Device | Size | Orientation |
|--------|------|-------------|
| iPad Pro 13" | 2064×2752 | Portrait |
| iPad Pro 13" | 2752×2064 | Landscape |
| iPad Pro 11" | 1668×2388 | Portrait |
| iPad Pro 11" | 2388×1668 | Landscape |

---

## Screenshot Organization

Create folder structure:
```
screenshots/
├── iphone/
│   ├── 16-pro-max/
│   │   ├── light/
│   │   │   ├── 01-chat-empty.png
│   │   │   ├── 02-chat-active.png
│   │   │   ├── 03-chat-list.png
│   │   │   ├── 04-settings.png
│   │   │   └── 05-about.png
│   │   └── dark/
│   │       ├── 01-chat-empty.png
│   │       ├── 02-chat-active.png
│   │       ├── 03-chat-list.png
│   │       ├── 04-settings.png
│   │       └── 05-about.png
│   ├── 16-pro/
│   ├── 16/
│   └── se/
└── ipad/
    ├── pro-13/
    │   ├── portrait/
    │   └── landscape/
    └── pro-11/
        ├── portrait/
        └── landscape/
```

---

## Quality Checklist

Before uploading screenshots to App Store Connect:

- [ ] All screenshots are correct dimensions
- [ ] Status bar shows full signal, battery, time (use simulator defaults)
- [ ] No Lorem Ipsum or test data visible (use realistic chat messages)
- [ ] Glass effects are clearly visible (not too subtle)
- [ ] Colors look correct in both light and dark mode
- [ ] Text is sharp and readable (no compression artifacts)
- [ ] No yellow glow on plus icon
- [ ] All UI elements properly aligned and spaced
- [ ] Screenshots show actual current app version UI

---

## Estimated Time

### Time per screenshot set:
- Setup simulator + app: 10 min
- Capture 5 iPhone screenshots (light mode): 15 min
- Capture 5 iPhone screenshots (dark mode): 10 min
- Capture 3 iPad screenshots (light mode): 10 min
- Capture 3 iPad screenshots (dark mode): 8 min
- **Subtotal per device size**: ~53 min

### Total time estimate:
- iPhone 16 Pro Max: 53 min
- iPhone 16 Pro: 40 min (reuse chat data)
- iPhone 16: 40 min (reuse chat data)
- iPhone SE: 40 min (reuse chat data)
- iPad Pro 13": 45 min (both orientations)
- iPad Pro 11": 35 min (both orientations)

**Total**: ~4-5 hours for complete screenshot refresh

---

## Next Steps

1. [ ] Create test chat data (2-3 conversations with realistic messages)
2. [ ] Boot iPhone 16 Pro Max simulator
3. [ ] Capture all iPhone 16 Pro Max screenshots (light + dark)
4. [ ] Repeat for other iPhone sizes
5. [ ] Boot iPad Pro 13" simulator
6. [ ] Capture all iPad screenshots (portrait + landscape, light + dark)
7. [ ] Repeat for iPad Pro 11"
8. [ ] Review all screenshots for quality
9. [ ] Upload to App Store Connect
10. [ ] Update marketing website with new screenshots

---

## Contact / Questions

**Technical Questions**: See CLAUDE.md or IMPLEMENTATION_SUMMARY.md
**Design Questions**: Review iOS 26 HIG compliance section in IMPLEMENTATION_SUMMARY.md
**App Store Connect**: https://appstoreconnect.apple.com/

**Status**: ⏳ Pending - Screenshots need to be updated before next App Store release
