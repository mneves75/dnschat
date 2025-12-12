const DEFAULT_ZONE = "ch.at";
const DEFAULT_PORT = 53;
const MAX_MESSAGE_LENGTH = 120;
const MAX_DNS_LABEL_LENGTH = 63;

function isIpv4(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(trimmed)) return false;

  return trimmed
    .split(".")
    .every((octet) => octet.length > 0 && Number(octet) >= 0 && Number(octet) <= 255);
}

function stripTrailingDots(value) {
  return String(value || "").replace(/\.+$/g, "");
}

function sanitizeMessage(message) {
  const trimmed = String(message || "").trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty");
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message too long (maximum ${MAX_MESSAGE_LENGTH} characters before sanitization)`
    );
  }

  // Allow printable ASCII + common whitespace; reject other control chars.
  if (/[^\x09\x0A\x0D\x20-\x7E]/.test(trimmed)) {
    throw new Error("Message contains control characters that cannot be encoded safely");
  }

  let result = trimmed.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  result = result.toLowerCase();
  result = result.replace(/\s+/g, "-");
  result = result.replace(/[^a-z0-9-]/g, "");
  result = result.replace(/-{2,}/g, "-");
  result = result.replace(/^-+|-+$/g, "");

  if (!result) {
    throw new Error("Message must contain at least one letter or number after sanitization");
  }

  if (result.length > MAX_DNS_LABEL_LENGTH) {
    throw new Error(
      `Message too long after sanitization (maximum ${MAX_DNS_LABEL_LENGTH} characters)`
    );
  }

  return result;
}

function normalizeResolverInput(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;

  // If user passed host:port, split it.
  const match = raw.match(/^(.*?)(?::(\d+))?$/);
  const host = stripTrailingDots(match?.[1] || "").trim();
  const port = match?.[2] ? Number(match[2]) : null;

  return {
    host: host || null,
    port: port && Number.isFinite(port) ? port : null,
  };
}

function composeQueryName(label, zone) {
  const trimmedLabel = stripTrailingDots(label).trim();
  if (!trimmedLabel) {
    throw new Error("DNS label must be non-empty when composing query name");
  }

  const normalizedZone = stripTrailingDots(zone || DEFAULT_ZONE).trim().toLowerCase();
  if (!normalizedZone) {
    throw new Error("DNS zone must be non-empty when composing query name");
  }

  return `${trimmedLabel}.${normalizedZone}`;
}

/**
 * Interpret CLI flags for resolver/zone selection.
 *
 * In this repo, "ch.at" can be both:
 * - the DNS server (resolver) we query (dig @ch.at ...)
 * - the zone suffix where TXT records live (<label>.ch.at)
 *
 * We keep both configurable to support smoke-testing from different networks.
 */
function resolveTargetFromArgs({ resolverArg, zoneArg, portArg }) {
  const resolverParsed = normalizeResolverInput(resolverArg);
  const explicitPort = portArg && Number.isFinite(portArg) ? portArg : null;

  const resolverHost = resolverParsed?.host || DEFAULT_ZONE;
  const resolverPort = explicitPort || resolverParsed?.port || DEFAULT_PORT;
  const zone = stripTrailingDots(zoneArg || DEFAULT_ZONE).trim().toLowerCase();

  // If resolver is an IP and no explicit zone was provided, default to ch.at.
  const effectiveZone = zoneArg ? zone : isIpv4(resolverHost) ? DEFAULT_ZONE : zone;

  return {
    resolverHost,
    resolverPort,
    zone: effectiveZone,
  };
}

module.exports = {
  DEFAULT_ZONE,
  DEFAULT_PORT,
  MAX_MESSAGE_LENGTH,
  MAX_DNS_LABEL_LENGTH,
  isIpv4,
  sanitizeMessage,
  composeQueryName,
  resolveTargetFromArgs,
};

