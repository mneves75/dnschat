import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../shared/SceneShell";
import { TransportPath } from "../../shared/TransportPath";
import { Kicker, SceneTitle, SupportingText } from "../../shared/Typography";
import { COLORS, FONT_MONO } from "../../shared/tokens";

export const LaunchTransportScene = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      step="02 / Transporte"
      caption="Nativo é a rota principal. UDP e TCP entram apenas se necessário."
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 48,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Kicker>Ordem de reserva</Kicker>
            <SceneTitle>O caminho não é uma caixa-preta.</SceneTitle>
          </div>
          <SupportingText muted>
            Cada tentativa pode ser inspecionada.
          </SupportingText>
        </div>
        <TransportPath />
        <div
          style={{
            alignSelf: "center",
            fontFamily: FONT_MONO,
            fontSize: 24,
            color: COLORS.cobaltSoft,
            opacity: interpolate(frame, [84, 105], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          selecionado: llm.pieter.com
        </div>
      </div>
    </SceneShell>
  );
};
