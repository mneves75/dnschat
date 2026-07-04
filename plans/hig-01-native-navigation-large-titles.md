# Plan hig-01 — Navegação nativa: large titles, safe-area do topo, tint de aba e status bar

- **Findings cobertos**: HIG-01, HIG-02, HIG-03, HIG-20
- **Owner**: main session (frontend/visual, mexe em navegação expo-router)
- **Por que não codex**: puramente UI React Native + expo-router; nenhuma lógica de backend/DNS envolvida.
- **Effort**: L · **Risk**: MED (mexe na estrutura de navegação; pode afetar toolbar/back-swipe)

## Contexto

As 3 telas de aba (`GlassChatList`, `Logs`, `About`) e os estados "missing" renderizam o título via `Form.List navigationTitle` — um `<Text fontSize:34 bold>` dentro do `ScrollView` (`src/components/glass/GlassForm.tsx:174-182,401-405`). As rotas modal/detalhe já usam títulos **nativos** (`app/chat/[threadId].tsx:180` `Stack.Screen.Title`, `app/(modals)/settings.tsx:17`). O título falso não colapsa no scroll, não tem o scroll-edge blur da nav bar iOS 26 e não é cabeçalho para o VoiceOver. Além disso o `SafeAreaView` do `GlassForm` omite o edge `top`, o grupo `(tabs)` está com `headerShown:false` (`app/_layout.tsx:127`), e o `barStyle` da status bar é definido inline por tela (`src/navigation/screens/Chat.tsx:172`).

## Passos

1. **Dar header nativo por aba (HIG-01).** Em `app/(tabs)/_layout.tsx`, envolver cada `NativeTabs.Trigger` alvo num Stack por aba OU configurar cada rota de aba (`app/(tabs)/index.tsx`, `logs.tsx`, `about.tsx`) com `<Stack.Screen options={{ headerShown: true, headerLargeTitle: true, title }}>` e `Stack.Screen.Title`. Remover o `navigationTitle` das chamadas `Form.List` em `GlassChatList.tsx:373`, `Logs.tsx:136`, `About.tsx:76`, `GlassSettings.tsx:407` e o bloco de título custom em `GlassForm.tsx:174-182` (manter a prop como no-op de compat ou removê-la de todos os call sites).
2. **Safe-area do topo (HIG-02).** Se após o passo 1 alguma tela ainda não tiver header nativo, adicionar `top` ao `edges` do `SafeAreaView` em `GlassForm.tsx:164` (`edges={["top","left","right"]}`) ou aplicar `insets.top` ao container. Com header nativo em todas as abas, este passo vira verificação.
3. **Tint da aba selecionada (HIG-03).** Em `app/(tabs)/_layout.tsx:10-12`, remover o `color` fixo do `labelStyle` (ou usar o tint nativo do estado selecionado) para que o iOS tingir label+ícone da aba ativa com o accent. Verificar que a aba selecionada fica visualmente distinta.
4. **Status bar por rota (HIG-20).** Remover o `<StatusBar barStyle=...>` inline de `Chat.tsx:172` e centralizar o estilo no tema de navegação (`src/ui/theme/navigationTheme.ts`) / `screenOptions` do Stack, para não haver flicker ao navegar.

## Verificação

- `bun run verify:typed-routes` após qualquer mudança de rota.
- `bun run verify:all` (lint + tsc + testes + pods).
- **Argent runtime (obrigatório para UI de release)**: bootar simulador iOS, exercitar as 3 abas + navegação para detalhe/modal e voltar; capturar screenshots do large title colapsando no scroll, do scroll-edge blur, da aba selecionada tingida e do conteúdo respeitando a Dynamic Island. Testar back-swipe no detalhe de chat.
- VoiceOver: confirmar que os títulos de tela aparecem no rotor "Headings".

## Risco / rollback

Mudança de navegação pode quebrar a toolbar de "nova conversa" (`app/(tabs)/index.tsx:39`) e o `Link.AppleZoomTarget` do chat. Rollback: reverter para `navigationTitle` custom (git). Validar em iOS 26 real (NativeTabs + Stack por aba é o ponto mais frágil).

## Fora de escopo

Redesenho visual das seções (ver hig-04) e iconografia (ver hig-07).
