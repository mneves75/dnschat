import { getRandomValues } from 'expo-crypto';
import { devLog } from '../utils/devLog';

const ensureCryptoRng = () => {
  try {
    const globalCrypto = (globalThis as any)?.crypto as
      | { getRandomValues?: (array: ArrayBufferView) => ArrayBufferView }
      | undefined;

    if (globalCrypto && typeof globalCrypto.getRandomValues === 'function') {
      return;
    }

    const shim = (array: ArrayBufferView) => getRandomValues(array);

    if (globalCrypto) {
      globalCrypto.getRandomValues = shim;
    } else if (typeof globalThis !== 'undefined') {
      (globalThis as any).crypto = { getRandomValues: shim };
    }
  } catch (error) {
    devLog('[CryptoBootstrap] Failed to ensure secure RNG', error);
  }
};

ensureCryptoRng();
