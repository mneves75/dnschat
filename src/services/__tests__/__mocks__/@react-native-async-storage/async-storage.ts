const store: Record<string, string | null> = {};

const AsyncStorage = {
  getItem: async (key: string) => (key in store ? store[key] : null),
  setItem: async (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: async (key: string) => {
    delete store[key];
  },
  clear: async () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
  multiRemove: async (keys: string[]) => {
    for (const k of keys) delete store[k];
  },
};

export default AsyncStorage;
module.exports = AsyncStorage;

