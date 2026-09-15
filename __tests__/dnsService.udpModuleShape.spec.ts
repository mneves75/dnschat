/**
 * react-native-udp's entry is an ES module whose default export is a class
 * (`class UdpSockets { static createSocket() }`), not a plain object. The module
 * guard rejected functions, so on Android the JavaScript UDP rung reported
 * "library not loaded" for every query (found on an Android 16 emulator; the
 * older object-shaped Jest mock hid it). This spec mocks the real export shape.
 */

const createSocket = jest.fn(() => {
  throw new Error("socket creation reached");
});

jest.mock("react-native-udp", () => ({
  __esModule: true,
  default: class UdpSockets {
    static createSocket = createSocket;
  },
}));

describe("react-native-udp module shape", () => {
  it("loads the class default export and creates a socket", async () => {
    const { DNSService } = require("../src/services/dnsService") as {
      DNSService: unknown;
    };
    const internals = DNSService as {
      performNativeUDPQuery: (
        queryName: string,
        dnsServer: string,
        port: number,
        deadline: number,
      ) => Promise<string[]>;
    };

    const outcome = internals.performNativeUDPQuery(
      "hello.llm.pieter.com",
      "llm.pieter.com",
      53,
      Date.now() + 1_000,
    );

    await expect(outcome).rejects.toThrow("socket creation reached");
    expect(createSocket).toHaveBeenCalledWith("udp4");
  });
});
