/**
 * Screenshot Mode Utilities
 *
 * Detects screenshot mode and provides mock data for App Store screenshots.
 * Screenshot mode is enabled when the app is launched with -SCREENSHOT_MODE 1 argument.
 */

import { Platform, Settings } from "react-native";
import * as Localization from "expo-localization";
import type { DNSQueryLog } from "../services/dnsLogService";

// Check if running in screenshot mode
export function isScreenshotMode(): boolean {
  if (Platform.OS === "ios") {
    // The `-SCREENSHOT_MODE 1` launch argument is persisted to NSUserDefaults
    // (argument domain) and surfaced synchronously by RN's Settings module.
    // NSUserDefaults coerces the argument to 1, "1", or true.
    try {
      const raw: unknown = Settings?.get?.("SCREENSHOT_MODE");
      if (raw === 1 || raw === "1" || raw === true) {
        return true;
      }
    } catch {
      // Settings unavailable (e.g. unit tests) — fall through.
    }
  }

  // Dev-only escape hatch for Metro / Jest where neither native signal exists.
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    if (typeof globalThis === "undefined") return false;
    const record = globalThis as Record<string, unknown>;
    if (record["__SCREENSHOT_MODE__"] === true) {
      return true;
    }
  }

  return false;
}

// Resolve the locale used for screenshot mock content. Defaults to the device
// locale (driven by -AppleLanguages during capture) so pt-BR screenshots render
// Portuguese conversations and logs instead of English ones.
function resolveScreenshotLocale(explicit?: string | null): string {
  if (explicit) return explicit;
  try {
    return Localization.getLocales()[0]?.languageTag || "en-US";
  } catch {
    return "en-US";
  }
}

// Mock conversations for screenshots
export function getMockConversations(localeOverride?: string | null) {
  const locale = resolveScreenshotLocale(localeOverride);
  const isPortuguese = locale.startsWith("pt");

  const now = Date.now();
  const conversations = isPortuguese
    ? [
        {
          id: "mock-chat-1",
          title: "Conversa via DNS",
          createdAt: new Date(now - 3600000), // 1 hour ago
          updatedAt: new Date(now - 3200000),
          messages: [
            {
              id: "msg-1",
              content: "Como o DNSChat protege meu histórico?",
              role: "user" as const,
              timestamp: new Date(now - 3500000),
              status: "sent" as const,
            },
            {
              id: "msg-2",
              content: "O DNSChat criptografa o histórico local no dispositivo. As consultas DNS continuam observáveis, então não envie segredos ou dados pessoais.",
              role: "assistant" as const,
              timestamp: new Date(now - 3400000),
              status: "sent" as const,
            },
            {
              id: "msg-3",
              content: "As consultas DNS são privadas?",
              role: "user" as const,
              timestamp: new Date(now - 3300000),
              status: "sent" as const,
            },
            {
              id: "msg-4",
              content: "Não. O transporte DNS pode ser observado por resolvedores e redes. Use o app para prompts curtos e não sensíveis.",
              role: "assistant" as const,
              timestamp: new Date(now - 3200000),
              status: "sent" as const,
            },
          ],
        },
        {
          id: "mock-chat-2",
          title: "Tecnologia DNS",
          createdAt: new Date(now - 7200000), // 2 hours ago
          updatedAt: new Date(now - 7000000),
          messages: [
            {
              id: "msg-5",
              content: "Qual a velocidade do DNS Chat?",
              role: "user" as const,
              timestamp: new Date(now - 7100000),
              status: "sent" as const,
            },
            {
              id: "msg-6",
              content: "Queries DNS são extremamente rápidas, geralmente respondendo em 100-500ms. O DNS Chat usa métodos nativos otimizados para iOS e Android.",
              role: "assistant" as const,
              timestamp: new Date(now - 7000000),
              status: "sent" as const,
            },
          ],
        },
      ]
    : [
        {
          id: "mock-chat-1",
          title: "DNS Chat Demo",
          createdAt: new Date(now - 3600000), // 1 hour ago
          updatedAt: new Date(now - 3200000),
          messages: [
            {
              id: "msg-1",
              content: "How does DNSChat protect my history?",
              role: "user" as const,
              timestamp: new Date(now - 3500000),
              status: "sent" as const,
            },
            {
              id: "msg-2",
              content: "DNSChat encrypts local history on device. DNS queries remain observable, so do not send secrets or personal data.",
              role: "assistant" as const,
              timestamp: new Date(now - 3400000),
              status: "sent" as const,
            },
            {
              id: "msg-3",
              content: "Are DNS queries private?",
              role: "user" as const,
              timestamp: new Date(now - 3300000),
              status: "sent" as const,
            },
            {
              id: "msg-4",
              content: "No. DNS transport can be observed by resolvers and networks. Use the app for short, non-sensitive prompts.",
              role: "assistant" as const,
              timestamp: new Date(now - 3200000),
              status: "sent" as const,
            },
          ],
        },
        {
          id: "mock-chat-2",
          title: "DNS Technology",
          createdAt: new Date(now - 7200000), // 2 hours ago
          updatedAt: new Date(now - 7000000),
          messages: [
            {
              id: "msg-5",
              content: "How fast is DNS Chat?",
              role: "user" as const,
              timestamp: new Date(now - 7100000),
              status: "sent" as const,
            },
            {
              id: "msg-6",
              content: "DNS queries are extremely fast, typically responding in 100-500ms. DNS Chat uses optimized native methods for iOS and Android.",
              role: "assistant" as const,
              timestamp: new Date(now - 7000000),
              status: "sent" as const,
            },
          ],
        },
      ];

  return conversations;
}

// Mock DNS logs for screenshots
export function getMockDNSLogs(localeOverride?: string | null): DNSQueryLog[] {
  const locale = resolveScreenshotLocale(localeOverride);
  const isPortuguese = locale.startsWith("pt");

  const now = Date.now();

  return [
    {
      id: "log-1",
      query: isPortuguese
        ? "Como o DNSChat protege meu histórico?"
        : "How does DNSChat protect my history?",
      startTime: new Date(now - 5000),
      endTime: new Date(now - 4500),
      totalDuration: 500,
      finalStatus: "success" as const,
      finalMethod: "native",
      response: isPortuguese
        ? "O DNSChat criptografa o histórico local no dispositivo..."
        : "DNSChat encrypts local history on device...",
      entries: [
        {
          id: "entry-1",
          timestamp: new Date(now - 5000),
          status: "attempt",
          method: "native",
          message: isPortuguese ? "Iniciando query nativa iOS" : "Starting native iOS query",
          duration: 450,
        },
        {
          id: "entry-2",
          timestamp: new Date(now - 4550),
          status: "success",
          method: "native",
          message: isPortuguese ? "Resposta recebida" : "Response received",
          duration: 50,
        },
      ],
    },
    {
      id: "log-2",
      query: isPortuguese
        ? "Qual a velocidade do DNS Chat?"
        : "How fast is DNS Chat?",
      startTime: new Date(now - 3000),
      endTime: new Date(now - 2700),
      totalDuration: 300,
      finalStatus: "success" as const,
      finalMethod: "udp",
      response: isPortuguese
        ? "Queries DNS são extremamente rápidas..."
        : "DNS queries are extremely fast...",
      entries: [
        {
          id: "entry-3",
          timestamp: new Date(now - 3000),
          status: "attempt",
          method: "native",
          message: isPortuguese ? "Tentando query nativa" : "Attempting native query",
          duration: 100,
        },
        {
          id: "entry-4",
          timestamp: new Date(now - 2900),
          status: "fallback",
          method: "native",
          message: isPortuguese ? "Timeout nativo, alternando para UDP" : "Native timeout, falling back to UDP",
        },
        {
          id: "entry-5",
          timestamp: new Date(now - 2800),
          status: "success",
          method: "udp",
          message: isPortuguese ? "Query UDP bem-sucedida" : "UDP query successful",
          duration: 200,
        },
      ],
    },
    {
      id: "log-3",
      query: isPortuguese ? "As consultas DNS são privadas?" : "Are DNS queries private?",
      startTime: new Date(now - 1000),
      endTime: new Date(now - 850),
      totalDuration: 150,
      finalStatus: "success" as const,
      finalMethod: "native",
      response: isPortuguese
        ? "Não. O transporte DNS pode ser observado por resolvedores e redes..."
        : "No. DNS transport can be observed by resolvers and networks...",
      entries: [
        {
          id: "entry-6",
          timestamp: new Date(now - 1000),
          status: "success",
          method: "native",
          message: isPortuguese ? "Query nativa bem-sucedida" : "Native query successful",
          duration: 150,
        },
      ],
    },
  ];
}
