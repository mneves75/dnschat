import {interpolate, useCurrentFrame} from 'remotion';
import {ChatMock} from '../../shared/AppMocks';
import {PhoneFrame} from '../../shared/PhoneFrame';
import {SceneShell} from '../../shared/SceneShell';
import {HeroTitle, Kicker, SupportingText} from '../../shared/Typography';
import {COLORS} from '../../shared/tokens';

export const TutorialIntroScene = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      step="Tutorial / 01"
      caption="Envie uma pergunta curta por DNS e confira o caminho usado."
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 620px',
          alignItems: 'center',
          gap: 90,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            opacity: interpolate(frame, [5, 25], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [5, 28], ['0px 30px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <Kicker>Em 75 segundos</Kicker>
          <HeroTitle>
            Uma pergunta.
            <br />
            Um caminho <span style={{color: COLORS.cobaltSoft}}>visível.</span>
          </HeroTitle>
          <SupportingText muted>
            Aprenda a iniciar, enviar, ler e inspecionar.
          </SupportingText>
        </div>
        <div
          style={{
            justifySelf: 'end',
            opacity: interpolate(frame, [18, 42], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [18, 45], ['60px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <PhoneFrame width={580} height={800}>
            <ChatMock prompt="" />
          </PhoneFrame>
        </div>
      </div>
    </SceneShell>
  );
};
