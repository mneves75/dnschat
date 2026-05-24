import type { Buffer as NodeBuffer } from 'buffer';
import type { DecodedPacket } from 'dns-packet';
import * as dns from 'dns-packet';

export type BufferLike = Uint8Array & {
  readUInt16BE?: (offset: number) => number;
  writeUInt16BE?: (value: number, offset: number) => void;
};

export type BufferFactory = {
  alloc(size: number): BufferLike;
  allocUnsafe(size: number): BufferLike;
  concat(chunks: BufferLike[]): BufferLike;
  from(data: Uint8Array | ArrayBuffer | ArrayLike<number>): BufferLike;
  isBuffer(value: unknown): value is BufferLike;
};

type TxtResponseValidationOptions = {
  expectedQueryId: number;
  expectedQueryName: string;
  expectedPort: number;
  expectedServer: string;
  sourceAddress?: string;
  sourcePort?: number;
};

const DNS_FLAG_QR = 0x8000;
const DNS_FLAG_TC = 0x0200;
const DNS_OPCODE_MASK = 0x7800;

const normalizeQuestionName = (value: string): string =>
  value.trim().toLowerCase().replace(/\.+$/g, '');

const isIPv4Address = (value: string): boolean => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value);

const toUint8Array = (value: unknown): Uint8Array | null => {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value) && value.buffer) {
    return new Uint8Array(value.buffer);
  }
  if (value && typeof value === 'object' && 'length' in value) {
    const arrayLike = value as ArrayLike<number>;
    return new Uint8Array(Array.from(arrayLike));
  }
  return null;
};

const toNodeBuffer = (
  data: Uint8Array,
  bufferFactory?: Pick<BufferFactory, 'from'> | null,
): NodeBuffer => {
  if (bufferFactory && typeof bufferFactory.from === 'function') {
    return bufferFactory.from(data) as unknown as NodeBuffer;
  }
  return data as unknown as NodeBuffer;
};

const getDecodedRcode = (decoded: DecodedPacket): string | undefined => {
  const record = decoded as { rcode?: unknown };
  return typeof record.rcode === 'string' ? record.rcode : undefined;
};

const safeDecodeBytes = (
  bytes: unknown,
  bufferFactory?: Pick<BufferFactory, 'from'> | null,
): string => {
  const asUint8 = toUint8Array(bytes);
  if (!asUint8) return '';
  try {
    const decoderCtor = typeof TextDecoder !== 'undefined' ? TextDecoder : null;
    if (decoderCtor) {
      const dec = new decoderCtor('utf-8');
      return dec.decode(asUint8);
    }
  } catch {}
  try {
    return toNodeBuffer(asUint8, bufferFactory).toString('utf8');
  } catch {}
  try {
    let out = '';
    for (let i = 0; i < asUint8.length; i++) {
      const byte = asUint8[i];
      if (byte === undefined) continue;
      out += String.fromCharCode(byte);
    }
    return out;
  } catch {
    return '';
  }
};

export function decodeDnsPacket(
  data: Uint8Array,
  bufferFactory?: Pick<BufferFactory, 'from'> | null,
): DecodedPacket {
  return dns.decode(toNodeBuffer(data, bufferFactory));
}

export function encodeTxtDnsQuery(queryName: string, queryId: number): Uint8Array {
  return dns.encode({
    type: 'query' as const,
    id: queryId,
    flags: 0x0100,
    questions: [
      {
        type: 'TXT' as const,
        class: 'IN' as const,
        name: queryName,
      },
    ],
  });
}

export function createTcpTxtDnsQueryFrame(
  queryName: string,
  queryId: number,
  bufferFactory: BufferFactory,
): BufferLike {
  const queryBuffer = bufferFactory.from(encodeTxtDnsQuery(queryName, queryId));
  const lengthPrefix = bufferFactory.allocUnsafe(2);

  if (lengthPrefix.writeUInt16BE) {
    lengthPrefix.writeUInt16BE(queryBuffer.length, 0);
  } else {
    lengthPrefix[0] = (queryBuffer.length >> 8) & 0xff;
    lengthPrefix[1] = queryBuffer.length & 0xff;
  }

  return bufferFactory.concat([lengthPrefix, queryBuffer]);
}

export function readTcpFrameLength(frame: BufferLike): number {
  if (frame.readUInt16BE) {
    return frame.readUInt16BE(0);
  }
  const high = frame[0] ?? 0;
  const low = frame[1] ?? 0;
  return (high << 8) | low;
}

export function validateDecodedDnsResponseForTxt(
  decoded: DecodedPacket,
  options: TxtResponseValidationOptions,
): void {
  if (decoded.id !== options.expectedQueryId) {
    throw new Error(
      `DNS response ID mismatch (expected ${options.expectedQueryId}, got ${decoded.id}) - possible spoofing attempt`,
    );
  }

  const flags = typeof decoded.flags === 'number' ? decoded.flags : 0;
  if ((flags & DNS_FLAG_QR) === 0) {
    throw new Error('DNS response missing QR flag');
  }

  const opcode = (flags & DNS_OPCODE_MASK) >>> 11;
  if (opcode !== 0) {
    throw new Error('DNS response opcode not standard query');
  }

  if ((flags & DNS_FLAG_TC) !== 0) {
    throw new Error('DNS response truncated (TC=1)');
  }

  const rcode = getDecodedRcode(decoded);
  if (rcode && rcode !== 'NOERROR') {
    throw new Error(`DNS query failed with rcode: ${rcode}`);
  }

  const questions = Array.isArray(decoded.questions) ? decoded.questions : [];
  if (questions.length !== 1) {
    throw new Error(`DNS response QDCOUNT=${questions.length}`);
  }

  const question = questions[0];
  const questionName = typeof question?.name === 'string' ? normalizeQuestionName(question.name) : '';
  if (questionName !== normalizeQuestionName(options.expectedQueryName)) {
    throw new Error('DNS response question name mismatch');
  }
  if (question?.type !== 'TXT' || question?.class !== 'IN') {
    throw new Error('DNS response question type/class mismatch');
  }

  if (
    typeof options.sourcePort === 'number' &&
    options.sourcePort !== options.expectedPort
  ) {
    throw new Error(
      `DNS response from unexpected source port: ${options.sourcePort}`,
    );
  }

  if (
    typeof options.sourceAddress === 'string' &&
    isIPv4Address(options.expectedServer) &&
    options.sourceAddress !== options.expectedServer
  ) {
    throw new Error(
      `DNS response from unexpected source address: ${options.sourceAddress}`,
    );
  }

  if (!decoded.answers || decoded.answers.length === 0) {
    throw new Error('No TXT records found');
  }
}

export function extractTxtRecordsFromDecodedResponse(
  decoded: DecodedPacket,
  validation: TxtResponseValidationOptions,
  bufferFactory?: Pick<BufferFactory, 'from'> | null,
): string[] {
  validateDecodedDnsResponseForTxt(decoded, validation);

  return (decoded.answers ?? [])
    .filter((answer) => answer.type === 'TXT')
    .map((answer) => {
      if (Array.isArray(answer.data)) {
        return answer.data.join('');
      }
      if (
        answer.data instanceof Uint8Array ||
        (answer.data && typeof answer.data === 'object' && 'length' in answer.data)
      ) {
        return safeDecodeBytes(answer.data as Uint8Array, bufferFactory);
      }
      return answer.data ? answer.data.toString() : '';
    })
    .filter((record) => record.length > 0);
}
