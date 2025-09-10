## iOS CocoaPods (SDK 54 / RN 0.81)

We standardize on CocoaPods 1.15.2 to avoid issues with RN podspec helpers under 1.16.x and to keep builds deterministic.

Recommended usage (enforced):

1. Use the repo scripts which enforce CocoaPods 1.15.2:
   - `npm run cp:check` — Verify the version.
   - `npm run clean-ios` — Clean + reinstall pods via the enforced wrapper (Bundler > shim _1.15.2_ > pod install).
   - `npm run fix-pods` — Comprehensive cleanup + enforced reinstall.

Alternative (Bundler; deterministic):

1. `cd ios`
2. `bundle install`
3. `bundle exec pod install`

If you prefer a global pod installation, run:

```
pod _1.15.2_ install
```

Notes:

- Xcode 16.1+ is required by RN 0.81.
- If you hit cache issues, run `scripts/fix-cocoapods.sh` from repo root.
- To temporarily bypass the version check (not recommended), set `CP_ALLOW_ANY=1`.

Troubleshooting: Folly `coro/Coroutine.h` not found
-------------------------------------------------
If you see `'folly/coro/Coroutine.h' file not found`, ensure your Podfile sets
the following preprocessor definitions for all Pods targets (via `post_install`):

```
FOLLY_HAS_COROUTINES=0
FOLLY_CFG_NO_COROUTINES=1
```

This makes Folly compile paths consistent and avoids including coroutine-only headers when
the vendored RCT-Folly doesn’t ship them.
