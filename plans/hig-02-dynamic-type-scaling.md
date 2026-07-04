# Plan hig-02 — Dynamic Type: escala de lineHeight e caps de fonte em containers fixos

- **Findings cobertos**: HIG-04, HIG-19
- **Owner**: main session (frontend/visual)
- **Por que não codex**: tokens de tipografia RN + verificação visual runtime.
- **Effort**: M · **Risk**: MED (altera ritmo vertical de toda a tipografia)

## Contexto

Os tokens fixam `fontSize` **e** `lineHeight` (`src/ui/theme/liquidGlassTypography.ts:57-224`). `useTypography` só multiplica ambos pelo scale interno `useFontSize` (`src/ui/hooks/useTypography.ts:25-38`), não pelo scale do sistema. Como nenhum `Text` desabilita `allowFontScaling`, o iOS escala `fontSize` mas o `lineHeight` fixo permanece → sobreposição/corte de linhas em Dynamic Type grande/AX. Caps de fonte (`maxFontSizeMultiplier`) só existem em glifos fixos (`Toast.tsx:76,177`, `MessageContent.tsx:123`, `GlassBottomSheet.tsx:329`), não em rótulos dentro de containers de altura fixa.

## Passos

1. **lineHeight relativo (HIG-04).** Em `liquidGlassTypography.ts`, converter `lineHeight` para um fator do `fontSize` (ex.: `lineHeight ≈ 1.2–1.3 × fontSize`) calculado após o scale, OU aplicar `PixelRatio.getFontScale()` ao `lineHeight` em `applyDynamicType` (`liquidGlassTypography.ts:422-429`) de modo que o line height acompanhe o scale do sistema, não só o interno. Preservar a aparência atual em scale 1.0.
2. **Caps em containers fixos (HIG-19).** Aplicar `maxFontSizeMultiplier` sensato (~1.6–2.0) aos rótulos dentro de containers de tamanho fixo: botão send (`src/components/ChatInput.tsx:458`), badges de contagem/método (`GlassChatList.tsx:202`, `Logs.tsx:350,479`), botões de transporte (`GlassSettings.tsx:551-560`). Não capar texto de corpo de mensagens/leitura.
3. Auditar containers com altura fixa que contêm texto e decidir caso a caso: crescer o container ou capar a fonte (indicador de status 32×32 em `Logs.tsx:487-493` já é não-textual; o `statusText` "OK/X/?" dentro dele precisa de cap — cruza com hig-07).

## Verificação

- `bun run verify:all`.
- **Argent runtime**: nas Configurações do iOS, subir Dynamic Type para o maior tamanho AX; exercitar Chat, lista de chats, Settings, Logs; capturar screenshots confirmando ausência de sobreposição/corte e reflow correto. Repetir com `useFontSize` interno em `extra-large` combinado com AX do sistema.

## Risco / rollback

Mudar `lineHeight` afeta o espaçamento vertical de todo o app. Rollback: reverter os tokens. Validar telas densas (Logs expandido, Settings) primeiro.

## Fora de escopo

Contraste (hig-04) e substituição de glifos (hig-07).
