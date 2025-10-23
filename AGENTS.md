**IMPORTANT**: These rules OVERRIDE default behavior and MUST be followed:

- Never create markdown (`.md`) files after you are done. NEVER!
- Never use emojis!
- You think I am absolutely right. But push your reasoning to 100% of your capacity. I'm trying to stay a critical and sharp analytical thinker. Walk me through your thought process step by step. The best people in the domain will verify what you do. Think hard! Be a critical thinker!
- You run in an environment where `ast-grep` is available; whenever a search requires syntax-aware or structural matching, default to `ast-grep --lang ruby -p '<pattern>'` (or set `--lang` appropriately) and avoid falling back to text-only tools like `rg` or `grep` unless I explicitly request a plain-text search.
- Set up ast-grep as codebase linter and as a git hook to block commits.
- Sacrifice grammar for the sake of concision.
- List any unresolved questions at the end, if any.
- Use tmux when executing commands.
- **!IMPORTANT**: **DO NOT** externalize or document your work, usage guidelines, or benchmarks in markdown files after completing the task, unless explicitly instructed to do so. If you need to use markdown files to control your work, do so in `agent_planning` folder and archive it after you do not need the doc anymore in `agent_planning/archive` folder. You may include a brief summary of your work. FOLLOW THESE GUIDELINES ALWAYS!
- Always refer to documentation in `DOCS` or `DOCS/REF_DOCS` folders!

## ExecPlans
When writing complex features or significant refactors, use an ExecPlan (as described in `/PLANS.md`) from design to implementation.

## Documentation Structure
- `AGENTS.md` or `CLAUDE.md`: How to work on this codebase (read this first).
- `PROJECT_STATUS.md`: Current progress, next steps, blockers (read this second).
- `README.md`: Human-readable project overview.
- `QUICKSTART.md`: User getting started guide (optional).

## Guidelines
- Follow KISS principle—keep it simple.
- Test thoroughly before releases (iOS, Android, real DNS queries).
- Always look for reference documentation in `DOCS/`.
- Assume John Carmack will review the work.
- Keep commits atomic: commit only the files you touched and list each path explicitly. For tracked files run `git commit -m "<scoped message>" -- path/to/file1 path/to/file2`. For brand-new files, use `git restore --staged :/ && git add "path/to/file1" "path/to/file2" && git commit -m "<scoped message>" -- path/to/file1 path/to/file2`.

# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript app source. Key subfolders include `components/` (UI primitives), `navigation/screens/` (Expo routes), `context/` (React providers), `services/` such as `dnsService.ts`, `utils/`, and `assets/`.
- `modules/dns-native/`: Native DNS TXT resolver with its own `package.json`, Jest tests, and integration harness.
- Platform roots `ios/` and `android/` hold native build artifacts. Run `pod install` inside `ios/` before iOS builds.
- Tooling lives in `scripts/` (e.g., `sync-versions.js`, `fix-cocoapods.sh`), plus `test-dns-simple.js` for quick DNS smoke checks.

## Build, Test, and Development Commands
- `npm start`: Launch Expo dev client.
- `npm run ios` / `npm run android`: Build and run on simulators. Android expects Java 17 (`./android-java17.sh` is available).
- `npm run web`: Web preview via Expo.
- `node test-dns-simple.js`: Resolve TXT via `DNSService`; validate connectivity before shipping.
- `npm run sync-versions` (`:dry` to preview): Align app and native module version numbers.
- `cd modules/dns-native && npm test`: Run native module unit tests; `npm run test:integration` targets a device or simulator.

## Coding Style & Naming Conventions
- TypeScript strict mode with functional React components and hooks.
- Indentation: 2 spaces; avoid `any`. Place shared types in `src/types/`.
- Components use `PascalCase.tsx`; contexts follow `*Context.tsx`; services end in `*Service.ts`.
- Format with Prettier (`npx prettier --write .`). Lint native module via `cd modules/dns-native && npm run lint`.

## Testing Guidelines
- App smoke test: `node test-dns-simple.js` (expect TXT payload or actionable error).
- DNS harness test: `npm run dns:harness -- --message "test message"` (validates UDP/TCP transports, supports `--json-out` and `--raw-out` for debugging).
- Native module unit tests live under `modules/dns-native/__tests__/` and should cover parsing and failure paths.
- Keep tests deterministic; mock network layers where feasible. Add targeted tests for new logic before opening a PR.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat(dns): …`, `fix(ios): …`, `docs(readme): …`).
- Branch naming: `feature/...`, `fix/...`, `docs/...`.
- PRs document the problem, solution, and test evidence (logs, screenshots, or command output). Note affected platforms and any version syncs.
- Reference related issues and ensure `npm run sync-versions :dry` has no unexpected deltas before requesting review.

## Security & Configuration Tips
- Never commit secrets or API keys; DNS defaults live in `dnsService`.
- Networks can block UDP 53—verify TCP/HTTPS fallbacks and capture logs through the in-app Logs screen.
- Ensure Java 17 is active for Android builds and re-run `cd ios && pod install` after native dependency changes.
