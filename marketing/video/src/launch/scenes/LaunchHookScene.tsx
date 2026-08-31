import {interpolate, useCurrentFrame} from 'remotion';
import {ChatMock} from '../../shared/AppMocks';
import {PhoneFrame} from '../../shared/PhoneFrame';
import {SceneShell} from '../../shared/SceneShell';
import {HeroTitle, Kicker, SupportingText} from '../../shared/Typography';
import {COLORS} from '../../shared/tokens';

export const LaunchHookScene = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell step="Lançamento">
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
        <div style={{display: 'flex', flexDirection: 'column', gap: 30}}>
          <div
            style={{
              opacity: interpolate(frame, [3, 18], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              translate: interpolate(frame, [3, 20], ['0px 26px', '0px 0px'], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <Kicker>Prompt curto. Transporte visível.</Kicker>
          </div>
          <div
            style={{
              opacity: interpolate(frame, [8, 26], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              translate: interpolate(frame, [8, 28], ['0px 34px', '0px 0px'], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <HeroTitle>
              Chat com IA,
              <br />
              levado por <span style={{color: COLORS.cobaltSoft}}>DNS.</span>
            </HeroTitle>
          </div>
          <div
            style={{
              opacity: interpolate(frame, [18, 36], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <SupportingText muted>
              Sem conta. Sem chave de API. Sem rastreamento.
            </SupportingText>
          </div>
        </div>
        <div
          style={{
            justifySelf: 'end',
            opacity: interpolate(frame, [10, 34], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [10, 38], ['70px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            rotate: interpolate(frame, [10, 38], ['3deg', '0deg'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <PhoneFrame width={570} height={800}>
            <ChatMock prompt="" />
          </PhoneFrame>
        </div>
      </div>
    </SceneShell>
  );
};
