# Carmack Verification Plan — Fresh Eyes Audit (September 28, 2025)

## Executive Context
- Carmack expects a **verification bundle** demonstrating the complete DNS pipeline (sanitize ➜ compose ➜ native bridge ➜ socket) working against both staging and production resolvers.
- The current repo lacks a dependable harness, produces no persistent artifacts, and its documentation drifts from the actual code base (now version 2.0.0).

## Critical Findings
1. **CLI query path is hard-wired to production and misrepresents the QNAME contract**  
   `test-dns-simple.js:11-130` always appends `.ch.at` and still sends UDP queries to `DEFAULT_SERVER` even if another server is requested, so we cannot target staging or confirm the "label-only" contract described in docs (`docs/CHAT_COMPAT_AUDIT.md:5-30`, `docs/CHAT_DNS_SERVER_COMPAT.md:6-48`).
2. **Sanitization rules contradict documentation about preserving `+`**  
   `modules/dns-native/constants.ts:15-93` and the React Native service (`src/services/dnsService.ts:120-210`) strip everything except `[a-z0-9-]`, but compatibility docs insist `+` survives. The mismatch guarantees reviewers see different QNAMEs than promised.
3. **DNS server whitelist blocks staging/production verification**  
   `validateDNSServer` in `src/services/dnsService.ts:180-205` rejects anything outside a baked list (`ch.at`, `llm.pieter.com`, Google, Cloudflare). QA cannot point the app or harness at staging resolvers or at production replicas when gathering logs.
4. **No cross-layer harness or log exporter**  
   There is no script that walks through sanitize ➜ compose ➜ native/UDP/TCP ➜ logging. `DNSLogService` (`src/services/dnsLogService.ts:18-208`) has no file-export path, so we cannot hand Carmack a reproducible set of resolver attempts, timings, or fallbacks.
5. **Documentation hub is out of sync with the actual `docs/` tree**  
   `docs/README.md:12-60` and `docs/guides/DOCUMENTATION-GUIDE.md:15-62` reference `docs/technical/`, `docs/troubleshooting/`, `Gemini` guides, etc., that no longer exist (only `apple/`, `architecture/`, `guides/`). This confuses reviewers and makes doc navigation impossible.
6. **Published docs and quick starts cite removed scripts and stale versions**  
   Examples: `docs/TECH-FAQ.md:32-88` and `docs/guides/QUICKSTART.md:30-90` still instruct `npm run clean` and `npm run android:java17`, neither of which exists (see `package.json:1-72`). `docs/INSTALL.md:1-60` claims "v1.7.7" even though we ship 2.0.0 (`package.json:1-8`), and README badges still advertise React Native 0.81.1 (`README.md:5-34`) instead of 0.81.4 + Expo 54.0.10.

## Secondary Findings
- CLI lacks fixture persistence, so QA cannot attach raw DNS packets to release checklists (`test-dns-simple.js:24-149`).
- Settings validation funnel logs failures but still forces users through the whitelist, impeding resolver rotation and staging comparisons (`src/context/SettingsContext.tsx:52-140`).
- Compatibility docs promise helper text under the chat input about allowed characters (`docs/CHAT_DNS_SERVER_COMPAT.md:31-48`), but no such UI exists today.
- The repo has no CHANGELOG entry covering the upcoming harness/fixture work, leaving reviewers without a paper trail (`CHANGELOG.md`).

## Numbered TODO (detailed action plan)
1. **Build a cross-layer harness (staging + production ready)**  
   - ✅ `scripts/run-dns-harness.ts` now pipes messages through sanitize → compose → native/UDP/TCP and emits JSON plus optional raw buffers.  
   - [ ] Add staging resolver presets + packaging hook so QA can invoke it from CI and drop artifacts under `_APP_STORE/verification/<date>/`.  
   - [ ] Plumb harness outputs into the release checklist automation (link run instructions in README/CHANGELOG once bundled).
2. **Fix the CLI smoke test and add fixture persistence**  
   - Update `test-dns-simple.js` to honour `--server`/`--port` for both composition and socket send, keep DNS label behaviour in sync with the resolved contract, and accept `--out <dir>` to write sanitized input, full QNAME, raw request/response buffers, and decoded TXT to disk.
3. **Decide and enforce the QNAME + sanitization contract**  
   - Resolve with resolver owners whether the resolver expects bare labels or `<label>.zone`. Apply the decision consistently across `composeDNSQueryName` (app + CLI) and all docs.  
   - If `+` must survive, adjust `DNS_CONSTANTS.ALLOWED_CHARS_PATTERN`, `sanitizeDNSMessageReference`, and add regression tests in `__tests__/dnsService.parse.spec.ts` covering `+` inputs plus multi-part TXT joins.
4. **Replace the hard-coded DNS whitelist with configuration**  
   - Allow a configurable allowlist (JSON or environment) that includes staging/prod hosts and optional IP/port overrides.  
   - Cache the list in AsyncStorage so QA can switch resolvers in Settings without rebuilding, and log the source of the override for traceability.
5. **Export resolver logs for the verification bundle**  
   - Extend `DNSLogService` with `exportLogs({ destination, format })` to flush the last N queries (including staging runs) to JSON + Markdown summaries.  
   - Have the new harness/CLI invoke the exporter automatically so Carmack gets identical artifacts from both JS and app-flavoured paths.
6. **Repair the documentation hub**  
   - Rewrite `docs/README.md` and `docs/guides/DOCUMENTATION-GUIDE.md` to reflect the actual tree (`apple/`, `architecture/`, `guides/`).  
   - Either restore the missing `technical/` and `troubleshooting/` directories or update links to their new locations. Include an index/table with correct paths.
7. **Update installation + FAQ content to match current tooling**  
   - Strip references to `npm run clean`, `npm run android:java17`, and add instructions for the real scripts (`npm run android`, `npm run android:java24`, etc.) in `docs/TECH-FAQ.md`, `docs/INSTALL.md`, and `docs/guides/QUICKSTART.md`.  
   - Refresh version banners to `2.0.0` and stamp the docs with the current date. Call out the upcoming harness deliverable so reviewers know it is in-flight.
8. **Refresh top-level project messaging**  
   - Update README badges and feature bullets to match `package.json` dependencies (React Native 0.81.4, Expo 54.0.10).  
   - Prepare a `CHANGELOG.md` entry summarizing the harness, whitelist change, fixture persistence, and documentation overhaul once complete.
9. **Assemble the Carmack review packet**  
   - Create `_APP_STORE/verification/2025-09-28/` (or current date) containing:  
     - Harness outputs (JSON + Markdown) for both staging and production runs.  
     - CLI fixtures written by `--out`.  
     - Exported DNS logs covering fallback scenarios.  
     - A short summary deck explaining transport order, sanitization, resolver configuration, and links to the artifacts with reproduction commands.

## Validation Checklist (post-implementation)
- [ ] Harness run succeeds against staging and production, yielding artifacts referenced in the packet.  
- [ ] Automated tests cover `+` preservation (or document why it is not supported) and server override behaviours.  
- [ ] Settings screen allows resolver changes without modifying code and logs the change.  
- [ ] Documentation navigation works end-to-end with no broken links or stale commands.  
- [ ] README/CHANGELOG reflect the new tooling and provide guidance for future verifications.
