import AsyncStorageModule from '@react-native-async-storage/async-storage';

declare global {
  const AsyncStorage: typeof AsyncStorageModule;
}

export {};
