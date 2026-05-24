/**
 * Screenshot Mode Utilities
 *
 * Detects screenshot mode and provides mock data for App Store screenshots.
 * Screenshot mode is enabled when the app is launched with -SCREENSHOT_MODE 1 argument.
 */

import { NativeModules, Platform } from "react-native";
import type { Message } from "../types/chat";
import type { DNSQueryLog } from "../services/dnsLogService";

// Get reference to ScreenshotModeModule for iOS
const ScreenshotModeModule = NativeModules["ScreenshotModeModule"];

// Check if running in screenshot mode
export function isScreenshotMode(): boolean {
  if (Platform.OS === "ios") {
    // Method 1: Check custom ScreenshotModeModule (reads UserDefaults and ProcessInfo)
    try {
      if (ScreenshotModeModule?.isScreenshotMode !== undefined) {
        return ScreenshotModeModule.isScreenshotMode === true;
      }
    } catch (error) {
      // Module not available, try fallback
    }

    // Method 2: Fallback to deprecated Settings module
    try {
      const Settings = NativeModules["Settings"];
      if (Settings && Settings["get"]) {
        const screenshotMode = Settings["get"]("SCREENSHOT_MODE");
        return screenshotMode === "1" || screenshotMode === true;
      }
    } catch (error) {
      // Settings module not available
    }
  }

  // Fallback: Check for __DEV__ and global flag
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    if (typeof globalThis === "undefined") return false;
    const record = globalThis as Record<string, unknown>;
    return record["__SCREENSHOT_MODE__"] === true;
  }

  return false;
}

// Mock conversations for screenshots
export function getMockConversations(locale: string = "en-US") {
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
export function getMockDNSLogs(locale: string = "en-US"): DNSQueryLog[] {
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
