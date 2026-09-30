import type { Buffer as NodeBuffer } from "buffer";
import type { DecodedPacket } from "dns-packet";
import * as dns from "dns-packet";

export type BufferLike = Uint8Array & {
  readUInt16BE?: (offset: number) => number;
  writeUInt16BE?: (value: number, offset: number) => void;
};

export type BufferFactory = {
  alloc(size: number): BufferLike;
  concat(chunks: BufferLike[]): BufferLike;
  from(data: Uint8Array | ArrayBuffer | ArrayLike<number>): BufferLike;
};

type TxtResponseValidationOptions = {
  expectedQueryId: number;
  expectedQueryName: string;
  expectedPort: number;
  expectedServer: string;
  sourceAddress?: string;
  sourcePort?: number;
};

type DecodedAnswer = NonNullable<DecodedPacket["answers"]>[number];
type MatchingTxtAnswer = DecodedAnswer & {
  data?: unknown;
  name: string;
  type: "TXT";
  class: "IN";
};
type DecodedPacketFlagFields = DecodedPacket & {
  flag_qr?: unknown;
  flag_tc?: unknown;
  opcode?: unknown;
};

const DNS_FLAG_QR = 0x8000;
const DNS_FLAG_TC = 0x0200;
const DNS_OPCODE_MASK = 0x7800;

const UTF8_DECODER =
  typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8") : null;
const normalizeQuestionName = (value: string): string => {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 46) end--;
  let needsNormalization = end !== value.length;
  for (let i = 0; i < end; i++) {
    const code = value.charCodeAt(i);
    if ((code >= 65 && code <= 90) || code <= 32 || code === 127) {
      needsNormalization = true;
      break;
    }
  }
  return needsNormalization ? value.slice(0, end).trim().toLowerCase() : value;
};

const isIPv4Address = (value: string): boolean => {
  let dots = 0,
    digits = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c === 46) {
      if (digits === 0 || digits > 3) return false;
      dots++;
      digits = 0;
    } else if (c >= 48 && c <= 57) digits++;
    else return false;
  }
  return dots === 3 && digits > 0 && digits <= 3;
};

const isTxtAnswerForQuery = (
  answer: DecodedAnswer,
  expectedNormalizedQueryName: string,
): answer is MatchingTxtAnswer => {
  if (answer.type !== "TXT" || answer.class !== "IN") return false;
  return (
    answer.name === expectedNormalizedQueryName ||
    (typeof answer.name === "string" &&
      normalizeQuestionName(answer.name) === expectedNormalizedQueryName)
  );
};

const toUint8Array = (value: unknown): Uint8Array | null => {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value) && value.buffer) {
    // SECURITY: Respect the view's bounds. Copying the whole backing buffer
    // could expose unrelated bytes (or wrong data) when the view is a slice.
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (value && typeof value === "object" && "length" in value) {
    const arrayLike = value as ArrayLike<number>;
    return new Uint8Array(arrayLike);
  }
  return null;
};

const toNodeBuffer = (
  data: Uint8Array,
  bufferFactory?: Pick<BufferFactory, "from"> | null,
): NodeBuffer => {
  if (typeof (data as BufferLike).readUInt16BE === "function")
    return data as unknown as NodeBuffer;
  if (bufferFactory && typeof bufferFactory.from === "function") {
    return bufferFactory.from(data) as unknown as NodeBuffer;
  }
  return data as unknown as NodeBuffer;
};

const getDecodedRcode = (decoded: DecodedPacket): string | undefined => {
  const record = decoded as { rcode?: unknown };
  return typeof record.rcode === "string" ? record.rcode : undefined;
};

const safeDecodeBytes = (
  bytes: unknown,
  bufferFactory?: Pick<BufferFactory, "from"> | null,
): string => {
  const asUint8 = toUint8Array(bytes);
  if (!asUint8) return "";
  try {
    if (typeof (asUint8 as BufferLike).readUInt16BE === "function")
      return toNodeBuffer(asUint8, bufferFactory).toString("utf8");
    if (UTF8_DECODER) return UTF8_DECODER.decode(asUint8);
  } catch {}
  try {
    return toNodeBuffer(asUint8, bufferFactory).toString("utf8");
  } catch {}
  try {
    let out = "";
    for (let i = 0; i < asUint8.length; i++) {
      const byte = asUint8[i];
      if (byte === undefined) continue;
      out += String.fromCharCode(byte);
    }
    return out;
  } catch {
    return "";
  }
};

// A server may split a TXT RR into 255-byte character-strings at any byte, so a
// multibyte character can straddle two strings. Join the bytes of one RR before
// decoding; decoding each string separately turns both halves into U+FFFD.
const joinTxtCharacterStrings = (
  strings: readonly unknown[],
  bufferFactory?: Pick<BufferFactory, "from"> | null,
): string => {
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  for (const value of strings) {
    const chunk = typeof value === "string" ? null : toUint8Array(value);
    if (!chunk) return strings.join("");
    chunks.push(chunk);
    totalLength += chunk.length;
  }
  const joined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.length;
  }
  return safeDecodeBytes(joined, bufferFactory);
};

export function decodeDnsPacket(
  data: Uint8Array,
  bufferFactory?: Pick<BufferFactory, "from"> | null,
): DecodedPacket {
  const buffer = toNodeBuffer(data, bufferFactory);
  validateWireNames(buffer);
  return dns.decode(buffer);
}

// dns-packet joins labels without escaping embedded dots and decodes them as
// UTF-8. Check the app's ASCII name contract before those distinctions are lost.
function validateWireNames(data: NodeBuffer): void {
  const word = (offset: number): number => {
    if (offset + 2 > data.length) throw new Error("Truncated DNS packet");
    return (data[offset]! << 8) | data[offset + 1]!;
  };
  const nameEnd = (start: number, requireHostnameBytes = true): number => {
    let offset = start;
    let end: number | undefined;
    let expandedLength = 1;
    let jumps = 0;
    while (true) {
      const length = data[offset++];
      if (length === undefined) throw new Error("Truncated DNS name");
      if (length === 0) return end ?? offset;
      if ((length & 0xc0) === 0xc0) {
        if (++jumps > 10)
          throw new Error("DNS name exceeds 10 compression jumps");
        const target = word(offset - 1) & 0x3fff;
        if (target >= offset - 1) throw new Error("Invalid DNS name pointer");
        end ??= offset + 1;
        offset = target;
        continue;
      }
      if (length > 63 || offset + length > data.length)
        throw new Error("Invalid DNS label length");
      expandedLength += length + 1;
      if (expandedLength > 255) throw new Error("DNS name exceeds 255 bytes");
      for (let i = 0; requireHostnameBytes && i < length; i++) {
        const byte = data[offset + i]!;
        if (
          !(
            byte === 45 ||
            (byte >= 48 && byte <= 57) ||
            (byte >= 65 && byte <= 90) ||
            (byte >= 97 && byte <= 122)
          )
        )
          throw new Error("DNS label contains non-hostname bytes");
      }
      offset += length;
    }
  };
  if (data.length < 12) throw new Error("Truncated DNS header");
  let offset = 12;
  for (let i = 0; i < word(4); i++) {
    offset = nameEnd(offset) + 4;
    if (offset > data.length) throw new Error("Truncated DNS question");
  }
  const answerCount = word(6);
  const recordCount = answerCount + word(8) + word(10);
  for (let i = 0; i < recordCount; i++) {
    const start = offset;
    offset = nameEnd(offset, i < answerCount);
    const size = word(offset + 8);
    offset += 10 + size;
    if (offset > data.length) throw new Error("Truncated DNS answer");
    // The package exports its record decoder, but its typings omit it. Some
    // record codecs ignore RDLENGTH; require the exact boundary we validated.
    const recordDecoder = (
      dns as typeof dns & {
        answer: {
          decode: ((buffer: NodeBuffer, offset: number) => unknown) & {
            bytes: number;
          };
        };
      }
    ).answer.decode;
    recordDecoder(data.subarray(0, offset), start);
    if (recordDecoder.bytes !== offset - start)
      throw new Error("DNS record length mismatch");
  }
}

export function encodeTxtDnsQuery(
  queryName: string,
  queryId: number,
): Uint8Array {
  const query = new Uint8Array(queryName.length + 18);
  query[0] = (queryId >> 8) & 0xff;
  query[1] = queryId & 0xff;
  query[2] = 0x01;
  query[5] = 0x01;
  let offset = 13;
  let labelOffset = 12;
  for (let i = 0; i < queryName.length; i++) {
    const code = queryName.charCodeAt(i);
    if (code === 46) {
      const labelLength = offset - labelOffset - 1;
      if (labelLength > 63) {
        throw new Error(`DNS label exceeds 63 bytes: ${labelLength}`);
      }
      query[labelOffset] = labelLength;
      labelOffset = offset++;
    } else {
      query[offset++] = code;
    }
  }
  const labelLength = offset - labelOffset - 1;
  if (labelLength > 63) {
    throw new Error(`DNS label exceeds 63 bytes: ${labelLength}`);
  }
  query[labelOffset] = labelLength;
  query[offset + 1] = 0x00;
  query[offset + 2] = 0x10;
  query[offset + 4] = 0x01;
  return query;
}

export function createTcpTxtDnsQueryFrame(
  queryName: string,
  queryId: number,
  bufferFactory: BufferFactory,
): BufferLike {
  // RFC 1035 4.2.2: a TCP DNS message is the UDP wire format prefixed with a
  // 2-byte big-endian length. Reuse encodeTxtDnsQuery instead of duplicating
  // the label-encoding loop with shifted offsets.
  const query = encodeTxtDnsQuery(queryName, queryId);
  const frame = bufferFactory.alloc(query.length + 2);
  frame[0] = (query.length >> 8) & 0xff;
  frame[1] = query.length & 0xff;
  frame.set(query, 2);
  return frame;
}

export function readTcpFrameLength(frame: BufferLike): number {
  const high = frame[0] ?? 0;
  const low = frame[1] ?? 0;
  return (high << 8) | low;
}

export function validateDecodedDnsResponseForTxt(
  decoded: DecodedPacket,
  options: TxtResponseValidationOptions,
  checkAnswerMatch = true,
): string {
  if (decoded.id !== options.expectedQueryId) {
    throw new Error(
      `DNS response ID mismatch (expected ${options.expectedQueryId}, got ${decoded.id}) - possible spoofing attempt`,
    );
  }

  const decodedFlags = decoded as DecodedPacketFlagFields;
  const flags = typeof decoded.flags === "number" ? decoded.flags : 0;
  const hasQrFlag =
    (flags & DNS_FLAG_QR) !== 0 ||
    decoded.type === "response" ||
    decodedFlags.flag_qr === true;
  if (!hasQrFlag) {
    throw new Error("DNS response missing QR flag");
  }

  const opcode =
    typeof decodedFlags.opcode === "string"
      ? decodedFlags.opcode
      : (flags & DNS_OPCODE_MASK) >>> 11;
  if (opcode !== 0 && opcode !== "QUERY") {
    throw new Error("DNS response opcode not standard query");
  }

  if ((flags & DNS_FLAG_TC) !== 0 || decodedFlags.flag_tc === true) {
    throw new Error("DNS response truncated (TC=1)");
  }

  const rcode = getDecodedRcode(decoded);
  if (rcode && rcode !== "NOERROR") {
    throw new Error(`DNS query failed with rcode: ${rcode}`);
  }

  const questions = Array.isArray(decoded.questions) ? decoded.questions : [];
  if (questions.length !== 1) {
    throw new Error(`DNS response QDCOUNT=${questions.length}`);
  }

  let expectedNormalizedQueryName = options.expectedQueryName;
  const question = questions[0];
  if (question?.name !== expectedNormalizedQueryName) {
    expectedNormalizedQueryName = normalizeQuestionName(
      expectedNormalizedQueryName,
    );
    const questionName =
      question?.name === expectedNormalizedQueryName
        ? expectedNormalizedQueryName
        : typeof question?.name === "string"
          ? normalizeQuestionName(question.name)
          : "";
    if (questionName !== expectedNormalizedQueryName)
      throw new Error("DNS response question name mismatch");
  }
  if (question?.type !== "TXT" || question?.class !== "IN") {
    throw new Error("DNS response question type/class mismatch");
  }

  if (
    typeof options.sourcePort === "number" &&
    options.sourcePort !== options.expectedPort
  ) {
    throw new Error(
      `DNS response from unexpected source port: ${options.sourcePort}`,
    );
  }

  if (
    typeof options.sourceAddress === "string" &&
    isIPv4Address(options.expectedServer) &&
    options.sourceAddress !== options.expectedServer
  ) {
    throw new Error(
      `DNS response from unexpected source address: ${options.sourceAddress}`,
    );
  }

  const answers = Array.isArray(decoded.answers) ? decoded.answers : [];
  if (answers.length === 0) {
    throw new Error("No TXT records found");
  }
  if (checkAnswerMatch) {
    let matched = false;
    for (const answer of answers) {
      if (isTxtAnswerForQuery(answer, expectedNormalizedQueryName)) {
        matched = true;
        break;
      }
    }
    if (!matched) throw new Error("No matching TXT records found");
  }
  return expectedNormalizedQueryName;
}

export function extractTxtRecordsFromDecodedResponse(
  decoded: DecodedPacket,
  validation: TxtResponseValidationOptions,
  bufferFactory?: Pick<BufferFactory, "from"> | null,
): string[] {
  const expectedNormalizedQueryName = validateDecodedDnsResponseForTxt(
    decoded,
    validation,
    false,
  );

  const records: string[] = [];
  for (const answer of decoded.answers ?? []) {
    if (!isTxtAnswerForQuery(answer, expectedNormalizedQueryName)) continue;
    const record = Array.isArray(answer.data)
      ? joinTxtCharacterStrings(answer.data, bufferFactory)
      : answer.data instanceof Uint8Array ||
          (answer.data != null &&
            typeof answer.data === "object" &&
            "length" in answer.data)
        ? safeDecodeBytes(answer.data as Uint8Array, bufferFactory)
        : answer.data
          ? answer.data.toString()
          : "";
    if (record.length > 0) records.push(record);
  }
  if (records.length === 0) throw new Error("No matching TXT records found");
  return records;
}
