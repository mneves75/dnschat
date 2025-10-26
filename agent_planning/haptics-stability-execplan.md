# ExecPlan: Haptics Stability & Preferences

```
/src
 ├── components
 │    ├── NEW HapticsConfigurator.tsx
 │    └── UPDATE App.tsx
 ├── context
 │    ├── UPDATE settingsStorage.ts
 │    └── UPDATE SettingsContext.tsx
 ├── navigation
 │    └── screens
 │         ├── UPDATE Settings.tsx
 │         └── UPDATE GlassSettings.tsx
 ├── utils
 │    └── UPDATE haptics.ts
/__tests__
 ├── NEW haptics.spec.ts
 ├── UPDATE settings.migration.spec.ts
 ├── UPDATE setup.jest.js
 └── mocks
      └── NEW expo-haptics.js
/jest.config.js (UPDATE)
/DOCS/SETTINGS.md (UPDATE)
```

## Step Plan
1. **Persistence & Context plumbing** – extend `settingsStorage` + `SettingsContext` with `enableHaptics`, migrations, logging. Write unit test coverage (`settings.migration.spec.ts`).
2. **Utility hardening** – rebuild `src/utils/haptics.ts` with capability caching, preference hook-in, and exported `configureHaptics`. Targeted Jest coverage in `__tests__/haptics.spec.ts`.
3. **App integration & UI toggles** *(in progress → Step 3 deliverables implemented Oct 25, 2025)* – mount `HapticsConfigurator`, add Enable Haptics switches to Settings + Glass Settings, update docs, and extend tests to cover configurator + UI plumbing. Remaining work: regression pass + archive plan once steps verified.
- `npm test -- haptics.spec.ts`
- Manual sanity: confirm Settings toggles update AsyncStorage + avoid CoreHaptics crash on devices lacking pattern library.
- Archive this plan post-completion (move to `agent_planning/archive/`).
