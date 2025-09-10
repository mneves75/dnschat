import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'app_token';

export const secureStore = {
  async setToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  },
  async getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async deleteToken() {
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
