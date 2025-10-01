// Ensure Web Crypto API is available in the Expo runtime before any encryption logic runs.
// This polyfills the full Node.js crypto module including crypto.subtle via react-native-quick-crypto.
// react-native-quick-crypto provides a C/C++ JSI implementation for maximum performance.
import { install } from 'react-native-quick-crypto';

// Install the JSI crypto module into global scope
// This provides full Node.js crypto API including crypto.subtle with all SubtleCrypto methods
try {
  install();
} catch (error) {
  console.error('Failed to install react-native-quick-crypto:', error);
  console.warn('Continuing without native crypto acceleration');
}

// Validate that crypto.subtle is now available
const hasCrypto =
  typeof globalThis.crypto !== "undefined" &&
  typeof globalThis.crypto.getRandomValues === "function" &&
  typeof globalThis.crypto.subtle !== "undefined";

if (!hasCrypto) {
  console.error(
    "WARNING: Web Crypto API failed to initialize.\n" +
    "crypto.subtle is required for AES-256-GCM encryption.\n" +
    "Ensure react-native-quick-crypto is properly linked.\n" +
    "App will continue but encryption features may not work."
  );
} else {
  // Verify SubtleCrypto methods are available
  const requiredMethods = [
    'encrypt',
    'decrypt',
    'importKey',
    'deriveBits',
  ] as const;

  const missingMethods = requiredMethods.filter(
    method => typeof (globalThis.crypto.subtle as any)?.[method] !== 'function'
  );

  if (missingMethods.length > 0) {
    console.error(
      `WARNING: crypto.subtle missing required methods: ${missingMethods.join(', ')}`
    );
  } else {
    console.log("✅ Web Crypto API initialized successfully", {
      cryptoExists: true,
      getRandomValues: "function",
      subtle: "object",
      subtleMethods: Object.keys(globalThis.crypto.subtle),
    });
  }
}