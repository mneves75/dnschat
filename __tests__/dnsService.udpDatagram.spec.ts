import { Buffer } from "buffer";
import * as dns from "dns-packet";
import { decodeDnsPacket } from "../src/services/dnsWire";

type SocketHandler = (...args: unknown[]) => void;

type MockUdpSocketBehavior = {
  bindError?: Error;
  emitResponses(query: Uint8Array, socket: MockUdpSocket): void;
};

class MockUdpSocket {
  private readonly handlers = new Map<string, SocketHandler[]>();
  private bound = false;
  readonly callOrder: string[] = [];
  readonly close = jest.fn<void, []>();
  readonly bind = jest.fn(
    (_port: number, callback: (error?: unknown) => void): void => {
      this.callOrder.push("bind");
      queueMicrotask(() => {
        if (currentBehavior.bindError) {
          callback(currentBehavior.bindError);
          return;
        }
        this.bound = true;
        this.emit("listening");
        callback();
      });
    },
  );

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
    this.callOrder.push("send");
    if (!this.bound) {
      throw new Error("ERR_SOCKET_BAD_PORT");
    }
    callback();
    currentBehavior.emitResponses(query, this);
  }

  removeAllListeners(): void {
    this.handlers.clear();
  }

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.handlers.get(event) ?? [];
    for (const handler of handlers) {
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
let currentAppStateHandler: ((state: string) => void) | null = null;
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
      addEventListener: jest.fn(
        (_event: string, handler: (state: string) => void) => {
          currentAppStateHandler = handler;
          return { remove: jest.fn() };
        },
      ),
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

type DNSServiceInternals = {
  performNativeUDPQuery: (
    name: string,
    server: string,
    port: number,
    deadline: number,
  ) => Promise<string[]>;
  captureLifecycleToken: () => number;
  handleBackgroundSuspension: <T>(
    operation: () => Promise<T>,
    lifecycleToken: number,
  ) => Promise<T>;
};

const getInternals = (
  DNSService: typeof import("../src/services/dnsService").DNSService,
): DNSServiceInternals => DNSService as unknown as DNSServiceInternals;

const performUdpQuery = (
  deadline: number = Date.now() + 5_000,
): Promise<string[]> => {
  const { DNSService } = loadDNSService();
  return getInternals(DNSService).performNativeUDPQuery(
    queryName,
    resolver,
    53,
    deadline,
  );
};

describe("DNSService UDP datagram validation", () => {
  afterEach(() => {
    jest.useRealTimers();
    currentAppStateHandler = null;
    jest.dontMock("react-native-udp");
    jest.dontMock("react-native-tcp-socket");
    jest.dontMock("react-native");
    jest.resetModules();
  });

  it("drops a forged transaction ID and resolves from the later valid datagram", async () => {
    // Given
    currentBehavior = {
      emitResponses(query, socket) {
        socket.emit(
          "message",
          buildTxtResponse(query, "forged", 1),
          resolverInfo,
        );
        socket.emit(
          "message",
          buildTxtResponse(query, "valid response"),
          resolverInfo,
        );
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
        socket.emit(
          "message",
          buildTxtResponse(query, "forged", 1),
          resolverInfo,
        );
        socket.emit(
          "message",
          buildTxtResponse(query, "also forged", 2),
          resolverInfo,
        );
      },
    };

    // When
    const result = performUdpQuery();
    // oxlint-disable-next-line jest/valid-expect -- Awaited after fake timers advance so the rejection can settle.
    const assertion = expect(result).rejects.toThrow("DNS query timed out");
    await jest.runOnlyPendingTimersAsync();

    // Then
    await assertion;
    expect(currentSocket.close).toHaveBeenCalledTimes(1);
  });

  it("closes the UDP socket at the caller's absolute deadline", async () => {
    // Given
    jest.useFakeTimers();
    currentBehavior = {
      emitResponses() {
        // Keep the socket open until the deadline fires.
      },
    };
    const { DNSService } = loadDNSService();
    const deadline = Date.now() + 25;

    // When
    const result = getInternals(DNSService).performNativeUDPQuery(
      queryName,
      resolver,
      53,
      deadline,
    );
    const outcome = result.then(
      () => ({ status: "resolved" as const }),
      (error: unknown) => ({ status: "rejected" as const, error }),
    );
    await jest.advanceTimersByTimeAsync(24);

    // Then
    expect(currentSocket.close).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    await expect(outcome).resolves.toMatchObject({
      status: "rejected",
      error: {
        message: "DNS query timed out",
      },
    });
    expect(currentSocket.close).toHaveBeenCalledTimes(1);
  });

  it("cancels an in-flight UDP socket across background then active", async () => {
    // Given
    jest.useFakeTimers();
    let pendingQuery: Uint8Array | null = null;
    currentBehavior = {
      emitResponses(query) {
        pendingQuery = query;
      },
    };
    const { DNSService } = loadDNSService();
    const internals = getInternals(DNSService);
    DNSService.initialize();
    const lifecycleToken = internals.captureLifecycleToken();

    const operation = internals.handleBackgroundSuspension(
      () =>
        internals.performNativeUDPQuery(
          queryName,
          resolver,
          53,
          Date.now() + 5_000,
        ),
      lifecycleToken,
    );
    const outcome = operation.then(
      (value) => ({ status: "resolved" as const, value }),
      (error: unknown) => ({ status: "rejected" as const, error }),
    );
    await jest.advanceTimersByTimeAsync(0);
    expect(pendingQuery).not.toBeNull();
    if (!currentAppStateHandler || !pendingQuery) {
      throw new Error("Expected an active UDP query and AppState listener");
    }

    // When
    currentAppStateHandler("background");
    currentAppStateHandler("active");
    const settledOutcome = await outcome;

    // Then
    expect(settledOutcome).toMatchObject({
      status: "rejected",
      error: {
        message:
          "DNS query failed - app was backgrounded during network operation",
      },
    });
    expect(currentSocket.close).toHaveBeenCalledTimes(1);

    currentSocket.emit(
      "message",
      buildTxtResponse(pendingQuery, "late response"),
      resolverInfo,
    );
    await Promise.resolve();
    expect(settledOutcome.status).toBe("rejected");
    expect(currentSocket.close).toHaveBeenCalledTimes(1);
  });

  it("resolves the first valid datagram and closes the socket once", async () => {
    // Given
    currentBehavior = {
      emitResponses(query, socket) {
        socket.emit(
          "message",
          buildTxtResponse(query, "first try"),
          resolverInfo,
        );
      },
    };

    // When
    const result = await performUdpQuery();

    // Then
    expect(result).toEqual(["first try"]);
    expect(currentSocket.close).toHaveBeenCalledTimes(1);
  });

  it("binds to an ephemeral port before sending", async () => {
    // Given
    currentBehavior = {
      emitResponses(query, socket) {
        socket.emit(
          "message",
          buildTxtResponse(query, "bound first"),
          resolverInfo,
        );
      },
    };

    // When
    const result = await performUdpQuery();

    // Then
    expect(result).toEqual(["bound first"]);
    expect(currentSocket.bind).toHaveBeenCalledWith(0, expect.any(Function));
    expect(currentSocket.callOrder).toEqual(["bind", "send"]);
  });

  it("reports bind failures and closes the socket once", async () => {
    // Given
    currentBehavior = {
      bindError: new Error("address unavailable"),
      emitResponses() {
        throw new Error("send must not run after a bind failure");
      },
    };

    // When
    const result = performUdpQuery();

    // Then
    await expect(result).rejects.toThrow(
      "Failed to bind UDP socket: address unavailable",
    );
    expect(currentSocket.callOrder).toEqual(["bind"]);
    expect(currentSocket.close).toHaveBeenCalledTimes(1);
  });
});
