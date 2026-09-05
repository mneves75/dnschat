# Plan hig-06 — Padrões de feedback: Alert de sucesso → Toast e pull-to-refresh real

- **Findings cobertos**: HIG-06, HIG-12
- **Owner**: main session (frontend/visual)
- **Por que não codex**: UI RN + i18n; `Toast` já existe.
- **Effort**: S · **Risk**: LOW

## Contexto

Confirmações de sucesso usam `Alert.alert` (anti-padrão HIG): reset de settings (`src/navigation/screens/GlassSettings.tsx:240-243` — que ainda reusa `resetTitle/resetMessage`, mostrando a mensagem de confirmação como "sucesso"), clear cache (`GlassSettings.tsx:385-388`) e reset de onboarding (`GlassSettings.tsx:261-264`); `NetworkSetupScreen.tsx` também. Além disso, `GlassChatList` e `Logs` definem estado/handler de refresh mas nunca ligam um `RefreshControl` ao `Form.List`.

## Passos

1. **Alert de sucesso → Toast (HIG-06).** Trocar os `Alert.alert` de sucesso por `Toast variant="success"` (componente em `src/components/ui/Toast.tsx`, já usado em `GlassChatList`/`Chat`). Adicionar estado de toast em `GlassSettings`. Corrigir o bug de i18n do reset: criar chaves distintas de sucesso em `src/i18n/messages/en-US.ts` e `pt-BR.ts` em vez de reusar `resetTitle/resetMessage`. Manter os `Alert.alert` de **confirmação destrutiva** (delete/clear/reset prompts) — esses são corretos.
2. **Pull-to-refresh real (HIG-12).** Expor uma prop `refreshControl` (ou `refreshing`/`onRefresh`) no `GlassForm` (`src/components/glass/GlassForm.tsx:167-173`) e repassá-la ao `ScrollView`. Ligar em `GlassChatList.tsx:309,353-356` e `Logs.tsx:47,89-93` (que já têm o estado/handler). Usar `RefreshControl` com `tintColor` da palette (ver `MessageList.tsx:226-232` como referência).

## Verificação

- `bun run verify:all`.
- **Argent runtime**: disparar reset/clear/reset-onboarding e confirmar toast de sucesso (não Alert); confirmar que a confirmação destrutiva ainda usa Alert. Puxar-para-atualizar na lista de chats e em Logs e ver o spinner nativo + reload.
- Verificar i18n em pt-BR e en-US (sem chave reusada errada).

## Risco / rollback

Baixo. Rollback via git. Garantir que o toast de sucesso não colida com o toast de erro já existente na mesma tela.

## Fora de escopo

Onboarding NetworkSetup (hig-08 trata seus alerts/spinner).
