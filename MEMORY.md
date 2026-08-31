# DNSChat Project Memory

## Project Environment

- Expo SDK 57 / React Native 0.86 with Expo Router, Hermes, New Architecture, and compiled iOS/Android projects.
- Use pnpm 11 and the repository scripts. Expo Go and Expo dev-client are not valid runtime proof because DNSChat depends on the native DNS module.
- Metro defaults to port 8081. Argent is the default compiled-app UI verification surface; discover elements before each tap and stop only the simulator services used by this project.
- The app also supports Metro-powered web, but there is no separate production web build script.

## Active Work

- The pre-production audit is complete and the authorized TestFlight candidate is `4.3.6` build `84`, tagged as `v4.3.6-beta1` only after the final commit is pushed.
- Release acceptance requires the same final build to pass the repository gates, signed archive/export, installation on the physical `iMarcus` device, TestFlight processing, and strict ASC validation.
- `iMarcus` is paired with Developer Mode enabled but was unavailable during initial discovery; reconnect and unlock it before physical-device installation.

## Decisions and Blockers

- DNS prompts go to a selected third-party DNS service and are observable; the provider may retain them. The UI and public material must never claim DNS prompts are private.
- Production store submission remains blocked because no verifiable public provider policy covering retention, use, deletion, or service-provider status was located; the publisher must obtain operator evidence or explicitly approve conservative Apple/Google privacy declarations.
- DNS packet validation does not authenticate the provider or protect an unsigned TXT response from an on-path replacement. Shipping requires an explicit risk decision or a provider-compatible authenticated response design; UI and docs disclose the limitation meanwhile.
- Signing identities, Apple team identifiers, device identifiers, and App Store Connect internal IDs remain local and out of tracked files.
