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
const ScreenshotModeModule = NativeModules.ScreenshotModeModule;

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
      const Settings = NativeModules.Settings;
      if (Settings && Settings.get) {
        const screenshotMode = Settings.get("SCREENSHOT_MODE");
        return screenshotMode === "1" || screenshotMode === true;
      }
    } catch (error) {
      // Settings module not available
    }
  }

  // Fallback: Check for __DEV__ and global flag
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    return (global as any).__SCREENSHOT_MODE__ === true;
  }

  return false;
}

// Mock conversations for screenshots
export function getMockConversations(locale: string = "en-US") {
  const isPortuguese = locale.startsWith("pt");

  const conversations = isPortuguese
    ? [
        {
          id: "mock-chat-1",
          title: "Conversa via DNS",
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          messages: [
            {
              id: "msg-1",
              content: "Como funciona a criptografia DNS?",
              sender: "user",
              timestamp: new Date(Date.now() - 3500000),
            },
            {
              id: "msg-2",
              content: "DNS Chat usa criptografia de ponta a ponta através de queries TXT. Cada mensagem é cifrada antes de ser enviada como query DNS.",
              sender: "assistant",
              timestamp: new Date(Date.now() - 3400000),
            },
            {
              id: "msg-3",
              content: "Isso é completamente privado?",
              sender: "user",
              timestamp: new Date(Date.now() - 3300000),
            },
            {
              id: "msg-4",
              content: "Sim! As mensagens são armazenadas apenas no seu dispositivo e transmitidas via DNS, tornando impossível a interceptação tradicional.",
              sender: "assistant",
              timestamp: new Date(Date.now() - 3200000),
            },
          ],
        },
        {
          id: "mock-chat-2",
          title: "Tecnologia DNS",
          createdAt: new Date(Date.now() - 7200000), // 2 hours ago
          messages: [
            {
              id: "msg-5",
              content: "Qual a velocidade do DNS Chat?",
              sender: "user",
              timestamp: new Date(Date.now() - 7100000),
            },
            {
              id: "msg-6",
              content: "Queries DNS são extremamente rápidas, geralmente respondendo em 100-500ms. O DNS Chat usa métodos nativos otimizados para iOS e Android.",
              sender: "assistant",
              timestamp: new Date(Date.now() - 7000000),
            },
          ],
        },
      ]
    : [
        {
          id: "mock-chat-1",
          title: "DNS Chat Demo",
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          messages: [
            {
              id: "msg-1",
              content: "How does DNS encryption work?",
              sender: "user",
              timestamp: new Date(Date.now() - 3500000),
            },
            {
              id: "msg-2",
              content: "DNS Chat uses end-to-end encryption through TXT queries. Each message is encrypted before being sent as a DNS query.",
              sender: "assistant",
              timestamp: new Date(Date.now() - 3400000),
            },
            {
              id: "msg-3",
              content: "Is this completely private?",
              sender: "user",
              timestamp: new Date(Date.now() - 3300000),
            },
            {
              id: "msg-4",
              content: "Yes! Messages are stored only on your device and transmitted via DNS, making traditional interception impossible.",
              sender: "assistant",
              timestamp: new Date(Date.now() - 3200000),
            },
          ],
        },
        {
          id: "mock-chat-2",
          title: "DNS Technology",
          createdAt: new Date(Date.now() - 7200000), // 2 hours ago
          messages: [
            {
              id: "msg-5",
              content: "How fast is DNS Chat?",
              sender: "user",
              timestamp: new Date(Date.now() - 7100000),
            },
            {
              id: "msg-6",
              content: "DNS queries are extremely fast, typically responding in 100-500ms. DNS Chat uses optimized native methods for iOS and Android.",
              sender: "assistant",
              timestamp: new Date(Date.now() - 7000000),
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
        ? "Como funciona a criptografia DNS?"
        : "How does DNS encryption work?",
      startTime: new Date(now - 5000),
      endTime: new Date(now - 4500),
      totalDuration: 500,
      finalStatus: "success" as const,
      finalMethod: "native",
      response: isPortuguese
        ? "DNS Chat usa criptografia de ponta a ponta através de queries TXT..."
        : "DNS Chat uses end-to-end encryption through TXT queries...",
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
      query: isPortuguese ? "Isso é privado?" : "Is this private?",
      startTime: new Date(now - 1000),
      endTime: new Date(now - 850),
      totalDuration: 150,
      finalStatus: "success" as const,
      finalMethod: "native",
      response: isPortuguese
        ? "Sim! As mensagens são armazenadas apenas no seu dispositivo..."
        : "Yes! Messages are stored only on your device...",
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
