# Plan hig-03 — Semântica de acessibilidade: headers, roles e imagens decorativas

- **Findings cobertos**: HIG-11, HIG-18, HIG-21
- **Owner**: main session (frontend/visual)
- **Por que não codex**: props de acessibilidade RN + verificação com VoiceOver.
- **Effort**: S · **Risk**: LOW

## Contexto

Faltam papéis de cabeçalho para navegação por rotor; uma linha de lista usa `role="link"` para navegação interna; e o logo do About não é marcado como decorativo.

## Passos

1. **`accessibilityRole="header"` (HIG-11).** Adicionar aos títulos de seção (`src/components/glass/GlassForm.tsx:203-207`), ao título custom enquanto existir (`GlassForm.tsx:176-181`) e ao título do sheet (`src/components/glass/GlassBottomSheet.tsx:292-297`). Se hig-01 migrar títulos de tela para nativos, estes já viram cabeçalhos — cobrir apenas os títulos de seção e de sheet.
2. **Role de botão em linha de lista (HIG-18).** Em `src/navigation/screens/GlassChatList.tsx:233`, trocar `accessibilityRole="link"` por `"button"`, mantendo `accessibilityActions` (open/share/delete) e `onAccessibilityAction` (`GlassChatList.tsx:236-237`).
3. **Logo decorativo (HIG-21).** Em `src/navigation/screens/About.tsx:83-95`, marcar o `<Image source={AppIcon}>` como decorativo (`accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`), já que o nome do app aparece em texto logo abaixo (`About.tsx:107-115`).

## Verificação

- `bun run verify:all`.
- **Argent runtime + VoiceOver**: ligar VoiceOver, usar o rotor "Headings" em Settings/About/Logs e confirmar navegação por seção; confirmar que o item de chat é anunciado como "botão" com as ações de share/delete; confirmar que o logo do About não recebe foco.

## Risco / rollback

Baixo. Rollback trivial via git.

## Fora de escopo

Contraste de texto (hig-04) e reflow de Dynamic Type (hig-02).
