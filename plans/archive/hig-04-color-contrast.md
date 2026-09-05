# Plan hig-04 — Contraste de cor: textTertiary, badges tonais e código inline

- **Findings cobertos**: HIG-08, HIG-15, HIG-16
- **Owner**: main session (frontend/visual)
- **Por que não codex**: palette RN + verificação de contraste visual.
- **Effort**: S–M · **Risk**: LOW

## Contexto

`textTertiary` (`#8E8E93`, `src/ui/theme/imessagePalette.ts:49`) é usado em texto de tamanho normal no modo claro com contraste ~3.2:1 em `#FFFFFF` e ~2.9:1 em `#F2F2F7` (abaixo de 4.5:1). Badges tonais e código inline também caem abaixo do mínimo.

## Passos

1. **textTertiary em texto normal (HIG-08).** Trocar por `textSecondary` (`#6D6D70`, ~4.9:1) nos usos de texto informativo pequeno: valor do servidor DNS (`src/navigation/screens/GlassSettings.tsx:420,525`), footers/chevron de form (`src/components/glass/GlassForm.tsx:233,305`), chevron de chat (`GlassChatList.tsx:214`), timestamp/duração de log (`src/navigation/screens/Logs.tsx:338,356`). Reservar `textTertiary` a glifos grandes/decorativos. Alternativa: escurecer o token `textTertiary` do modo claro em `imessagePalette.ts:49` para atingir ≥4.5:1 (medir antes).
2. **Badges tonais (HIG-15).** Aumentar a opacidade do fundo do chip ou usar cor de texto de maior contraste: badge "LATEST" laranja sobre azul translúcido (`GlassSettings.tsx:642-658`), badge de contagem azul sobre `${userBubble}26` (`GlassChatList.tsx:199-203`), badge de método (`Logs.tsx:346-352`). Medir cada combinação exata com um verificador WCAG.
3. **Código inline (HIG-16).** Em `src/components/MessageBubble.tsx:121-129`, trocar `code_inline.color` de `palette.warning` para `textPrimary` (ou cor de sintaxe de alto contraste); manter cor apenas no fundo do chip.

## Verificação

- `bun run verify:all`.
- Medir contraste de cada combinação corrigida (modo claro e escuro) com ferramenta WCAG; alvo ≥4.5:1 para texto <18pt.
- **Argent runtime**: screenshots de Settings/Logs/lista de chats em claro e escuro confirmando legibilidade; testar também com high-contrast ligado (`useHighContrast`).

## Risco / rollback

Baixo. Rollback via git. Cuidado para não quebrar a hierarquia visual (secundário vs terciário) ao unificar cores.

## Fora de escopo

Dynamic Type (hig-02) e iconografia (hig-07).
