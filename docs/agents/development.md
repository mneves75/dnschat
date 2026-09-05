# Development and verification

AGENTS.md owns project policy. This file supplies executable mechanics; current
release state belongs in MEMORY.md. Commands run from the repository root unless
stated otherwise.

## Reproducible setup

Use the Node 24 line in `.node-version` and the pnpm version in
`package.json:packageManager`. Check `node --version` and `pnpm --version` before
diagnosing a gate. Node 26 is outside this project's supported range. Select the
supported runtime for this process; do not rewrite the user's global shell setup.

```sh
pnpm install --frozen-lockfile
pnpm run verify:fast
```

Install runs the dependency-free hook installer. It asks Git for the hooks path,
so regular clones and linked worktrees use the same mechanism. Custom
`core.hooksPath` directories must already exist inside the repository; shared
external paths are rejected to avoid installing project checks for other repos.
`pnpm run prepare` reinstalls an identical hook and its executable bit. A foreign
hook is preserved and installation fails with an actionable message; review the
configured path and integrate the checks manually. The hook checks pods,
formatting, lint and root unit tests; the full pre-commit acceptance gate remains
`pnpm run verify:all`.

## Worktrees and concurrent sessions

Create a worktree only when the user requests one. Give each concurrent task its
own branch, Metro port, DerivedData directory and simulator/emulator. Git hooks
may be shared across linked worktrees; do not install different hook contracts
concurrently. Worktrees isolate source, not devices, caches or listeners.

Use `git status -sb` and `git rev-parse --show-toplevel` before edits. Inspect a
listener with `lsof -nP -iTCP:<PORT> -sTCP:LISTEN`, then verify its owner with
`lsof -a -p <PID> -d cwd -Fn`. Reuse this project's healthy Metro or choose another
port. Do not kill another project's process or run parallel native builds.

```sh
pnpm run start --port <PORT>
pnpm run android --device <DEVICE> --port <PORT>
pnpm run ios --device <SIMULATOR> --port <PORT>
```

The Android wrapper selects JDK 17/21 and establishes port forwarding. For a
manually installed Debug APK, establish `adb -s <DEVICE> reverse tcp:<PORT>
tcp:<PORT>`. Pass that same port and device to Argent debugger tools. Raw adb is
for setup/diagnostics; use Argent for app interaction.

## Short feedback loop

1. Reproduce the changed behavior with one focused test or a local harness.
2. Make the smallest fix; rerun that check, typecheck and relevant lint.
3. For visible changes, inspect the actual compiled native app. For performance,
   replay the same workload and compare actual work counts before timings.
4. Freeze writers before review; run the complete acceptance gate once.
5. Fix verified findings, rerun affected checks, then commit the validated state.

```sh
pnpm run test --runTestsByPath __tests__/<test>.spec.ts
pnpm run typecheck
pnpm run lint
pnpm run verify:fast
pnpm run dns:harness --message test --local-server
pnpm run verify:all
```

Each gate must retain its exit status. A signal-killed linter, missing decoded
response, or malformed native alignment output is a failure. Android alignment
without build artifacts is a reported skip, not proof of the release binary.
The native module suite executes Java parser behavior through a JVM harness;
there is no configured iOS XCTest target.

`verify:react-doctor` pins its CLI and validates the JSON completion report.
An incomplete scan fails even when the upstream CLI exits zero. Warnings remain
visible; do not reshape working code merely to raise a heuristic score. The
September audit completed at 93/100 with three existing complexity warnings in
MessageBubble, GlassSettings and Logs. Check the underlying behavior before
turning those warnings into implementation work.

## Runtime and debug access

Use the installed Argent skills and `list-devices` first. Debug builds need a
reachable Metro; Release builds embed their bundle. A physical iPhone is selected
only for an explicitly requested hardware test. Never substitute Expo Go.

- `debugger-status`: verify the exact device, port and project root.
- `debugger-component-tree`: inspect mounted React components in Debug.
- `describe`: inspect the native accessibility tree, including Release builds.
- `await-ui-element`: wait for destination identity before acting; an unreadable
  tree is an environment failure, not proof of an absent control.
- `debugger-log-registry`: inspect runtime errors after the changed flow.
- React/Hermes profiling: find JS work and commits; native Instruments on iOS
  supplies native stacks. Report build mode and instrumentation overhead.

For repeatable QA, record the first walkthrough with `argent-qa-flows`. Use stable
test IDs, prove destination identity and readiness, and restore any test-created
state. Keep local recordings, device IDs, traces and screenshots private until
reviewed for publication. A saved acceptance flow must pass twice unchanged,
starting the first run with fresh services for that device. Do not weaken checks
or keep an unverified recording as a completed regression test.

The local `qa-audit-navigation-ios` flow expects completed onboarding, pt-BR,
an empty chat list and existing log history. It preserves that baseline and
checks chat list, About, Settings dismissal and Logs. Run it with `flow-execute`
using this checkout as `project_root` and an explicit device. Its idle warnings
do not establish visual stillness; destination selectors provide the behavioral
assertions. Keep screenshots and run output outside tracked source.

Before trusting a Debug UI pass, verify a changed control in the running bundle.
Reload alone can retain stale Metro output. A fresh project Metro on an unused
port with `--clear` rebuilt the audit candidate; on iOS a local simulator launch
argument `-RCT_jsLocation localhost:<PORT>` selects that server without changing
source. Confirm the runtime and screen after the rebuild. For Argent's
`unregistered` native instrumentation state, follow its recovery guidance and
keep teardown scoped to the selected device.

## Native build proof

On macOS 27 beta, select the beta Xcode explicitly because the stable build
service can terminate on that host. Keep builds sequential. Use a task-specific
`-derivedDataPath` when another checkout has build output in the default cache.

```sh
xcodebuild build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17'
xcodebuild build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO
xcodebuild archive -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/DNSChat-audit.xcarchive CODE_SIGNING_ALLOWED=NO
asc doctor
```

Precompiled Expo pods can be incompatible with a newer Swift compiler. Read the
actual error; if needed, install source pods with
`EXPO_USE_PRECOMPILED_MODULES=0 pod install` in `ios/`, then restore and verify the
committed precompiled pod state after the build. Never clean-prebuild away the
local SceneDelegate bridge. Check resolver copies with
`pnpm run verify:dnsresolver-sync` and pods with `pnpm run verify:ios-pods`.

Android CI builds both `:app:assembleDebug` and `:app:assembleRelease` with JDK 17,
then checks 16KB alignment. A signed or unsigned successful archive is compilation
evidence; it does not prove process survival, interactions or store acceptance.

For signed exports, an `exportArchive Copy failed` error may come from Homebrew
rsync shadowing Apple's binary; inspect the distribution log and use
`env PATH="/usr/bin:/bin:/usr/sbin:/sbin" xcodebuild -exportArchive ...` when that
cause is confirmed. Keep credentials and identifiers out of public evidence.

## Agent instruction verification

AGENTS.md is the shared contract; CLAUDE.md imports it. After changing either,
check that both entry points answer these tasks from the same sources:

1. Name the default DNS server, transport order and deadline.
2. Name the focused test, full gate and native runtime proof for a UI fix.
3. Describe when a worktree, push or production upload is authorized.
4. Locate current release state without treating an old build as new proof.
5. Explain what passing unit tests cannot establish about DNS privacy.

Verify the text and links locally. A fresh harness run is stronger evidence of
instruction loading; do not infer truncation merely by summing file sizes.
Keep historical tool failures in memory or troubleshooting docs, not duplicated
across the agent entry points.
