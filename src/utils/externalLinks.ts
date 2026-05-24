import { Linking } from "react-native";
import { devWarn } from "./devLog";

const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["https:", "mailto:"]);

function describeProtocol(url: string): string {
  try {
    return new URL(url).protocol || "unknown";
  } catch {
    return "invalid";
  }
}

export function isAllowedExternalUrl(url: string): boolean {
  if (url.trim() !== url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export async function openExternalUrl(url: string): Promise<boolean> {
  if (!isAllowedExternalUrl(url)) {
    devWarn("[ExternalLinks] Blocked unsupported external URL", {
      protocol: describeProtocol(url),
    });
    return false;
  }

  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    devWarn("[ExternalLinks] Failed to open external URL", {
      protocol: describeProtocol(url),
      error,
    });
    return false;
  }
}
