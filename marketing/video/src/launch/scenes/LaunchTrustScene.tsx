import { interpolate, useCurrentFrame } from "remotion";
import { DEMO } from "../../data/demo";
import { SceneShell } from "../../shared/SceneShell";
import { Kicker, SceneTitle } from "../../shared/Typography";
import { COLORS } from "../../shared/tokens";

export const LaunchTrustScene = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell step="05 / Limite de confiança">
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 38,
        }}
      >
        <Kicker>Sem promessas falsas de privacidade</Kicker>
        <SceneTitle>Sem conta. Sem chave de API. Sem rastreamento.</SceneTitle>
        <div
          style={{
            maxWidth: 1480,
            borderRadius: 28,
            border: "1px solid rgba(255,142,142,0.44)",
            backgroundColor: "rgba(255,142,142,0.1)",
            padding: "30px 36px",
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: "12px 1fr",
            gap: 24,
            opacity: interpolate(frame, [34, 52], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [34, 54], ["0px 22px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              width: 12,
              height: "100%",
              minHeight: 118,
              borderRadius: 6,
              backgroundColor: COLORS.red,
            }}
          />
          <div
            style={{
              fontSize: 39,
              lineHeight: 1.28,
              fontWeight: 690,
              letterSpacing: -1,
            }}
          >
            {DEMO.privacyWarning}
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
