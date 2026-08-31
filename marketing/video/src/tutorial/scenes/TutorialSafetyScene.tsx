import {interpolate, useCurrentFrame} from 'remotion';
import {DEMO} from '../../data/demo';
import {SceneShell} from '../../shared/SceneShell';
import {Kicker, SceneTitle, SupportingText} from '../../shared/Typography';
import {COLORS} from '../../shared/tokens';

export const TutorialSafetyScene = () => {
  const frame = useCurrentFrame();
  const facts = [
    ['Sem conta', 'Nenhum perfil é necessário.'],
    ['Histórico local', 'As conversas ficam criptografadas neste aparelho.'],
    ['DNS sem autenticação', 'A rede pode observar ou alterar consultas e respostas.'],
  ] as const;

  return (
    <SceneShell
      step="Tutorial / 02"
      caption="Use apenas perguntas não sensíveis. Nunca envie segredos nem dados pessoais."
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          alignItems: 'center',
          gap: 86,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
          <Kicker>Antes de enviar</Kicker>
          <SceneTitle>Local não significa privado na rede.</SceneTitle>
          <SupportingText muted>{DEMO.privacyWarning}</SupportingText>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
          {facts.map(([title, detail], index) => (
            <div
              key={title}
              style={{
                minHeight: 126,
                borderRadius: 26,
                padding: '24px 28px',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: '14px 220px 1fr',
                alignItems: 'center',
                gap: 22,
                border:
                  index === 2
                    ? '1px solid rgba(255,142,142,0.42)'
                    : '1px solid rgba(144,174,255,0.25)',
                backgroundColor:
                  index === 2
                    ? 'rgba(255,142,142,0.1)'
                    : 'rgba(13,26,43,0.76)',
                opacity: interpolate(
                  frame,
                  [24 + index * 22, 44 + index * 22],
                  [0, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  },
                ),
                translate: interpolate(
                  frame,
                  [24 + index * 22, 48 + index * 22],
                  ['30px 0px', '0px 0px'],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  },
                ),
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 54,
                  borderRadius: 7,
                  backgroundColor: index === 2 ? COLORS.red : COLORS.cobalt,
                }}
              />
              <div style={{fontSize: 30, fontWeight: 760}}>{title}</div>
              <div style={{fontSize: 27, lineHeight: 1.35, color: COLORS.muted}}>
                {detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};
