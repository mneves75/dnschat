import { Buffer } from 'buffer';
import {
  createTcpTxtDnsQueryFrame,
  decodeDnsPacket,
  encodeTxtDnsQuery,
  extractTxtRecordsFromDecodedResponse,
  readTcpFrameLength,
  type BufferFactory,
} from '../src/services/dnsWire';

const bufferFactory = Buffer as unknown as BufferFactory;

describe('DNS wire helpers', () => {
  it('encodes TXT queries through one reusable wire interface', () => {
    const query = encodeTxtDnsQuery('hello.ch.at', 1234);
    const decoded = decodeDnsPacket(query, bufferFactory);

    expect(decoded.id).toBe(1234);
    expect(decoded.type).toBe('query');
    expect(decoded.questions).toEqual([
      {
        name: 'hello.ch.at',
        type: 'TXT',
        class: 'IN',
      },
    ]);
  });

  it('frames DNS-over-TCP queries with the RFC length prefix', () => {
    const frame = createTcpTxtDnsQueryFrame('hello.ch.at', 4321, bufferFactory);
    const expectedLength = readTcpFrameLength(frame);
    const payload = frame.slice(2);
    const decoded = decodeDnsPacket(payload, bufferFactory);

    expect(expectedLength).toBe(payload.length);
    expect(decoded.id).toBe(4321);
    expect(decoded.questions?.[0]?.name).toBe('hello.ch.at');
  });

  it('validates a TXT response and extracts records in one step', () => {
    const decoded = {
      id: 1111,
      type: 'response',
      flags: 0x8100,
      rcode: 'NOERROR',
      questions: [{ name: 'hello.ch.at', type: 'TXT', class: 'IN' }],
      answers: [
        { name: 'hello.ch.at', type: 'TXT', class: 'IN', data: ['hello '] },
        { name: 'hello.ch.at', type: 'TXT', class: 'IN', data: Buffer.from('world') },
      ],
    } as unknown as import('dns-packet').DecodedPacket;

    expect(
      extractTxtRecordsFromDecodedResponse(
        decoded,
        {
          expectedQueryId: 1111,
          expectedQueryName: 'hello.ch.at',
          expectedPort: 53,
          expectedServer: 'ch.at',
        },
        bufferFactory,
      ),
    ).toEqual(['hello ', 'world']);
  });
});
