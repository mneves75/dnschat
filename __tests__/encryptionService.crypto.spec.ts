import AsyncStorage from "@react-native-async-storage/async-storage";
import { EncryptionService } from "../src/utils/encryption";

describe("EncryptionService Web Crypto guard", () => {
  const originalCrypto = global.crypto;

  afterEach(async () => {
    global.crypto = originalCrypto;
    await AsyncStorage.clear();
  });

  it("throws a descriptive error when Web Crypto is unavailable", async () => {
    // Forcefully remove Web Crypto API to trigger guard path
    // @ts-expect-error intentional test mutation
    global.crypto = undefined;

    await expect(EncryptionService.generateConversationKey("guard-test")).rejects.toThrow(
      /CRITICAL: Web Crypto API became unavailable/
    );
  });
});
