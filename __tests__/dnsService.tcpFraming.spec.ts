import { Buffer } from 'buffer';
import * as dns from 'dns-packet';

type SocketHandler = (...args: unknown[]) => void;

type MockTcpSocketBehavior = {
  emitResponse(query: Uint8Array, socket: MockTcpSocket): void;
};

class MockTcpSocket {
  private readonly handlers = new Map<string, SocketHandler[]>();

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

  connect(
    _options: { port: number; host: string },
    listener?: (result?: unknown) => void,
  ): void {
    setTimeout(() => {
      listener?.({ ok: true });
      this.emit('connect');
    }, 0);
  }

  write(data: Uint8Array): boolean {
    currentBehavior.emitResponse(data, this);
    return true;
  }

  setTimeout(): void {}

  end(): void {
    this.emit('close');
  }

  destroy(): void {}

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

const queryName = 'hello.llm.pieter.com';

const buildTxtResponseFrame = (query: Uint8Array, text: string): Buffer => {
  const queryId = ((query[2] ?? 0) << 8) | (query[3] ?? 0);
  const payload = dns.encode({
    type: 'response',
    id: queryId,
    flags: 0x8100,
    questions: [{ name: queryName, type: 'TXT', class: 'IN' }],
    answers: [{ name: queryName, type: 'TXT', class: 'IN', ttl: 0, data: [text] }],
  });
  const frame = Buffer.alloc(payload.length + 2);
  frame.writeUInt16BE(payload.length, 0);
  Buffer.from(payload).copy(frame, 2);
  return frame;
};

let currentBehavior: MockTcpSocketBehavior = {
  emitResponse(query, socket) {
    socket.emit('data', buildTxtResponseFrame(query, 'ok'));
  },
};

const loadDNSService = () => {
  jest.resetModules();
  jest.doMock('react-native-tcp-socket', () => ({ Socket: MockTcpSocket }));
  jest.doMock('react-native-udp', () => null);
  jest.doMock('react-native', () => ({
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    Platform: {
      OS: 'android',
    },
    NativeModules: {
      ScreenshotModeModule: null,
    },
  }));

  return require('../src/services/dnsService') as typeof import('../src/services/dnsService');
};

describe('DNSService TCP framing', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.dontMock('react-native-tcp-socket');
    jest.dontMock('react-native-udp');
    jest.dontMock('react-native');
    jest.resetModules();
  });

  it('rejects zero-length TCP frames as invalid DNS responses', async () => {
    jest.useFakeTimers();
    currentBehavior = {
      emitResponse(_query, socket) {
        socket.emit('data', Buffer.from([0, 0]));
      },
    };
    const { DNSService, DNSErrorType } = loadDNSService();
    const internals = DNSService as unknown as {
      performDNSOverTCP: (name: string, server: string, port: number) => Promise<string[]>;
    };

    const result = internals.performDNSOverTCP(queryName, 'llm.pieter.com', 53);
    const assertion = expect(result).rejects.toMatchObject({
      type: DNSErrorType.INVALID_RESPONSE,
      message: 'Invalid TCP frame length: 0',
    });
    await jest.runOnlyPendingTimersAsync();

    await assertion;
  });

  it('parses a valid TCP response split across chunks', async () => {
    jest.useFakeTimers();
    currentBehavior = {
      emitResponse(query, socket) {
        const frame = buildTxtResponseFrame(query, 'split ok');
        socket.emit('data', frame.subarray(0, 5));
        socket.emit('data', frame.subarray(5));
      },
    };
    const { DNSService } = loadDNSService();
    const internals = DNSService as unknown as {
      performDNSOverTCP: (name: string, server: string, port: number) => Promise<string[]>;
    };

    const result = internals.performDNSOverTCP(queryName, 'llm.pieter.com', 53);
    const assertion = expect(result).resolves.toEqual(['split ok']);
    await jest.runOnlyPendingTimersAsync();

    await assertion;
  });
});
