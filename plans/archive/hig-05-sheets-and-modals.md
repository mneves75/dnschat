# Plan hig-05 — Sheets nativos com detents, evitar modais empilhados, alvo do botão fechar

- **Findings cobertos**: HIG-07, HIG-14, HIG-17
- **Owner**: main session (frontend/visual)
- **Por que não codex**: componentes de UI RN + risco de crash de startup nativo (precisa de julgamento visual/runtime).
- **Effort**: M–L · **Risk**: MED (o header de `GlassBottomSheet.tsx` documenta um crash de startup histórico ao migrar para sheet nativo — reintroduzir exige cautela)

## Contexto

`src/components/glass/GlassBottomSheet.tsx` é um `Modal` custom (`:237`) com altura fixa e uma "handle" de arraste puramente visual (`:275-279`) — não há gesture de drag-to-dismiss; dismiss só por backdrop (`:133-137`) ou botão X (`:310-334`). O botão fechar é 32×32 (`:518-524`). Settings é apresentado como `presentation:"modal"` (`app/(modals)/settings.tsx:13-15`) e abre esses sheets por dentro (`GlassSettings.tsx:746,796,852,894`) → modais empilhados.

## Passos

1. **Drag-to-dismiss / detents (HIG-07).** Duas opções — escolher conforme risco:
   - (a) Adicionar gesture de arraste real ao componente atual (react-native-gesture-handler + reanimated) ligando o `translateY` à `handle`, com snap/close por velocidade. Menor risco (mantém a arquitetura que evita o crash de build-47).
   - (b) Migrar para sheet nativo com detents. Maior risco de startup — só com verificação nativa cuidadosa e mantendo a mitigação "um sheet compartilhado por lista" (`GlassChatList.tsx:270-282`).
   Preferir (a) salvo decisão explícita de main.
2. **Evitar empilhamento (HIG-14).** Ou tornar Settings uma push screen em vez de `presentation:"modal"` (`app/(modals)/settings.tsx`), ou garantir que os pickers de DNS/tema/about/suporte usem um único container de sheet ancorado (não `Modal` aninhado sobre `Modal`). Validar dismiss/foco.
3. **Alvo do botão fechar (HIG-17).** Aumentar `closeButton` para 44×44 em `GlassBottomSheet.tsx:518-524` (ou substituir por grabber de arraste do passo 1). O `hitSlop:8` atual mitiga o toque mas não a percepção.

## Verificação

- `bun run verify:all`.
- **Argent runtime (crítico)**: bootar o app compilado (não Expo Go), abrir cada sheet (DNS, tema, about, suporte, action sheet de chat), testar arraste-para-fechar, backdrop e botão; confirmar ausência de crash de startup após a mudança. Testar Settings como modal + sheet interno para o anti-empilhamento.
- Teste de fumaça de startup repetido (o crash de build-47 era de inicialização).

## Risco / rollback

Alto potencial de regressão de startup na opção (b). Rollback: reverter para o `Modal` custom atual. Não fazer (b) sem verificação nativa e teste de startup repetido.

## Fora de escopo

Iconografia do botão fechar (hig-07 iconografia trata o glifo "X").
