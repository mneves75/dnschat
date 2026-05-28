# Expo UI component migration plan

Reviewed on: 2026-05-26

## Implementation status

Status: partially implemented on 2026-05-26; revised on 2026-05-27 after
TestFlight startup-crash evidence.

- Message long-press actions now use `src/components/platform/NativeMenu.tsx`,
  backed by `@expo/ui/community/menu` on native platforms and an accessible RN
  fallback on web.
- Bottom sheets were rolled back to the React Native `Modal` implementation in
  `src/components/glass/GlassBottomSheet.tsx`. The local
  `NativeBottomSheet` adapter was removed because the build 47 crash evidence
  pointed at an early React Native fatal path after the Expo UI bottom-sheet
  migration, and hidden per-row native sheet mounts made the startup surface too
  broad for release.
- Direct app dependencies on `@react-native-menu/menu` and
  `react-native-gesture-handler` were removed. `react-native-gesture-handler`
  remains available transitively through Expo Router.
- Android menu icons are local XML assets; iOS menu icons use SF Symbols.
- `@expo/ui` required the Expo SDK 56 patch package set to stay aligned with
  Expo Doctor.
- A Bun native patch for `expo-modules-autolinking@56.0.13` keeps Expo Swift
  macro plugin resolution compatible with Bun's hoisted dependency layout.
- The iOS pod graph was refreshed for `React-Core-prebuilt` and
  `ReactNativeDependencies` after the SDK 56 package changes.
- Final validation included `bun run verify:all`, native DNS module tests,
  gitleaks, iOS Debug simulator build, and AXe release E2E. AXe passed 10
  feature groups after the harness was updated to resume localized onboarding
  states and close Expo UI sheets through the native close control when AXe
  option-tap dismissal is not exposed.
- Follow-up hardening on 2026-05-26 localized the web menu fallback close
  affordance, added adapter behavior tests, documented Expo UI's shared native
  dismissal switch, and fixed action sheet keys to avoid duplicate-label
  collisions. The 2026-05-27 crash review removed the bottom-sheet adapter and
  replaced those tests with a policy that prevents `@expo/ui/community/bottom-sheet`
  from being mounted before a sheet is opened. Verification: focused migration
  tests, `bun run typecheck`, `git diff --check`, `bun run verify:all`, native
  DNS module tests, and gitleaks.

## Decision

Adopt `@expo/ui` selectively, not as a full UI rewrite.

The current Expo UI docs make adoption worthwhile for native modal/menu
surfaces that DNSChat currently implements through a community dependency or
custom gesture/modal code. They do not justify replacing every React Native
primitive in the app. The migration should change every current surface where
Expo UI is a better fit, while keeping high-risk chat and list surfaces on the
existing implementation until parity is proven with runtime evidence.

## Evidence from current docs

Official docs reviewed:

- Expo UI overview: https://docs.expo.dev/versions/latest/sdk/ui/
- Drop-in replacements: https://docs.expo.dev/versions/latest/sdk/ui/drop-in-replacements/
- Drop-in Menu: https://docs.expo.dev/versions/latest/sdk/ui/drop-in-replacements/menu/
- Drop-in BottomSheet: https://docs.expo.dev/versions/latest/sdk/ui/drop-in-replacements/bottomsheet/
- Universal components: https://docs.expo.dev/versions/latest/sdk/ui/universal/
- Universal BottomSheet: https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/bottomsheet/
- Universal List: https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/list/
- Universal Switch: https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/switch/
- Universal TextInput: https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/textinput/
- Universal Button: https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/button/

Relevant doc facts:

- `@expo/ui` gives React access to native Jetpack Compose and SwiftUI controls.
- Universal components delegate to Compose on Android, SwiftUI on iOS, and web
  implementations where available.
- Drop-in replacements cover `Menu`, `BottomSheet`, `Picker`,
  `DateTimePicker`, `MaskedView`, `PagerView`, `SegmentedControl`, and
  `Slider`.
- Expo UI trees still require `Host`. Platform-specific trees require their
  own host imports; universal trees import `Host` from `@expo/ui`.
- Drop-in `MenuView` supports the app's current long-press context-menu model
  on Android and iOS, but the docs state web triggers render without firing
  actions.
- Drop-in `BottomSheet` is best suited for modal bottom sheet flows. It uses
  native modal sheet behavior on Android and iOS and a drawer overlay on web.
- Universal `TextInput` intentionally does not support every React Native
  `TextInput` prop and changes controlled-state semantics through
  `useNativeState`.
- Universal `List` offers native row chrome and pull-to-refresh, but web
  pull-to-refresh is not implemented yet.

## Current DNSChat surface inventory

Better-fit migration targets:

| Current surface | Current implementation | Expo UI target | Decision |
| --- | --- | --- | --- |
| Message long-press actions | `@react-native-menu/menu` in `src/components/MessageBubble.tsx` | `@expo/ui/community/menu` | Migrate native, keep a web fallback because Expo UI menu web actions do not fire. |
| DNS server/about/support sheets | Custom `GlassBottomSheet` in `src/components/glass/GlassBottomSheet.tsx` | None for the current release | Do not migrate for this release. The Expo UI bottom-sheet adapter widened the startup crash surface before real-device proof was available. Revisit only with a dedicated physical-device smoke plan. |
| Future picker-like selections | Custom sheet rows in `GlassSettings.tsx` | Drop-in or universal `Picker` only where the wheel/dropdown UX fits | Defer until the sheet migration is stable; picker may lose descriptive row copy. |

Not better as an immediate migration:

| Current surface | Reason to keep for now |
| --- | --- |
| `ChatInput` and `LiquidGlassTextInput` | The app depends on RN `TextInput` behavior, content-size callbacks, keyboard props, clear controls, Reanimated height, and local accessibility copy. Expo UI `TextInput` may become useful, but requires a dedicated parity spike. |
| `MessageList` / chat thread `FlatList` | The SDK 56 plan already says to keep `FlatList` for chat performance. Expo UI `List` is row-oriented and not a better fit for variable-height chat bubbles. |
| Settings/about form list chrome | Expo UI `List` is promising, but the current `Form` layer owns section headers, footers, right-content slots, test IDs, glass styling, navigation links, and bilingual accessibility hints. Migrate only after bottom sheets prove the Host/RN interop shape. |
| RN `Switch` in settings | RN `Switch` is already native and supports the app's current tinting. Expo UI `Switch` has a smaller API surface. Replace later only if visual QA proves system-native styling is preferred. |
| `NativeTabs` from Expo Router | The current SDK 56 tab layout already uses Expo Router native tabs. Expo UI does not improve this route-level navigation surface. |
| Custom glass buttons and pressables | These carry app-specific haptics, ripple behavior, send-button geometry, and iOS 26 glass behavior. Expo UI `Button` is useful for future simple forms, not for the chat composer. |

## Migration architecture

Create a small adapter layer before changing call sites:

- `src/components/platform/NativeMenu.tsx`
  - Native platforms: wrap `@expo/ui/community/menu`.
  - Web: keep an accessible RN fallback so copy/share actions still work.
  - Normalize `NativeActionEvent` handling so `MessageBubble` does not depend
    on package-specific event types.
The bottom-sheet adapter is intentionally absent. Any future attempt to use
`@expo/ui/community/bottom-sheet` must be isolated behind the existing
`GlassBottomSheet` API, must avoid mounting hidden native sheets for every list
row, and must ship only after simulator plus physical-device launch proof.

## Execution phases

### Phase 0: dependency and type proof

1. Run `bunx expo install @expo/ui`.
2. Inspect installed `.d.ts` files under `node_modules/@expo/ui` for:
   - `community/menu`
   - `community/bottom-sheet`
   - root `Host`, `Icon`, `RNHostView`
3. Confirm whether `@expo/material-symbols` is installed or bundled as needed
   for Android menu icons. Add it only if the installed types or examples
   require a direct dependency.
4. Run `bun install` if the lockfile is not updated by the Expo install path.
5. Run `bun run verify:ios-pods`; if pods changed, run the documented pod sync
   path and keep `ios/Podfile.lock` deterministic.

Stop condition: `package.json`, `bun.lock`, native dependency metadata, and
TypeScript resolution agree on the installed `@expo/ui` version.

### Phase 1: menu replacement

1. Add `NativeMenu.tsx` adapter.
2. Replace imports in `src/components/MessageBubble.tsx`.
3. Use `Icon.select` or a local icon resolver for menu actions:
   - iOS: SF Symbols `doc.on.doc`, `square.and.arrow.up`.
   - Android: material-symbol XML assets or supported `ImageSourcePropType`.
4. Preserve:
   - long-press trigger
   - copy action
   - share action
   - accessibility actions
   - no menu while assistant response is sending
5. Add or update focused tests for the action dispatcher so package event shape
   changes cannot break copy/share silently.
6. Remove `@react-native-menu/menu` only after native and web behavior are both
   covered.

Validation:

- `bunx tsc --noEmit`
- `bun run test -- --runTestsByPath __tests__/messageBubble*.spec.ts`
- AXe or manual runtime proof: long-press a message on iOS and Android, run
  copy and share, and verify no prompt text is logged.
- Web proof: copy/share fallback still works or is intentionally hidden.

Rollback: restore `MessageBubble.tsx` to `@react-native-menu/menu` and remove
the adapter; no data migration is involved.

### Phase 2: bottom sheet replacement

Status: rolled back. Do not execute in the current release lane.

1. Add `NativeBottomSheet.tsx` adapter behind the existing `GlassBottomSheet`
   public API.
2. Replace the internals of `src/components/glass/GlassBottomSheet.tsx` with
   the adapter while keeping exports stable:
   - `GlassBottomSheet`
   - `GlassActionSheet`
   - `useGlassBottomSheet`
   - related prop types
3. Remove direct `Modal`, `Animated`, `PanGestureHandler`, and manual backdrop
   code from the sheet implementation after parity is proven.
4. Verify all current sheet call sites:
   - DNS service selection in `GlassSettings.tsx`
   - About sheet in `GlassSettings.tsx`
   - Support sheet in `GlassSettings.tsx`
   - Chat list action sheet if still wired through `useGlassBottomSheet`
5. Preserve:
   - sheet open/close state
   - back-button dismiss behavior on Android
   - drag-to-dismiss where enabled
   - backdrop/scrim dismiss unless disabled
   - safe-area bottom spacing
   - test IDs and accessibility labels
   - bilingual title/subtitle copy

Validation required before this phase can be reopened:

- `bunx tsc --noEmit`
- `bun run test -- --runTestsByPath __tests__/settings*.spec.ts`
- `bun run e2e:axe:doctor`
- `bun run e2e:axe:release` when simulator automation is available
- Physical-device launch proof on iOS before TestFlight upload.
- Manual runtime proof on iOS and Android for each sheet listed above.
- Web preview proof with `bun run web` because the Expo UI bottom sheet uses a
  web drawer implementation.

Rollback already happened on 2026-05-27: `GlassBottomSheet` uses React Native
`Modal`, `Animated`, and local accessibility semantics again; the native adapter
file and tests were removed.

### Phase 3: dependency cleanup

After Phase 1 passes and Phase 2 remains rolled back:

1. Remove `@react-native-menu/menu`.
2. Check whether `react-native-gesture-handler` is still needed outside the
   root wrapper. If not needed by Expo Router or another package, remove app
   imports first, then consider dependency removal in a separate small diff.
3. Keep `react-native-reanimated`; it is still used by chat input, animations,
   and screen/list transitions.
4. Run:
   - `bun install`
   - `bun run verify:all`
   - `cd modules/dns-native && bun run test`
   - `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`
   - `git diff --check`

Stop condition: dependency cleanup is proven by lockfile diff, TypeScript,
lint, tests, and runtime smoke.

### Phase 4: optional form-control spike

Only start this after the menu and sheet migrations are stable.

1. Build a small internal prototype branch or feature flag for Expo UI `List`,
   `ListItem`, `Switch`, and `Button` on one low-risk screen, preferably About
   or NotFound.
2. Compare against current requirements:
   - section headers and footers
   - trailing values and icons
   - destructive states
   - navigation links
   - right-side controls
   - test IDs
   - bilingual screen-reader labels and hints
   - web behavior
3. Do not migrate Settings until the prototype proves the full `Form` API can
   be represented without losing semantics or visual clarity.
4. Do not migrate `ChatInput` until a separate `TextInput` spike proves:
   - controlled input behavior with `useNativeState`
   - multiline auto-grow against the 120-character DNS limit
   - `onContentSizeChange` geometry differences are handled
   - send-button focus behavior still works
   - copy/paste context menus remain available
   - AXe and physical keyboard behavior stay correct

Stop condition: a screenshot/runtime comparison proves the Expo UI form
surface is better than the current glass form surface. If not, close the spike
and keep the current implementation.

## Test and verification gate

For the complete migration:

1. `bunx tsc --noEmit`
2. `bun run lint`
3. `bun run test -- --bail --passWithNoTests`
4. `bun run verify:typed-routes`
5. `bun run verify:react-compiler`
6. `bun run verify:ios-pods`
7. `bun run verify:all`
8. `cd modules/dns-native && bun run test`
9. `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`
10. `bun run verify:public-redaction`
11. `bun run e2e:axe:release` for release-facing UI changes when simulator
    automation is available.
12. iOS Debug simulator build and Android runtime smoke for native UI changes.

Release-readiness UI work must not be called complete from unit tests alone.
The closeout needs native runtime proof that menus, bottom sheets, settings
controls, and web fallbacks still behave correctly.

## Acceptance criteria

- `@expo/ui` is used only through local adapters or clearly bounded native UI
  wrappers.
- Message copy/share still works on iOS, Android, and web.
- All current bottom sheets open, dismiss, and preserve their content.
- Settings changes still persist through `SettingsContext`.
- DNS prompt, logging, storage, and privacy behavior remain unchanged.
- No product copy implies DNS prompts are private.
- No local device/account identifiers enter public docs.
- The migration deletes at least one dependency or custom native-behavior
  implementation before it is considered a net improvement.
