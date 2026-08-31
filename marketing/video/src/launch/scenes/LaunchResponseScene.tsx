import {interpolate, useCurrentFrame} from 'remotion';
import {DEMO} from '../../data/demo';
import {ChatMock} from '../../shared/AppMocks';
import {PhoneFrame} from '../../shared/PhoneFrame';
import {SceneShell} from '../../shared/SceneShell';
import {SuccessSfx} from '../../shared/Sfx';
import {Kicker, SceneTitle, SupportingText} from '../../shared/Typography';
import {COLORS, FONT_MONO} from '../../shared/tokens';

export const LaunchResponseScene = () => {
  const frame = useCurrentFrame();
  const responseCharacters = Math.min(
    DEMO.response.length,
    Math.max(0, Math.floor((frame - 32) / 1.1)),
  );
  const response = DEMO.response.slice(0, responseCharacters);
  const complete = responseCharacters === DEMO.response.length;

  return (
    <SceneShell step="03 / Resposta">
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '650px 1fr',
          alignItems: 'center',
          gap: 95,
        }}
      >
        <div style={{position: 'relative'}}>
          <PhoneFrame width={600} height={810}>
            <ChatMock
              prompt={DEMO.launchPrompt}
              pending={!response}
              response={response}
            />
          </PhoneFrame>
          <div
            style={{
              position: 'absolute',
              right: -28,
              top: 104,
              borderRadius: 18,
              padding: '13px 18px',
              backgroundColor: complete ? COLORS.mint : COLORS.amber,
              color: COLORS.ink,
              fontFamily: FONT_MONO,
              fontSize: 24,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1.3,
              opacity: interpolate(frame, [26, 42], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {complete ? 'TXT concluído' : 'Consultando TXT'}
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
          <Kicker>Resposta em registros TXT</Kicker>
          <SceneTitle>Receba, leia e confira o transporte.</SceneTitle>
          <SupportingText muted>
            O resultado chega com estado visível, sem esconder como foi obtido.
          </SupportingText>
        </div>
      </div>
      <SuccessSfx from={112} />
    </SceneShell>
  );
};
