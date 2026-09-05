# Plan hig-08 — Onboarding: ≤3 telas, alvos de toque e Reduce Motion

- **Findings cobertos**: HIG-05, HIG-09, HIG-13
- **Owner**: main session (frontend/visual)
- **Por que não codex**: fluxo de UI RN + verificação visual; toca `applyRecommendedNetworkSettings` (config, não backend DNS).
- **Effort**: M · **Risk**: LOW–MED

## Contexto

O onboarding tem 5 telas (`src/context/OnboardingContext.tsx:39-75`). `NetworkSetupScreen.tsx:84-132` roda uma "otimização" temporizada (1000/800/600ms) com `ActivityIndicator size="large"` (~2.4s de espera), **não** gated por Reduce Motion, e auto-marca `recommendedSetting=true` sem escolha do usuário. Vários botões ficam abaixo de 44pt (`OnboardingNavigation.tsx:210-230`, `FeaturesScreen.tsx:324-330` ~34pt, `NetworkSetupScreen.tsx` apply, `FirstChatScreen.tsx:466-472`).

## Passos

1. **Reduzir para ≤3 telas (HIG-05).** Consolidar os 5 steps em `OnboardingContext.tsx:39-75` para ≤3 (ex.: boas-vindas, "como funciona" combinando dns-magic+network, primeiro chat), atualizando `OnboardingContainer.tsx` e a barra de progresso. Manter o skip (`OnboardingContext.tsx:208-210` já torna pulável).
2. **Remover espera artificial e respeitar Reduce Motion (HIG-13/HIG-05).** Em `NetworkSetupScreen.tsx:84-132`, sob `shouldReduceMotion` ir direto ao estado final; e remover/encurtar a progressão temporizada falsa mesmo sem reduce motion (não simular trabalho que não existe). Tornar a recomendação de rede um opt-in explícito em vez de auto-`true`.
3. **Alvos de toque ≥44pt (HIG-09).** Aplicar `minHeight: getMinimumTouchTarget()` (de `src/ui/theme/liquidGlassSpacing.ts`) aos `PressableRipple` de skip/back/next (`OnboardingNavigation.tsx:210-230`), ação GitHub (`FeaturesScreen.tsx:324-330`), apply (`NetworkSetupScreen.tsx`) e sugestões (`FirstChatScreen.tsx:466-472`).

## Verificação

- `bun run verify:all` e `__tests__` de onboarding se existirem.
- **Argent runtime**: percorrer o onboarding completo (novo usuário / `resetOnboarding` em Settings), confirmar ≤3 telas, skip funcional, ausência de espera bloqueante, opt-in explícito de rede, e todos os botões com toque confortável. Repetir com Reduce Motion ligado.

## Risco / rollback

Consolidar telas mexe no `OnboardingContext` (persistência/step keys) — garantir migração/compat do estado persistido. Rollback via git. Testar o gate de onboarding em `app/_layout.tsx:73-88`.

## Fora de escopo

Redesign visual profundo das telas de onboarding além do necessário para os findings.
