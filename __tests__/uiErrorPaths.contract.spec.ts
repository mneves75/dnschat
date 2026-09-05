import fs from "node:fs";

/**
 * Source-policy guards for plan 005 (UI error-path hardening). These flows are
 * not covered by a render harness in this repo; the specs pin the structural
 * contract so a regression re-introduces a swallowed rejection or a locked
 * spinner loudly instead of silently.
 */
describe("UI error-path hardening", () => {
  const logsSource = fs.readFileSync("src/navigation/screens/Logs.tsx", "utf8");
  const chatListSource = fs.readFileSync(
    "src/navigation/screens/GlassChatList.tsx",
    "utf8",
  );
  const chatSource = fs.readFileSync("src/navigation/screens/Chat.tsx", "utf8");
  const chatRouteSource = fs.readFileSync("app/chat/[threadId].tsx", "utf8");

  it("Logs pull-to-refresh clears the spinner through .finally even on failure", () => {
    const refreshBlock = logsSource.slice(
      logsSource.indexOf("const handleRefresh"),
      logsSource.indexOf("const toggleExpanded"),
    );
    expect(refreshBlock).toContain(".finally(");
    expect(refreshBlock).toContain("setRefreshing(false)");
    // The old unguarded shape (await then a bare setRefreshing(false)) is gone.
    expect(refreshBlock).not.toContain(
      "await loadLogs();\n    setRefreshing(false);",
    );
    // React Compiler convention: no try/finally block in the refresh path.
    expect(refreshBlock).not.toContain("} finally {");
  });

  it("Logs surfaces load failures without updating state after unmount", () => {
    expect(logsSource).toContain('testID="logs-load-error"');
    expect(logsSource).toContain("void loadLogs().catch(() => undefined)");
    expect(logsSource).toContain("const isMountedRef = useRef(true)");
    expect(logsSource).toContain("isMountedRef.current = false;");
    expect(logsSource).toContain("setLoadFailed(true)");
  });

  it("GlassChatList guards New Chat against a double fire", () => {
    expect(chatListSource).toContain(
      "const isCreatingChatRef = React.useRef(false)",
    );
    expect(chatListSource).toContain("if (isCreatingChatRef.current) {");
    expect(chatListSource).toContain("isCreatingChatRef.current = true;");
    expect(chatListSource).toContain("isCreatingChatRef.current = false;");
    // The create + navigate is wrapped so the rethrow cannot escape.
    expect(chatListSource).toContain("const newChat = await createChat();");
    expect(chatListSource).toContain(
      'devWarn("[GlassChatList] Failed to create chat"',
    );
  });

  it("GlassChatList re-arms dismissed errors on a new action", () => {
    // Both the create and refresh entry points reset the dismissed-error latch.
    const dismissedResets =
      chatListSource.match(/setDismissedError\(null\)/g) ?? [];
    expect(dismissedResets.length).toBeGreaterThanOrEqual(2);
    expect(chatListSource).toContain(
      'devWarn("[GlassChatList] Failed to refresh chats"',
    );
  });

  it("GlassChatList keeps low-value aggregate statistics out of the primary path", () => {
    expect(chatListSource).not.toContain('testID="chat-list-total-messages"');
    expect(chatListSource).not.toContain('testID="chat-list-average-messages"');
    expect(chatListSource).not.toContain("chats.reduce(");
  });

  it("Chat send flow re-arms the dismissed error latch", () => {
    expect(chatSource).toContain("setDismissedError(null)");
    // The reset happens inside the send entry point, before sendMessage.
    const sendBlock = chatSource.slice(
      chatSource.indexOf("const handleSendMessage"),
      chatSource.indexOf("const handleRetryLastFailedMessage"),
    );
    expect(sendBlock).toContain("setDismissedError(null)");
    expect(sendBlock).toContain("await sendMessage(message)");
  });

  it("chat route retries the auto-create on failure, but with a bounded cap", () => {
    const createBlock = chatRouteSource.slice(
      chatRouteSource.indexOf('lastAttemptedRef.current = "new"'),
      chatRouteSource.indexOf(".finally(() => setIsResolving(false))"),
    );
    // Re-arms the guard so a transient failure recovers…
    expect(createBlock).toContain("lastAttemptedRef.current = null;");
    // …but only under an attempts cap: this effect re-fires when isResolving
    // settles, so an unconditional reset would loop create/fail unboundedly.
    expect(createBlock).toContain(
      "createAttemptsRef.current < MAX_AUTO_CREATE_ATTEMPTS",
    );
    expect(chatRouteSource).toContain("const MAX_AUTO_CREATE_ATTEMPTS = 3");
    expect(createBlock).toContain(
      'devWarn("[ChatRoute] Failed to create chat"',
    );
  });

  it("chat route clears the auto-create guards after a successful creation", () => {
    // Expo Router reuses the route component across param changes, so stale
    // refs would block a later parameterless visit from auto-creating and old
    // transient failures would permanently consume the retry budget. Both
    // success paths (effect-driven auto-create and the manual "start new
    // chat" action) must reset the guards.
    const marker = ".then((chat) => {";
    const successBlocks: string[] = [];
    let cursor = chatRouteSource.indexOf(marker);
    while (cursor !== -1) {
      const end = chatRouteSource.indexOf("setCurrentChat(chat)", cursor);
      successBlocks.push(chatRouteSource.slice(cursor, end));
      cursor = chatRouteSource.indexOf(marker, cursor + marker.length);
    }
    expect(successBlocks.length).toBe(2);
    for (const block of successBlocks) {
      expect(block).toContain("lastAttemptedRef.current = null;");
      expect(block).toContain("createAttemptsRef.current = 0;");
    }
  });

  it("chat route grants a fresh auto-create budget when the route target changes", () => {
    // A failed burst must not exhaust the guards forever: a NEW visit
    // (normalized target change) resets both refs so storage recovery is
    // reachable, while the attempts cap still bounds a single visit.
    const resetEffect = chatRouteSource.slice(
      chatRouteSource.indexOf("a new route target is a new visit"),
      chatRouteSource.indexOf("[normalizedThreadId]"),
    );
    expect(resetEffect).toContain("lastAttemptedRef.current = null;");
    expect(resetEffect).toContain("createAttemptsRef.current = 0;");
    expect(chatRouteSource).toContain("}, [normalizedThreadId]);");
  });
});
