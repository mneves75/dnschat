# Localization Strategy (en-US / pt-BR)

_Last updated: 16 Sep 2025_

## Overview
The app now ships with a light-weight localization stack targeting US English (`en`) and Brazilian Portuguese (`pt-BR`). We intentionally avoided heavy i18n dependencies to keep bundle size small and maintain Expo SDK 54 compatibility.

| Component | Responsibility |
|-----------|----------------|
| `src/i18n/translations.ts` | Source of truth for string dictionaries, supported locale metadata, and helper utilities (`translate`, `resolveLocale`). |
| `src/i18n/LocalizationProvider.tsx` | React context that exposes the active locale, system locale, string lookup helper `t`, and `setLocale` function. |
| `SettingsContext` | Persists the user’s locale choice (or `system` sentinel) to AsyncStorage and hydrates `LocalizationProvider` on boot. |
| `GlassSettings` | UI entry point for choosing the language; reflects allowed DNS servers and persists setting. |

## Adding New Strings
1. Add matching keys to both `en` and `pt-BR` dictionaries in `translations.ts`.
2. Export a strongly typed `TranslationKey` (already inferred) and use `t('namespace.key')` wherever the value is needed.
3. If the string requires interpolation, pass a replacements object: `t('chat.messageBadge.other', { count })`.
4. Add or update unit tests in `__tests__/i18n.spec.ts` for high-value keys.

## Locale Detection & Persistence
- On startup we capture the system locale using `Intl.DateTimeFormat().resolvedOptions().locale`. If `expo-localization` is available (device builds), it overrides the fallback.
- The user’s selection is stored in AsyncStorage (`@chat_dns_settings.locale`). `null` represents “follow system”.
- We memoize date-fns locale modules (`enUS`, `ptBR`) inside the list views to format relative timestamps correctly.

## QA Checklist
- [ ] Switch to Portuguese via Settings → verify tabs, buttons, alerts, and action sheets show translated labels.
- [ ] Confirm predictive back strings (e.g., logs Link.Menu) render correctly in pt-BR.
- [ ] Capture updated screenshots for App Store / README gallery in both locales.
- [ ] Ensure metrics dashboards (e.g., DNS logs) still align and no strings overflow on small devices.

## Future Work
- Add Spanish (es-ES) once translation capacity is available.
- Wire locale toggle telemetry to understand adoption rates.
- Expand Jest coverage for pluralization edge cases.
