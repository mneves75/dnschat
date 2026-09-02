import { interpolate, useCurrentFrame } from "remotion";
import { DEMO } from "../../data/demo";
import { Cursor } from "../../shared/Cursor";
import { PhoneFrame } from "../../shared/PhoneFrame";
import { SceneShell } from "../../shared/SceneShell";
import { ClickSfx, TypingSfx } from "../../shared/Sfx";
import { Kicker, SceneTitle, SupportingText } from "../../shared/Typography";
import { COLORS } from "../../shared/tokens";

export const TutorialNewChatScene = () => {
  const frame = useCurrentFrame();
  const typingStart = 74;
  const typedCharacters = Math.min(
    DEMO.tutorialPrompt.length,
    Math.max(0, Math.floor((frame - typingStart) / 3)),
  );
  const typedPrompt = DEMO.tutorialPrompt.slice(0, typedCharacters);

  return (
    <SceneShell
      step="Tutorial / 03"
      caption="Abra uma conversa e escreva uma pergunta curta e não sensível."
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 650px",
          alignItems: "center",
          gap: 84,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <Kicker>Nova conversa</Kicker>
          <SceneTitle>Comece com uma pergunta pequena.</SceneTitle>
          <SupportingText muted>
            Exemplo: "{DEMO.tutorialPrompt}".
          </SupportingText>
        </div>
        <div style={{ position: "relative", justifySelf: "end" }}>
          <PhoneFrame width={600} height={810} title="Nova conversa">
            <div
              style={{
                height: "100%",
                padding: 28,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  fontSize: 25,
                  lineHeight: 1.4,
                  color: COLORS.mutedDark,
                }}
              >
                Nenhuma mensagem ainda.
              </div>
              <div
                style={{
                  minHeight: 86,
                  borderRadius: 22,
                  border: "2px solid rgba(47,107,255,0.45)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 13px 0 22px",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ flex: 1, fontSize: 24, color: COLORS.ink }}>
                  {typedPrompt}
                  {typedPrompt ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 26,
                        marginLeft: 3,
                        verticalAlign: -5,
                        backgroundColor: COLORS.cobalt,
                        opacity: frame % 18 < 10 ? 1 : 0,
                      }}
                    />
                  ) : (
                    <span style={{ color: COLORS.mutedDark }}>
                      Pergunta curta
                    </span>
                  )}
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    backgroundColor: COLORS.cobalt,
                    color: COLORS.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 24,
                  }}
                >
                  OK
                </div>
              </div>
            </div>
          </PhoneFrame>
          <Cursor left={250} top={720} tapAt={48} />
          <div
            style={{
              position: "absolute",
              left: -210,
              top: 615,
              padding: "14px 18px",
              borderRadius: 16,
              backgroundColor: "rgba(47,107,255,0.18)",
              border: "1px solid rgba(144,174,255,0.34)",
              fontSize: 24,
              opacity: interpolate(frame, [46, 65, 200, 230], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Toque no campo
          </div>
        </div>
      </div>
      <ClickSfx from={48} />
      <TypingSfx
        characterCount={DEMO.tutorialPrompt.length}
        startFrame={typingStart}
        framesPerCharacter={3}
      />
    </SceneShell>
  );
};
