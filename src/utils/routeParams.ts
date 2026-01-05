const PROFILE_HANDLE_PATTERN = /^@[a-zA-Z0-9-_]+$/;

export function normalizeRouteParam(
  value?: string | string[],
): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const first = value.find((item) => item.trim());
    return first ? first.trim() : null;
  }

  return null;
}

export function parseProfileHandle(
  value?: string | string[],
): string | null {
  const normalized = normalizeRouteParam(value);
  if (!normalized || !PROFILE_HANDLE_PATTERN.test(normalized)) {
    return null;
  }

  return normalized.slice(1);
}
