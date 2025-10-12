# iOS 26+ Liquid Glass Icon Format

## Overview

iOS 26+ introduces a new `.icon` format for app icons that supports the Liquid Glass visual effect. This format provides depth, vibrancy, and adaptive lighting effects that integrate seamlessly with the iOS 26+ system UI.

## Current Status

**Icon Assets Available:**
- `icons/dnschat_ios26.png` (1024x1024 PNG)
- `icons/dnschat.png` (legacy format)
- `assets/icon.png` (Expo default)

**Format:** PNG (standard)
**Target:** `.icon` format (Liquid Glass)

## Conversion Requirements

### Required Tools

The `.icon` format can only be created using Apple's official tooling:

1. **Icon Composer** (Xcode 16+)
   - Available in Xcode 16.0 beta or later
   - Path: `/Applications/Xcode.app/Contents/Developer/Applications/Icon Composer.app`
   - macOS 15.0+ required

2. **Alternative: Asset Catalog Compiler**
   ```bash
   xcrun actool --compile /path/to/output --platform iphoneos \
     --minimum-deployment-target 18.4 \
     --app-icon AppIcon Assets.xcassets
   ```

### Conversion Process

1. **Prepare Source Image**
   - Minimum: 1024x1024 PNG (already available)
   - Recommended: Vector source (SVG/PDF) for better quality
   - Ensure clean background (transparent or solid color)

2. **Open Icon Composer** (Xcode 16+)
   ```bash
   open /Applications/Xcode.app/Contents/Developer/Applications/Icon\ Composer.app
   ```

3. **Import Source PNG**
   - Drag `icons/dnschat_ios26.png` into Icon Composer
   - Configure Liquid Glass depth and material properties
   - Preview in different lighting conditions

4. **Export .icon File**
   - File → Export as `.icon`
   - Save to `icons/dnschat_ios26.icon`

5. **Update Xcode Project**
   ```xml
   <!-- ios/DNSChat/Images.xcassets/AppIcon.appiconset/Contents.json -->
   {
     "images": [
       {
         "filename": "dnschat_ios26.icon",
         "idiom": "universal",
         "platform": "ios",
         "size": "1024x1024"
       }
     ],
     "info": {
       "author": "xcode",
       "version": 1
     }
   }
   ```

## Liquid Glass Icon Properties

### Visual Effects

- **Depth Layers**: Supports up to 3 depth layers for parallax
- **Material Properties**: Configurable opacity, blur, and vibrancy
- **Adaptive Lighting**: Responds to system light conditions
- **Edge Refinement**: Automatic anti-aliasing and edge enhancement

### Design Guidelines

1. **Avoid Fine Details**: Small text and intricate patterns may blur
2. **Use Bold Shapes**: Strong geometric forms work best
3. **Leverage Depth**: Design with foreground/background separation
4. **Test in Dark Mode**: Verify visibility in both themes

## Fallback Strategy

For iOS < 26 and other platforms, the standard PNG icon will be used automatically:

```json
// app.json
{
  "expo": {
    "icon": "./icons/dnschat_ios26.png"
  }
}
```

Expo automatically generates required icon sizes from this source.

## Testing .icon Format

### Force Enable on iOS < 26

Set the testing flag in `utils.ts`:
```typescript
if (__DEV__ && Platform.OS === 'ios') {
  global.__DEV_LIQUID_GLASS_PRE_IOS26__ = true;
}
```

### Verify Icon Rendering

1. Build with Xcode 16+ for iOS 26+ simulator
2. Install on device: `npm run ios`
3. Check home screen icon appearance
4. Test in different lighting conditions:
   - Light mode
   - Dark mode
   - High contrast modes

## Known Limitations

- **Xcode 16+ Required**: Earlier Xcode versions don't support `.icon` format
- **macOS 15+**: Icon Composer requires macOS Sequoia or later
- **Build Time**: `.icon` files increase build time due to processing
- **File Size**: `.icon` files are larger than standard PNG icons

## Migration Checklist

- [x] Prepare 1024x1024 source PNG
- [ ] Install Xcode 16+ (when available)
- [ ] Open Icon Composer
- [ ] Configure Liquid Glass properties
- [ ] Export `.icon` file
- [ ] Update Asset Catalog
- [ ] Test on iOS 26+ simulator
- [ ] Verify fallback on iOS < 26

## Resources

- [Apple HIG: App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Xcode 16 Release Notes](https://developer.apple.com/documentation/xcode-release-notes/)
- [iOS 26 What's New](https://developer.apple.com/ios/whats-new/)

---

**Last Updated:** 2025-10-11
**Status:** Documentation complete, awaiting Xcode 16+ for conversion
