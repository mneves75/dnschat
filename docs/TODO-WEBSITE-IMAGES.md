# Website & Marketing Images Update TODO

## Overview

Update all website, GitHub repository, and marketing images to reflect iOS 26 HIG compliance changes. These images are critical for first impressions and should showcase the modern, polished design.

**Priority**: MEDIUM (after App Store screenshots are complete)

---

## GitHub Repository Images

### 1. README.md Hero Image

**Current Status**: May show outdated UI with hardcoded colors

**Required Updates**:
- [ ] Main app screenshot showing iOS 26 Liquid Glass design
- [ ] Show glass blur effects prominently
- [ ] Preferably dark mode for modern look
- [ ] High-resolution (2x or 3x retina)

**Specifications**:
- **Dimensions**: 1280×800px (16:10 ratio for GitHub display)
- **Format**: PNG with transparency OR JPG
- **Content**:
  - Chat screen with active conversation
  - Glass effects clearly visible
  - Semantic blue bubbles for user messages
  - Gray bubbles for AI responses
  - Professional, modern aesthetic

**Annotations** (optional):
- "iOS 26 Liquid Glass" label
- "Semantic Colors" highlight
- "44pt Touch Targets" notation

### 2. Social Media Card (og:image / Twitter Card)

**Purpose**: When DNSChat GitHub repo is shared on social media

**Required**:
- [ ] 1200×630px image
- [ ] DNSChat logo/branding
- [ ] "iOS 26 Liquid Glass" tagline
- [ ] Screenshot montage showing key features
- [ ] Text overlay with key benefits

**Content Ideas**:
```
DNSChat
Chat with AI via DNS TXT Queries

✓ iOS 26 Liquid Glass Design
✓ Semantic Color System
✓ Full Accessibility Support
✓ 44pt Touch Targets

[Screenshot montage: Chat screen + Chat list]
```

**Tools**:
- Canva (template: Social Media Card)
- Figma (custom design)
- Photoshop (custom design)

### 3. Repository Screenshots in README

**Current**: README has badges but may benefit from inline screenshots

**Recommended Additions**:
- [ ] **Before/After Comparison**: Hardcoded colors vs semantic palette
- [ ] **Light/Dark Mode Comparison**: Side-by-side screenshots
- [ ] **Feature Showcase**: 3-4 key features with annotated screenshots
  - Glass effects
  - Semantic colors
  - Accessibility (VoiceOver labels shown)
  - Touch targets (44pt demonstration)

**Format**: Use HTML in markdown for precise sizing:
```markdown
## Features

<img src="docs/images/glass-effects.png" width="300" alt="iOS 26 Liquid Glass Effects">
<img src="docs/images/semantic-colors.png" width="300" alt="Semantic Color System">
```

---

## Marketing Website Images (if applicable)

### Landing Page Hero

**Required**:
- [ ] Large hero screenshot (1920×1080 or larger)
- [ ] Shows chat screen with glass effects
- [ ] Dark mode for modern tech aesthetic
- [ ] Overlay text with value proposition
- [ ] CTA button: "View on GitHub" or "Download"

**Content**:
- Main headline: "Chat with AI via DNS"
- Subheadline: "iOS 26 Liquid Glass Design • React Native • TypeScript"
- Screenshot showing active conversation with glass effects

### Feature Sections

Each feature needs an accompanying image:

1. **iOS 26 Liquid Glass Design**
   - [ ] Screenshot showing translucent glass effect
   - [ ] Annotation pointing to blur effect
   - [ ] Text: "Native UIGlassEffect with comprehensive fallbacks"

2. **Semantic Color System**
   - [ ] Side-by-side: Light mode vs Dark mode
   - [ ] Same screen showing color adaptation
   - [ ] Text: "Automatic light/dark/high-contrast adaptation"

3. **Accessibility First**
   - [ ] Screenshot with VoiceOver labels visible
   - [ ] 44pt touch target demonstration
   - [ ] Text: "WCAG 2.1 Level AA compliant"

4. **Native DNS Implementation**
   - [ ] Code snippet or diagram
   - [ ] Shows DNS query flow
   - [ ] Text: "Platform-optimized with multi-layer fallback"

### Comparison Section (Before/After)

**Powerful marketing visual**:

| Before (v2.x) | After (v3.0) |
|--------------|--------------|
| Solid white background | Translucent glass effect |
| Hardcoded #007AFF blue | Semantic accentTint |
| Manual dark mode | Automatic adaptation |
| Basic typography | SF Pro typography system |
| Inconsistent spacing | 8px grid system |

**Implementation**:
- [ ] Create split-screen comparison image
- [ ] Use arrows and annotations
- [ ] Highlight key improvements
- [ ] Save as high-res PNG: `comparison-before-after.png`

---

## Blog Post / Medium Article Images

### "iOS 26 HIG Compliance" Post

**Required Images** (5-7 total):

1. **Hero Image**
   - [ ] Eye-catching header image
   - [ ] Title overlay: "Achieving iOS 26 HIG Compliance"
   - [ ] Subtitle: "Semantic Colors, Accessibility, and Glass Effects"
   - [ ] Screenshot showing polished chat interface

2. **Semantic Colors Explained**
   - [ ] Diagram showing color palette
   - [ ] Light mode vs dark mode color values
   - [ ] Code snippet showing `useImessagePalette()` usage
   - [ ] Visual diff: hardcoded colors → semantic colors

3. **Touch Targets Compliance**
   - [ ] Visual guide: 44×44px minimum
   - [ ] Diagram showing icon + padding calculation
   - [ ] Before: 36×28px (❌) vs After: 44×44px (✅)
   - [ ] iOS Accessibility Inspector screenshot

4. **Glass Effects Implementation**
   - [ ] Screenshot showing glass blur on chat screen
   - [ ] Side-by-side: Solid background vs glass effect
   - [ ] Code snippet: `LiquidGlassWrapper` usage
   - [ ] Mention iOS 26+ native support

5. **Accessibility Features**
   - [ ] VoiceOver labels demonstration
   - [ ] High contrast mode comparison
   - [ ] Reduce transparency fallback
   - [ ] WCAG 2.1 Level AA badge

6. **Code Examples**
   - [ ] Syntax-highlighted code blocks showing:
     - Semantic color migration
     - Typography system usage
     - Spacing system implementation
     - Accessibility label additions

7. **Results / Metrics**
   - [ ] Chart or infographic:
     - Lines of code improved
     - Components updated
     - Accessibility score increase
     - User feedback (if available)

**Tools for Code Screenshots**:
- [Carbon](https://carbon.now.sh/) - Beautiful code screenshots
- [ray.so](https://ray.so/) - Code screenshots with themes
- VS Code "Polacode" extension

---

## App Icon Updates (if needed)

### Review Needed

**Check if current app icon follows iOS 26 guidelines**:
- [ ] 1024×1024px @1x size (required by App Store)
- [ ] No transparency (solid background)
- [ ] No rounded corners (iOS adds them)
- [ ] Proper visual weight and contrast
- [ ] Works well at all sizes (App Store, Spotlight, Settings)

**If updates needed**:
- [ ] Update app icon design
- [ ] Export all required sizes:
  - 1024×1024 (App Store)
  - 180×180 (iPhone @3x)
  - 120×120 (iPhone @2x)
  - 152×152 (iPad @2x)
  - 76×76 (iPad @1x)
  - 167×167 (iPad Pro @2x)
  - 40×40 (Spotlight @2x)
  - 58×58 (Settings @2x)
  - 80×80 (Spotlight @3x)
  - 60×60 (Notifications @3x)

**Tools**:
- [App Icon Generator](https://www.appicon.co/)
- [SF Symbols App](https://developer.apple.com/sf-symbols/) - for reference
- Figma / Sketch / Illustrator - design tool

---

## Video / GIF Demos (Optional but Recommended)

### Short Demo Videos

**Highly effective for marketing**:

1. **Glass Effect Demo** (5-10 seconds)
   - [ ] Record screen showing glass blur effect
   - [ ] Tilt/rotate to show depth and layers
   - [ ] Transition from light to dark mode
   - [ ] Save as MP4 or GIF

2. **Semantic Colors Demo** (10 seconds)
   - [ ] Show live dark mode toggle
   - [ ] All colors adapt instantly
   - [ ] Highlight message bubbles changing color
   - [ ] Save as MP4 or GIF

3. **Touch Interaction Demo** (5 seconds)
   - [ ] Show button press with haptic feedback (mention in caption)
   - [ ] Demonstrate 44pt touch target
   - [ ] Send message interaction
   - [ ] Save as MP4 or GIF

**Recording Tools**:
- **iOS Simulator**: Record screen with ⌘R in simulator
- **QuickTime**: File > New Screen Recording
- **Gifox**: macOS app for creating GIFs
- **Kap**: Open-source screen recorder for macOS

**GIF Optimization**:
```bash
# Using gifsicle (install via Homebrew)
brew install gifsicle

# Optimize GIF file
gifsicle -O3 --colors 256 input.gif -o output.gif
```

---

## Image Organization

### Folder Structure

Create organized folder for all marketing images:

```
docs/images/
├── github/
│   ├── hero.png                    # README hero image
│   ├── og-image.png                # Social media card
│   └── features/
│       ├── glass-effects.png
│       ├── semantic-colors.png
│       ├── accessibility.png
│       └── touch-targets.png
├── website/
│   ├── hero-landing.png            # Website hero
│   ├── comparison-before-after.png # Before/after comparison
│   └── feature-sections/
│       ├── feature-01-glass.png
│       ├── feature-02-colors.png
│       ├── feature-03-accessibility.png
│       └── feature-04-dns.png
├── blog/
│   ├── hero-hig-compliance.png
│   ├── semantic-colors-diagram.png
│   ├── touch-targets-guide.png
│   ├── glass-effect-demo.png
│   ├── accessibility-features.png
│   └── code-examples/
│       ├── semantic-colors-code.png
│       ├── typography-code.png
│       └── spacing-code.png
└── videos/
    ├── glass-effect-demo.mp4
    ├── dark-mode-toggle.mp4
    └── touch-interaction.mp4
```

---

## Image Specifications & Best Practices

### General Guidelines

**Resolution**:
- Minimum 2x retina (144 DPI)
- Prefer 3x for marketing images
- App Store screenshots: exact pixel dimensions required

**File Formats**:
- **Screenshots**: PNG (lossless, best quality)
- **Marketing images**: JPG (smaller file size, web-optimized)
- **Logos/icons**: SVG (scalable) or PNG with transparency
- **GIFs**: Use sparingly, optimize file size

**File Sizes**:
- Target < 500KB for web images
- Target < 1MB for hero images
- Use compression tools: [TinyPNG](https://tinypng.com/), [ImageOptim](https://imageoptim.com/)

**Accessibility**:
- Always include `alt` text for web images
- Describe image content concisely
- Example: `alt="Chat screen showing iOS 26 glass effect and semantic color system"`

### Image Naming Convention

Use descriptive, lowercase, hyphen-separated names:

```
✅ Good:
- chat-screen-glass-effect.png
- comparison-light-dark-mode.png
- semantic-colors-diagram.png

❌ Bad:
- screenshot1.png
- IMG_0123.PNG
- final-FINAL-v2.jpg
```

---

## Quality Checklist

Before publishing any image:

- [ ] Correct dimensions for intended use
- [ ] High resolution (2x or 3x retina)
- [ ] Optimized file size (compressed)
- [ ] No personal data visible (use test/demo data)
- [ ] Glass effects clearly visible (not too subtle)
- [ ] Colors accurate (not washed out or oversaturated)
- [ ] Text legible at all sizes
- [ ] Proper alt text written
- [ ] Copyright/licensing cleared (if using stock images)

---

## Timeline & Priority

### High Priority (Week 1)
1. [ ] GitHub README hero image
2. [ ] Social media card (og:image)
3. [ ] Before/after comparison image

### Medium Priority (Week 2)
4. [ ] Feature section images (4 images)
5. [ ] Blog post images (if writing blog post)
6. [ ] GIF demos (3 short animations)

### Low Priority (Week 3+)
7. [ ] Website redesign images (if applicable)
8. [ ] App icon review/update (if needed)
9. [ ] Additional marketing materials

**Total Estimated Time**: 4-6 hours
- GitHub images: 1-2 hours
- Website images: 2-3 hours (if website exists)
- Blog post images: 1-2 hours
- Video/GIF demos: 1 hour

---

## Tools & Resources

### Design Tools
- **Figma**: Free, browser-based, great for mockups
- **Sketch**: macOS only, professional design tool
- **Canva**: Easy templates for social media cards
- **Pixelmator Pro**: macOS image editor
- **Photoshop**: Industry standard (paid)

### Code Screenshot Tools
- **Carbon**: https://carbon.now.sh/
- **ray.so**: https://ray.so/
- **Polacode**: VS Code extension

### Screen Recording
- **iOS Simulator**: Built-in screen recording (⌘R)
- **QuickTime**: macOS built-in
- **Gifox**: GIF recorder for macOS
- **Kap**: Open-source screen recorder

### Optimization Tools
- **TinyPNG**: https://tinypng.com/
- **ImageOptim**: https://imageoptim.com/
- **Squoosh**: https://squoosh.app/ (Google)

### Stock Images (if needed)
- **Unsplash**: https://unsplash.com/ (free)
- **Pexels**: https://www.pexels.com/ (free)
- **SF Symbols**: https://developer.apple.com/sf-symbols/ (Apple official)

---

## Next Steps

1. [ ] Review existing GitHub README and identify image needs
2. [ ] Take App Store screenshots first (reuse for marketing)
3. [ ] Create GitHub hero image and social media card
4. [ ] Write blog post draft (identify image needs)
5. [ ] Create before/after comparison image
6. [ ] Record short demo GIFs
7. [ ] Update README with new images
8. [ ] Publish blog post (if applicable)
9. [ ] Update marketing website (if applicable)

---

## Contact / Questions

**Design Questions**: See iOS 26 HIG compliance section in IMPLEMENTATION_SUMMARY.md
**Technical Screenshots**: Follow TODO-SCREENSHOTS.md first
**Marketing Strategy**: Highlight semantic colors, accessibility, and iOS 26 Liquid Glass design

**Status**: ⏳ Pending - Can begin after App Store screenshots are complete

**Dependencies**:
- App Store screenshots (TODO-SCREENSHOTS.md) should be completed first
- Reuse those screenshots for marketing materials to ensure consistency
