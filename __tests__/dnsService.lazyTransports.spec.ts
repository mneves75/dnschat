/**
 * dnsService is imported by ChatContext, which app/_layout.tsx mounts as a root
 * provider. A module-scope require() of the socket libraries therefore runs
 * before first paint even for a session that only reaches the native rung or
 * Mock DNS. These tests pin the deferral: importing the service must not touch
 * either library, and the UDP path must still load its library when it runs.
 */

const loadOrder: string[] = [];

jest.mock("react-native-udp", () => {
  loadOrder.push("react-native-udp");
  return jest.requireActual("./mocks/react-native-udp.js");
});

jest.mock("react-native-tcp-socket", () => {
  loadOrder.push("react-native-tcp-socket");
  return jest.requireActual("./mocks/react-native-tcp-socket.js");
});

describe("DNS transport libraries load lazily", () => {
  beforeEach(() => {
    loadOrder.length = 0;
    jest.resetModules();
  });

  it("does not require the socket libraries when the service module is imported", () => {
    jest.isolateModules(() => {
      require("../src/services/dnsService");
    });

    expect(loadOrder).toEqual([]);
  });

  it("requires react-native-udp only once the UDP transport actually runs", async () => {
    await jest.isolateModulesAsync(async () => {
      const { DNSService } = require("../src/services/dnsService") as {
        DNSService: unknown;
      };
      // Reached through the same private-access cast the UDP datagram spec uses:
      // the public entry points gate on native availability before the UDP rung,
      // and the contract under test is where the require happens, not routing.
      const internals = DNSService as {
        performNativeUDPQuery: (
          queryName: string,
          dnsServer: string,
          port: number,
          deadline: number,
        ) => Promise<string[]>;
      };

      expect(loadOrder).toEqual([]);

      // The mock socket never answers, so this rejects; the assertion is about
      // the require happening at all, not about the query succeeding.
      await internals
        .performNativeUDPQuery(
          "hello.llm.pieter.com",
          "llm.pieter.com",
          53,
          Date.now() + 50,
        )
        .catch(() => undefined);

      expect(loadOrder).toContain("react-native-udp");
    });
  });
});
