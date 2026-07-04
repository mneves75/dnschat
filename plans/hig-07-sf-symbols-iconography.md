# Plan hig-07 — Iconografia: substituir glifos de texto por SF Symbols

- **Findings cobertos**: HIG-10
- **Owner**: main session (frontend/visual)
- **Por que não codex**: iconografia RN/iOS + fallback Android.
- **Effort**: M · **Risk**: LOW

## Contexto

Vários indicadores usam glifos de texto em vez de ícones nativos, sem alinhamento óptico nem semântica de ícone iOS, e escalando de forma inconsistente com Dynamic Type: chevrons `"›"` (`src/components/glass/GlassForm.tsx:306`, `GlassChatList.tsx:216`), indicador de seleção `"•"` (`GlassSettings.tsx:506,787,842`), status `"OK"/"X"/"?"` (`Logs.tsx:378-381`), fechar `"X"` (`GlassBottomSheet.tsx:331`), loading `"…"` (`ChatInput.tsx:458`) e ícones de toast `"OK"/"!"/"X"/"i"` (`Toast.tsx:266-290`).

## Passos

1. Introduzir (ou reutilizar) um wrapper de ícone: SF Symbols no iOS via `expo-symbols` (`SymbolView`) com fallback Material/SVG no Android (o app já usa `expo-symbols` em toolbars nativas e SVGs em `src/components/icons/*`).
2. Substituir, mapeando por semântica:
   - chevron de navegação → `chevron.right`
   - indicador de seleção → `checkmark` / `checkmark.circle.fill`
   - status de log success/failure/pending → `checkmark.circle.fill` / `xmark.circle.fill` / `clock` (ver `Logs.tsx:276-287,368-383`)
   - fechar sheet → `xmark` (cruza com hig-05: preferir grabber de arraste)
   - loading do send → spinner/`ActivityIndicator` em vez de `"…"` (`ChatInput.tsx:457-458`)
   - ícones de toast → `checkmark.circle.fill` / `exclamationmark.triangle.fill` / `xmark.octagon.fill` / `info.circle.fill` (`Toast.tsx:264-292`)
3. Manter `maxFontSizeMultiplier`/tamanho fixo onde o ícone vive em container fixo (cruza com hig-02) e garantir `accessibilityElementsHidden` nos ícones decorativos que já têm rótulo textual próximo.

## Verificação

- `bun run verify:all`.
- **Argent runtime**: screenshots iOS confirmando SF Symbols alinhados em Settings (seleção/chevron), Logs (status), sheets (fechar/grabber), Chat (loading do send) e toasts. Rodar no Android (emulador) confirmando o fallback.
- Testar em Dynamic Type grande (ícones não distorcem).

## Risco / rollback

Baixo. Rollback via git. Cuidar do fallback Android para não regредir a aparência atual.

## Fora de escopo

Comportamento de drag do sheet (hig-05); caps de fonte (hig-02).
