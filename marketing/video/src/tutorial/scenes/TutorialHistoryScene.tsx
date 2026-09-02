import { interpolate, useCurrentFrame } from "remotion";
import { HistoryMock } from "../../shared/AppMocks";
import { PhoneFrame } from "../../shared/PhoneFrame";
import { SceneShell } from "../../shared/SceneShell";
import { Kicker, SceneTitle, SupportingText } from "../../shared/Typography";
import { COLORS } from "../../shared/tokens";

export const TutorialHistoryScene = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      step="Tutorial / 07"
      caption="O histórico fica criptografado localmente neste dispositivo."
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "650px 1fr",
          alignItems: "center",
          gap: 92,
        }}
      >
        <div
          style={{
            opacity: interpolate(frame, [10, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [10, 34], ["-50px 0px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <PhoneFrame width={600} height={810} title="Conversas">
            <HistoryMock />
          </PhoneFrame>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <Kicker>De volta ao histórico</Kicker>
          <SceneTitle>Retome uma conversa sem criar um perfil.</SceneTitle>
          <SupportingText muted>
            A lista e o armazenamento continuam no aparelho.
          </SupportingText>
          <div
            style={{
              width: "fit-content",
              minHeight: 66,
              borderRadius: 18,
              padding: "0 22px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              backgroundColor: "rgba(105,217,176,0.13)",
              border: "1px solid rgba(105,217,176,0.32)",
              color: COLORS.mint,
              fontSize: 26,
              fontWeight: 730,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: COLORS.mint,
              }}
            />
            Criptografia local
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
