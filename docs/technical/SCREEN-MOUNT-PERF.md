# Screen mount performance

The metric this repo tracks for "how fast does a screen load" is the **React
commit time to mount a route**, measured on the iOS simulator with the Argent
React profiler. It is the closest analogue to a page load in an app that has no
page loads: the work between the navigation event and the screen being on
screen and interactive.

Provisional target: **50ms of dev-mode commit time per screen**. This is not an
enforced budget yet: the recorded baseline includes a screen above the target,
and the assumption that dev renders run roughly 3x slower than production has
not been validated for this app. Measure in dev because that is the only build
the Hermes React profiler can attach to.

## Protocol

Deviating from any of these makes the numbers incomparable. The first two steps
exist because unwarmed runs are dominated by first-require cost - an unwarmed
chat screen measured 88ms against 27ms warm, which is module initialisation,
not render work.

1. Fixed device: iPhone 17, iOS 27.0 simulator. One device, every run.
2. Fixed fixture state: onboarding completed, exactly one chat thread with two
   messages, Mock DNS enabled.
3. Debug build installed from `xcodebuild -configuration Debug`, Metro on 8081.
4. `restart-app`, wait for the screen to settle.
5. **Warm-up sweep**: walk the full route list once, unprofiled.
6. Return to the chat list. `debugger-connect`, then `react-profiler-start`.
7. **Measured sweep**, 2.5s between steps so each screen's commits are
   attributable: Logs tab, About tab, Chat tab, chat thread row, back,
   `dnschat://settings`.
8. `react-profiler-stop`, then `react-profiler-analyze` with one annotation per
   step (`offsetMs = tapTimestampMs - startedAtEpochMs`).
9. Per screen, sum every commit in that screen's annotation window - not just
   the ones over the profiler's 16ms hot floor.

Treat swings under 10-15% as noise. Record host load with the numbers; a busy
machine moves the whole floor.

## Baseline (2026-08-12, app 4.3.5)

| Screen | Route | Dev commit time | Provisional target |
|---|---|---|---|
| Logs tab | `(tabs)/logs` | < 2ms | pass |
| About tab | `(tabs)/about` | 1.8ms | pass |
| Chat list tab | `(tabs)/index` | 19.4ms | pass |
| Chat thread | `chat/[threadId]` | 27.0ms | pass |
| Settings modal | `(modals)/settings` | 65.8ms | **over** |

The settings modal exceeded the provisional target. Its component-count
breakdown was captured before the current de-glassing changes and is no longer
reliable enough to describe the present tree. No comparable profiler run exists
after those changes, so this result remains an unresolved baseline that must be
remeasured with the protocol above. Until then, do not claim that the target is
met or that the settings mount regression is fixed.

An earlier run recorded 100.0ms while glass surfaces mounted twice; see the
`[Unreleased]` changelog entry and
`__tests__/liquidGlassWrapper.remount.spec.tsx`. That regression test covers the
remount behavior, not the current screen-level performance target.

## Routes not yet covered

`onboarding` (only reachable on a fresh install), `dev/logs`, `+not-found`,
`[user]`, and `profile/[user]`. All are reachable by deep link and can be added
to the sweep; they were left out of the first baseline, not measured and hidden.
