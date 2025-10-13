declare module 'react-native-udp' {
  import { EventEmitter } from 'events';

  interface Socket extends EventEmitter {
    bind(port?: number, address?: string): void;
    connect(port: number, address: string): void;
    send(
      buffer: Uint8Array | number[] | Buffer,
      port: number,
      address: string,
      callback?: (error?: Error) => void
    ): void;
    close(callback?: () => void): void;
    address(): { address: string; family: string; port: number; size: number };
    on(event: 'message', listener: (msg: Uint8Array, rinfo: { port: number; address: string }) => void): Socket;
    on(event: 'error', listener: (error: Error) => void): Socket;
    removeListener(event: 'message', listener: (msg: Uint8Array) => void): Socket;
    removeListener(event: 'error', listener: (error: Error) => void): Socket;
  }

  export function createSocket(options: 'udp4' | 'udp6'): Socket;
}

declare module 'react-native-tcp-socket' {
  type Encoding = 'utf8' | 'ascii' | 'base64' | 'hex';

  export interface SocketOptions {
    port: number;
    host?: string;
    tls?: boolean;
    reuseAddress?: boolean;
    localAddress?: string;
    localPort?: number;
    timeout?: number;
  }

  export interface NetSocket {
    connect(options: SocketOptions, callback?: () => void): NetSocket;
    write(data: Uint8Array | string, encoding?: Encoding, callback?: (error?: Error) => void): boolean;
    end(): void;
    destroy(): void;
    on(event: 'data', listener: (data: Uint8Array) => void): NetSocket;
    on(event: 'error', listener: (error: Error) => void): NetSocket;
    on(event: 'close', listener: () => void): NetSocket;
    once(event: 'close', listener: () => void): NetSocket;
    removeAllListeners(): void;
    setTimeout(timeout: number, callback?: () => void): void;
  }

  export function createConnection(options: SocketOptions, callback?: () => void): NetSocket;
}
