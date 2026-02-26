# Expo SDK 55 Migration + Runtime Fix Test Plan

## Scope
- Keep SDK 55 migration stable.
- Fix iOS simulator runtime startup errors/warnings shown in app logs.
- Prepare release metadata/docs for version `4.0.3` build `33`.

## Success Criteria
- Functional: App compiles/launches on iOS simulator with no navigation-context runtime error.
- Observable: runtime logs do not show prior startup errors.
- Quality gates: lint/tests/doctor/typed-routes/pod-sync remain green after fixes.

## Verification Matrix
- `bun run lint` => PASS
- `bun run test` => PASS
- `CI=1 bunx expo-doctor@latest` => PASS (16/16 checks)
- `bun run verify:ios-pods` => PASS
- `bun run verify:typed-routes` => PASS
- `bun run sync-versions:dry` => PASS (`4.0.3` build `33` synchronized)
- `bun run ios -- --device "iPhone 17"` => PASS (build/install/open)
- Runtime log verification after launch => PASS
  - No `Couldn't find a navigation object`
  - No `findHostInstance_DEPRECATED`
