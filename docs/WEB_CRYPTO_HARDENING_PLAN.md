# Web Crypto API Hardening Plan

**Status**: 🟡 IN PROGRESS
**Reviewer**: John Carmack
**Priority**: P0 - Blocks encryption functionality
**Created**: 2025-09-29

## Executive Summary

The app's encryption system (AES-256-GCM) requires `crypto.subtle` for SubtleCrypto operations, but React Native 0.81.4 with Hermes only provides `crypto.getRandomValues()`. This causes runtime failures when attempting to encrypt/decrypt conversation data.

**Root Cause**: Using `expo-standard-web-crypto` which only polyfills `getRandomValues()`, not the full Web Crypto API including `crypto.subtle`.

**Solution**: Replace with `react-native-quick-crypto`, a full C/C++ JSI implementation of Node's crypto module that provides complete Web Crypto API support.

## Current State Analysis

### ❌ What's Broken

```javascript
LOG  🔐 Crypto object available: {
  "cryptoExists": true,
  "cryptoKeys": [],
  "getRandomValues": "function",
  "subtle": "undefined"  // ← THIS IS THE PROBLEM
}
```

**Impact**: All encryption operations fail with:
```
ERROR  Web Crypto API is unavailable. Ensure expo-standard-web-crypto is initialized before using EncryptionService.
```

### 🔍 Fresh Eyes Code Review Findings

#### Issue 1: Wrong Polyfill Library
**File**: `src/polyfills/webCrypto.ts`
**Line**: 4
**Problem**: `expo-standard-web-crypto` doesn't provide `crypto.subtle`
**Evidence**: Package only exports `getRandomValues()` method

```typescript
// CURRENT (BROKEN)
import webCrypto from "expo-standard-web-crypto";
// webCrypto only has: { getRandomValues: function }
```

#### Issue 2: Missing Metro Configuration
**File**: `metro.config.js`
**Problem**: No crypto module resolution configured
**Impact**: Can't alias 'crypto' imports to react-native-quick-crypto

#### Issue 3: Missing Babel Plugin
**File**: `babel.config.js` (if exists) or needs creation
**Problem**: No module resolver for crypto polyfills
**Impact**: Import statements for 'crypto', 'stream', 'buffer' won't resolve correctly

#### Issue 4: Incomplete Initialization
**File**: `src/polyfills/webCrypto.ts`
**Problem**: Not calling `install()` function from react-native-quick-crypto
**Impact**: JSI module doesn't inject crypto into global scope

## Implementation Plan

### Phase 1: Install Dependencies ✅

```bash
npm install react-native-quick-crypto  # Already installed
npm install --save-dev babel-plugin-module-resolver
npm install readable-stream  # Required peer dependency
```

**Status**: react-native-quick-crypto already installed (v0.7.17)

### Phase 2: Configure Metro Resolver

**File**: `metro.config.js`
**Action**: Add crypto module resolution

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add crypto polyfill resolution
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('react-native-quick-crypto'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
};

module.exports = config;
```

### Phase 3: Configure Babel Module Resolver

**File**: `babel.config.js` (create if not exists)
**Action**: Add module aliases

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            'crypto': 'react-native-quick-crypto',
            'stream': 'readable-stream',
            'buffer': '@craftzdog/react-native-buffer',
          },
        },
      ],
    ],
  };
};
```

### Phase 4: Update WebCrypto Polyfill

**File**: `src/polyfills/webCrypto.ts`
**Action**: Complete rewrite to use react-native-quick-crypto

```typescript
// NEW IMPLEMENTATION
import { install } from 'react-native-quick-crypto';

// Install the JSI crypto module into global scope
// This provides full Node.js crypto API including crypto.subtle
install();

// Validate that crypto.subtle is now available
const hasCrypto =
  typeof globalThis.crypto !== "undefined" &&
  typeof globalThis.crypto.getRandomValues === "function" &&
  typeof globalThis.crypto.subtle !== "undefined";

if (!hasCrypto) {
  throw new Error(
    "FATAL: Web Crypto API failed to initialize.\n" +
    "crypto.subtle is required for AES-256-GCM encryption.\n" +
    "Ensure react-native-quick-crypto is properly linked."
  );
}

// Verify SubtleCrypto methods are available
const requiredMethods = [
  'encrypt',
  'decrypt',
  'importKey',
  'deriveBits',
  'getRandomValues'
];

const missingMethods = requiredMethods.filter(
  method => typeof globalThis.crypto.subtle?.[method] !== 'function'
);

if (missingMethods.length > 0) {
  throw new Error(
    `FATAL: crypto.subtle missing required methods: ${missingMethods.join(', ')}`
  );
}

console.log("✅ Web Crypto API initialized successfully", {
  cryptoExists: true,
  getRandomValues: "function",
  subtle: "object",
  subtleMethods: Object.keys(globalThis.crypto.subtle),
});
```

### Phase 5: Clean Up Encryption Service

**File**: `src/utils/encryption.ts`
**Action**: Remove defensive crypto checks (now handled in polyfill)

```typescript
// REMOVE THESE LINES (18-20):
// Web Crypto API is initialized in src/polyfills/webCrypto.ts
// which is imported at app startup in app/_layout.tsx
// The getWebCrypto() method validates crypto availability at runtime

// UPDATE getWebCrypto() method (lines 497-506):
private static getWebCrypto(): Crypto {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  if (!cryptoApi || !cryptoApi.subtle || !cryptoApi.getRandomValues) {
    // This should never happen if polyfill loaded correctly
    throw new Error(
      'CRITICAL: Web Crypto API became unavailable at runtime. ' +
      'This indicates a severe initialization failure.'
    );
  }
  return cryptoApi;
}
```

### Phase 6: Install Required Peer Dependencies

```bash
npm install @craftzdog/react-native-buffer
```

### Phase 7: Rebuild and Test

```bash
# Clean all caches
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
watchman watch-del-all

# Rebuild iOS
cd ios && rm -rf Pods Podfile.lock build && cd ..
npm run fix-pods
npm run ios

# Expected output:
# ✅ Web Crypto API initialized successfully
# ✅ crypto.subtle methods available
# ✅ Encryption service operational
```

## Verification Checklist

- [ ] `babel-plugin-module-resolver` installed
- [ ] `readable-stream` installed
- [ ] `@craftzdog/react-native-buffer` installed
- [ ] `metro.config.js` updated with crypto resolution
- [ ] `babel.config.js` created/updated with module aliases
- [ ] `src/polyfills/webCrypto.ts` rewritten to use react-native-quick-crypto
- [ ] iOS CocoaPods reinstalled (`npm run fix-pods`)
- [ ] Metro cache cleared
- [ ] App builds without errors
- [ ] Console shows "✅ Web Crypto API initialized successfully"
- [ ] Console shows `subtle: "object"` (not "undefined")
- [ ] Encryption service can create conversation keys
- [ ] Encryption service can encrypt messages
- [ ] Encryption service can decrypt messages
- [ ] No runtime errors related to crypto

## Risk Assessment

### Low Risk
- ✅ react-native-quick-crypto is mature (v0.7.17, widely used in Web3 apps)
- ✅ App already uses dev-client (not Expo Go), so native modules work
- ✅ Provides full Node.js crypto API (superset of Web Crypto API)
- ✅ C/C++ JSI implementation (faster than JavaScript polyfills)

### Mitigation Strategies
1. **Rollback Plan**: Can revert to previous commit if issues arise
2. **Testing**: Verify encryption/decryption with existing conversation data
3. **Monitoring**: Add crypto initialization logging for debugging
4. **Documentation**: Update SECURITY.md with crypto implementation details

## Success Criteria

✅ **Primary Goal**: `crypto.subtle` available and functional
✅ **Secondary Goal**: No breaking changes to encryption service API
✅ **Tertiary Goal**: Performance maintained or improved

## Timeline

- **Phase 1-6**: ~30 minutes (configuration and code updates)
- **Phase 7**: ~5-10 minutes (rebuild and initial testing)
- **Verification**: ~10 minutes (comprehensive encryption testing)

**Total Estimated Time**: 45-50 minutes

## Post-Implementation

### Update Documentation
1. **SECURITY.md**: Document react-native-quick-crypto as crypto provider
2. **CHANGELOG.md**: Add entry for crypto implementation change
3. **README.md**: Update dependencies section

### Remove Obsolete Dependencies
```bash
# After verifying everything works:
npm uninstall expo-standard-web-crypto
```

## Notes for John Carmack

### Design Decisions

1. **Why react-native-quick-crypto over alternatives?**
   - Native C/C++ implementation (no JavaScript overhead)
   - Full Node.js crypto API (future-proof)
   - Active maintenance (last update: recent)
   - Used by major projects (WalletConnect, Uniswap mobile)

2. **Why Metro + Babel configuration?**
   - Standard practice for React Native crypto polyfills
   - Allows seamless `import crypto from 'crypto'` statements
   - No code changes needed in encryption service

3. **Why fail-fast initialization?**
   - Encryption is critical security feature
   - Silent failures are unacceptable
   - Better to crash at startup than corrupt user data

### Performance Considerations

- JSI (JavaScript Interface) provides near-native performance
- Crypto operations run on C++ side, not JS event loop
- No promise marshalling overhead for synchronous operations

### Security Considerations

- react-native-quick-crypto uses OpenSSL under the hood
- Same cryptographic primitives as Node.js server-side
- No security downgrade from previous implementation
- Still uses iOS Keychain/Android Keystore for key storage

---

**Next Steps**: Proceed with Phase 2 (Metro configuration)