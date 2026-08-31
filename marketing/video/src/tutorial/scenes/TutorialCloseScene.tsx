import {interpolate, useCurrentFrame} from 'remotion';
import {DEMO} from '../../data/demo';
import {SceneShell} from '../../shared/SceneShell';
import {SuccessSfx} from '../../shared/Sfx';
import {HeroTitle, Kicker, SupportingText} from '../../shared/Typography';
import {COLORS, FONT_MONO} from '../../shared/tokens';

export const TutorialCloseScene = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      step="Tutorial / Fim"
      caption="DNS é observável e as respostas não são autenticadas. Não envie dados sensíveis."
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 26,
          opacity: interpolate(frame, [4, 24], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <Kicker>Pronto para testar</Kicker>
        <HeroTitle>
          Curto. Visível. <span style={{color: COLORS.cobaltSoft}}>Local.</span>
        </HeroTitle>
        <SupportingText>
          Perguntas curtas. Transporte visível. Histórico local.
        </SupportingText>
        <div
          style={{
            marginTop: 8,
            borderRadius: 20,
            border: '1px solid rgba(144,174,255,0.34)',
            backgroundColor: 'rgba(13,26,43,0.86)',
            padding: '18px 28px',
            fontFamily: FONT_MONO,
            fontSize: 28,
            color: COLORS.cobaltSoft,
          }}
        >
          {DEMO.repoUrl}
        </div>
      </div>
      <SuccessSfx from={8} />
    </SceneShell>
  );
};
