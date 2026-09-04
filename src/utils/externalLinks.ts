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
    if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
      return false;
    }
    // SECURITY: reject userinfo. Model output is untrusted, and
    // "https://llm.pieter.com@evil.example/" parses with host "evil.example"
    // while reading as the trusted resolver in a confirmation dialog. Nothing
    // this app legitimately links to carries credentials in the URL.
    if (parsed.username !== "" || parsed.password !== "") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * The string a confirmation dialog should show for an external URL.
 *
 * Never show the raw href: it is attacker-controlled when it came from model
 * output, and a long or padded URL pushes the real host out of view. This
 * returns the host the tap will actually reach, which is the one fact the user
 * is being asked to approve.
 */
export function describeExternalUrlTarget(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "mailto:"
      ? parsed.pathname
      : `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "invalid";
  }
}

/** Fire-and-forget form for press handlers that don't care about the result. */
export function openExternalLink(url: string): void {
  void openExternalUrl(url);
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
