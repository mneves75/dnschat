const MAX_LABEL_LENGTH = 63;
const VALID_CHAR_REGEX = /[^a-z0-9-]/g;

export function sanitizeDnsLabel(value: string): string {
  const lower = value.toLowerCase().replace(/\s+/g, '-');
  const cleaned = lower.replace(VALID_CHAR_REGEX, '').replace(/-+/g, '-');
  const trimmed = cleaned.replace(/^-+|-+$/g, '');
  const fallback = trimmed || 'prompt';
  return fallback.slice(0, MAX_LABEL_LENGTH);
}

export function chunkLabel(value: string): string[] {
  const chunks: string[] = [];
  let remaining = value;
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, MAX_LABEL_LENGTH));
    remaining = remaining.slice(MAX_LABEL_LENGTH);
  }
  return chunks;
}

export function buildDnsQueryLabel(message: string, conversationId: string): string {
  const sanitizedMessage = sanitizeDnsLabel(message);
  const normalizedConversation = sanitizeDnsLabel(conversationId);
  const combined = `${normalizedConversation}-${sanitizedMessage}`;
  const segments = chunkLabel(combined);
  return segments.join('.');
}
