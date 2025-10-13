# Repository Guidelines

## Overriding Rules
**IMPORTANT**: These instructions override defaults.  
- No new documentation files unless asked; temporary notes live in `agent_planning/` then archive.  
- `ast-grep --lang <language> -p '<pattern>'` is mandatory for structural searches (CHANGELOG included); touch `rg`/`grep` only when told.  
- Never introduce emojis in code or commits.  
- Follow this workflow; do not invent alternate guides.

## Documentation Map
Read `AGENTS.md`, then `PROJECT_STATUS.md`, `README.md`; `QUICKSTART.md` optional. Consult `DOCS/`.

## Project Structure & Module Organization
- `app/` hosts Expo Router routes such as `app/(tabs)/` and `app/modal.tsx`.  
- `components/` provides shared UI and hooks with colocated tests in `components/__tests__/`.  
- `constants/` stores tokens, `assets/` holds media; keep `app.json`, `tsconfig.json`, and `package.json` aligned when platform flags change.

## Build, Test, and Development Commands
- `npm install` per clone. `npm start` runs Metro; `npm run ios` / `npm run android` launch simulators (set Java 17 via `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`).  
- `npm run web` offers a browser preview; `npx expo start --clear` resets stale caches.  
- Before releases, cover iOS, Android, web, and live DNS paths; note blockers in `PROJECT_STATUS.md`.

## Coding Style & Naming Conventions
- Strict TypeScript/TSX, 2-space indent, no `any`.  
- PascalCase components, camelCase hooks, bracketed route folders; use the `@` alias.  
- Prefer `StyleSheet.create`, React Compiler defaults, `@shopify/flash-list` for long lists; run `npx prettier --write .` and strip production `console.log`.

## Testing Guidelines
- Place Jest suites beside source with a `-test` suffix (e.g., `components/__tests__/StyledText-test.js`).  
- Run `npx expo test` or targeted `npx jest <path>` once `jest-expo` is installed; mock DNS, network, and timers.  
- Smoke-test release builds (`expo run:ios --configuration Release`, Android release variant) plus live DNS paths.

## Commit & Pull Request Guidelines
- Keep work KISS and reversible; use Conventional Commits (`feat(dns): …`) on `feature/...` or `fix/...` branches.  
- Commit only touched paths via `git commit -m "<scope>" -- path1 path2`; never lump unrelated files.  
- PRs must document impact, verification commands, issue links, UI proof, and DNS validation; picture John Carmack reviewing.

## Security, Performance & Platform Notes
- Never commit secrets; rely on local `.env`.  
- Expo SDK 54 enables `"newArchEnabled": true`; guard `expo-glass-effect` with `isLiquidGlassAvailable()` and offer blur/solid fallbacks.  
- Cap glass effects near ten per screen, pause during heavy animation, and confirm VoiceOver/TalkBack plus 4.5:1 contrast.  
- Prefer Swift (then Objective-C/C/C++) for native samples, using Swift concurrency when possible; ship only after iOS, Android, and DNS smoke tests pass.
