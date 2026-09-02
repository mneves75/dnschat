import { interpolate, useCurrentFrame } from "remotion";
import { TransportLogMock } from "../../shared/AppMocks";
import { PhoneFrame } from "../../shared/PhoneFrame";
import { SceneShell } from "../../shared/SceneShell";
import { TransportPath } from "../../shared/TransportPath";
import { Kicker, SceneTitle, SupportingText } from "../../shared/Typography";
import { COLORS } from "../../shared/tokens";

export const TutorialLogsScene = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      step="Tutorial / 05"
      caption="A ordem é Nativo, UDP e TCP. As reservas só aparecem quando a rede ou o runtime exigem."
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "620px 1fr",
          alignItems: "center",
          gap: 84,
        }}
      >
        <div
          style={{
            opacity: interpolate(frame, [12, 32], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <PhoneFrame width={580} height={810} title="Logs DNS">
            <TransportLogMock activeIndex={0} />
          </PhoneFrame>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
            minWidth: 0,
          }}
        >
          <Kicker>Inspecione o que aconteceu</Kicker>
          <SceneTitle>Log não é decoração. É evidência.</SceneTitle>
          <TransportPath compact />
          <SupportingText muted>
            Uma consulta bem-sucedida pode terminar na primeira rota.
          </SupportingText>
          <div
            style={{
              width: "fit-content",
              padding: "14px 20px",
              borderRadius: 16,
              backgroundColor: "rgba(105,217,176,0.14)",
              border: "1px solid rgba(105,217,176,0.3)",
              color: COLORS.mint,
              fontSize: 24,
              fontWeight: 720,
              opacity: interpolate(frame, [150, 172], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Exemplo: concluído na rota nativa
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
