# Expo Runtime Recovery Plan (September 28, 2025)

## Observed Failures
- **Metro startup spam:** Expo CLI reports `TypeError: Invalid URL` resolved earlier, but current run now warns that server middleware is disabled and repeatedly logs `expo-router/babel` deprecation plus dozens of route default-export warnings.
- **Watchman recrawl loop:** `Recrawled this watch 31 times` after `tsconfig.json#include` changed; CLI instructs running `watchman watch-del ...` to clear state.
- **Expo router config gap:** CLI demands `unstable_useServerMiddleware: true` under the `expo-router` plugin, otherwise API routes/server middleware stay disabled.
- **Babel config deprecated path:** Still using `expo-router/babel` plugin even though SDK 54 prefers `babel-preset-expo` only; this causes repeated log spam on every build.
- **LiquidGlass bundle crash:** `TypeError: property is not configurable` thrown when re-exporting `LiquidGlassNative` twice from `src/components/liquidGlass/index.ts`, preventing route modules from evaluating. This blocks the bundle and triggers the cascade of missing default-export warnings.

## Immediate Goals
1. Restore Metro/iOS dev client to a clean run without runtime exceptions.
2. Ensure expo-router server middleware and typed routes are configured per SDK 54 guidance.
3. Eliminate noisy CLI/deprecation warnings so QA and Carmack can focus on harness outputs.

## Detailed TODO
1. **Reset Watchman state** ✅
   - Commands run: `watchman watch-del '/Users/mvneves/dev/MOBILE/chat-dns'` then `watch-project` to re-establish the watch.
   - TODO: add note to CONTRIBUTING/docs about clearing Watchman after changing `tsconfig` includes.
2. **Enable router server middleware** ✅
   - Updated `app.json` with `"expo-router": { "unstable_useServerMiddleware": true }` entry.
   - TODO: confirm Expo restart logs show middleware enabled.
3. **Modernize Babel config** ✅
   - Removed `expo-router/babel` plugin from `babel.config.js`; relying on `babel-preset-expo`.
   - TODO: verify the CLI deprecation warning disappears on next run.
4. **Fix LiquidGlass re-export collision** ✅
   - Removed duplicate `LiquidGlassNative` convenience re-export from `src/components/liquidGlass/index.ts`.
   - TODO: add regression test or lint check to guard against reintroducing duplicate exports.
5. **Audit route modules post-fix**
   - Once LiquidGlass loads, re-run Metro to confirm tabs/routes (`_layout`, `index`, `logs`, etc.) all default-export components.
   - If any warning persists, inspect the corresponding file for default export mismatches or conditional exports.
6. **Document recovery steps**
   - Update `docs/INSTALL.md` or add a troubleshooting entry describing the middleware flag, Babel change, and Watchman reset for future reference.
7. **Stabilize tab glass fallback** ✅
   - Adjusted Expo Router tabs layout to always mount `LiquidGlassWrapper` on iOS so fallback styling appears even when native glass is unavailable.
   - TODO: capture screenshots on iOS 17/18 simulators to confirm the styled fallback.

## Verification Checklist
- [ ] Metro/dev client boots with no TypeErrors or expo-router warnings.
- [ ] Watchman no longer reports repeated recrawls on subsequent edits.
- [ ] `expo-router/babel` deprecation warning gone after Babel config change.
- [ ] LiquidGlass components render without crashing; tabs screen loads correctly.
- [ ] Tab bar shows glass fallback styling on iOS 16-25 and native glass on iOS 26+ devices.
- [ ] Documentation reflects the new configuration guidance.

---
Prepared for review by John Carmack — awaiting sign-off before implementation.
