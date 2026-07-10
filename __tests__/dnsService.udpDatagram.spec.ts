import { Buffer } from "buffer";
import * as dns from "dns-packet";
import { decodeDnsPacket } from "../src/services/dnsWire";

type SocketHandler = (...args: unknown[]) => void;

type MockUdpSocketBehavior = {
  emitResponses(query: Uint8Array, socket: MockUdpSocket): void;
};

class MockUdpSocket {
  private readonly handlers = new Map<string, SocketHandler[]>();
  readonly close = jest.fn<void, []>();

  on(event: string, handler: SocketHandler): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  once(event: string, handler: SocketHandler): void {
    const onceHandler: SocketHandler = (...args) => {
      const handlers = this.handlers.get(event) ?? [];
      this.handlers.set(
        event,
        handlers.filter((candidate) => candidate !== onceHandler),
      );
      handler(...args);
    };
    this.on(event, onceHandler);
  }

  send(
    query: Uint8Array,
    _offset: number,
    _length: number,
    _port: number,
    _address: string,
    callback: (error?: unknown) => void,
  ): void {
    callback();
    currentBehavior.emitResponses(query, this);
  }

  removeAllListeners(): void {
    this.handlers.clear();
  }

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.handlers.get(event) ?? [];
    for (const handler of [...handlers]) {
      handler(...args);
    }
  }
}

const queryName = "hello.llm.pieter.com";
const resolver = "llm.pieter.com";
const resolverInfo = { address: "203.0.113.10", port: 53 };

const buildTxtResponse = (
  query: Uint8Array,
  text: string,
  transactionIdOffset = 0,
): Buffer => {
  const decodedQuery = decodeDnsPacket(query, Buffer);
  const question = decodedQuery.questions?.[0];
  if (!question) {
    throw new Error("Expected the UDP query to contain one question");
  }
  if (decodedQuery.id === undefined) {
    throw new Error("Expected the UDP query to carry a transaction id");
  }

  return dns.encode({
    type: "response",
    id: (decodedQuery.id + transactionIdOffset) & 0xffff,
    flags: 0x8100,
    questions: [question],
    answers: [
      {
        name: question.name,
        type: "TXT",
        class: "IN",
        ttl: 0,
        data: [text],
      },
    ],
  });
};

let currentSocket: MockUdpSocket;
let currentBehavior: MockUdpSocketBehavior = {
  emitResponses(query, socket) {
    socket.emit("message", buildTxtResponse(query, "ok"), resolverInfo);
  },
};

const loadDNSService = () => {
  jest.resetModules();
  currentSocket = new MockUdpSocket();
  jest.doMock("react-native-udp", () => ({
    createSocket: () => currentSocket,
  }));
  jest.doMock("react-native-tcp-socket", () => null);
  jest.doMock("react-native", () => ({
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    Platform: {
      OS: "android",
    },
    NativeModules: {
      ScreenshotModeModule: null,
    },
  }));

  return require("../src/services/dnsService") as typeof import("../src/services/dnsService");
};

const performUdpQuery = (): Promise<string[]> => {
  const { DNSService } = loadDNSService();
  const performNativeUDPQuery: (
    name: string,
    server: string,
    port: number,
  ) => Promise<string[]> = Reflect.get(
    DNSService,
    "performNativeUDPQuery",
  ).bind(DNSService);
  return performNativeUDPQuery(queryName, resolver, 53);
};

describe("DNSService UDP datagram validation", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.dontMock("react-native-udp");
    jest.dontMock("react-native-tcp-socket");
    jest.dontMock("react-native");
    jest.resetModules();
  });

  it("drops a forged transaction ID and resolves from the later valid datagram", async () => {
    // Given
    currentBehavior = {
      emitResponses(query, socket) {
        socket.emit("message", buildTxtResponse(query, "forged", 1), resolverInfo);
        socket.emit("message", buildTxtResponse(query, "valid response"), resolverInfo);
      },
    };

    // When
    const result = await performUdpQuery();

    // Then
    expect(result).toEqual(["valid response"]);
    expect(currentSocket.close).toHaveBeenCalledTimes(1);
  });

  it("times out after receiving only forged datagrams", async () => {
    // Given
    jest.useFakeTimers();
    currentBehavior = {
      emitResponses(query, socket) {
        socket.emit("message", buildTxtResponse(query, "forged", 1), resolverInfo);
        socket.emit("message", buildTxtResponse(query, "also forged", 2), resolverInfo);
      },
    };

    // When
    const result = performUdpQuery();
    const assertion = expect(result).rejects.toThrow("DNS query timed out");
    await jest.runOnlyPendingTimersAsync();

    // Then
    await assertion;
    expect(currentSocket.close).toHaveBeenCalledTimes(1);
  });

  it("resolves the first valid datagram and closes the socket once", async () => {
    // Given
    currentBehavior = {
      emitResponses(query, socket) {
        socket.emit("message", buildTxtResponse(query, "first try"), resolverInfo);
      },
    };

    // When
    const result = await performUdpQuery();

    // Then
    expect(result).toEqual(["first try"]);
    expect(currentSocket.close).toHaveBeenCalledTimes(1);
  });
});
