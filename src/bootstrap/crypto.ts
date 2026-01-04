import { getRandomValues } from 'expo-crypto';
import { devLog } from '../utils/devLog';

type RandomValuesArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8ClampedArray;

const ensureCryptoRng = () => {
  try {
    const globalCrypto = (globalThis as any)?.crypto as
      | { getRandomValues?: (array: RandomValuesArray) => RandomValuesArray }
      | undefined;

    if (globalCrypto && typeof globalCrypto.getRandomValues === 'function') {
      return;
    }

    const shim = (array: RandomValuesArray) => getRandomValues(array);

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
