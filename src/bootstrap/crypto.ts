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

type GlobalCrypto = {
  getRandomValues?: (array: RandomValuesArray) => RandomValuesArray;
};

const getGlobalCrypto = (): GlobalCrypto | undefined => {
  if (typeof globalThis === 'undefined') return undefined;
  const record = globalThis as Record<string, unknown>;
  const cryptoValue = record['crypto'];
  if (!cryptoValue || typeof cryptoValue !== 'object') return undefined;
  return cryptoValue as GlobalCrypto;
};

const setGlobalCrypto = (value: GlobalCrypto): void => {
  if (typeof globalThis === 'undefined') return;
  const record = globalThis as Record<string, unknown>;
  record['crypto'] = value;
};

const ensureCryptoRng = () => {
  try {
    const globalCrypto = getGlobalCrypto();

    if (globalCrypto && typeof globalCrypto.getRandomValues === 'function') {
      return;
    }

    const shim = (array: RandomValuesArray) => getRandomValues(array);

    if (globalCrypto) {
      globalCrypto.getRandomValues = shim;
    } else if (typeof globalThis !== 'undefined') {
      setGlobalCrypto({ getRandomValues: shim });
    }
  } catch (error) {
    devLog('[CryptoBootstrap] Failed to ensure secure RNG', error);
  }
};

ensureCryptoRng();
