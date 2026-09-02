import { interpolate, useCurrentFrame } from "remotion";
import { DEMO } from "../../data/demo";
import { Cursor } from "../../shared/Cursor";
import { PhoneFrame } from "../../shared/PhoneFrame";
import { SceneShell } from "../../shared/SceneShell";
import { ClickSfx, TypingSfx } from "../../shared/Sfx";
import { Kicker, SceneTitle, SupportingText } from "../../shared/Typography";
import { COLORS } from "../../shared/tokens";

export const LaunchSendScene = () => {
  const frame = useCurrentFrame();
  const typedCharacters = Math.min(
    DEMO.launchPrompt.length,
    Math.max(0, Math.floor((frame - 24) / 2)),
  );
  const typedPrompt = DEMO.launchPrompt.slice(0, typedCharacters);
  const sent = frame >= 102;

  return (
    <SceneShell step="01 / Pergunta">
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 650px",
          alignItems: "center",
          gap: 80,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <Kicker>Entrada pequena, intenção clara</Kicker>
          <SceneTitle>Escreva uma pergunta curta.</SceneTitle>
          <SupportingText muted>
            A demonstração usa conteúdo neutro e não sensível.
          </SupportingText>
        </div>
        <div style={{ position: "relative", justifySelf: "end" }}>
          <PhoneFrame width={600} height={810}>
            <div
              style={{
                height: "100%",
                padding: 28,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ flex: 1 }}>
                {sent ? (
                  <div
                    style={{
                      marginLeft: "auto",
                      maxWidth: "86%",
                      padding: "19px 21px",
                      borderRadius: "24px 24px 7px 24px",
                      backgroundColor: COLORS.cobalt,
                      color: COLORS.white,
                      fontSize: 24,
                      lineHeight: 1.28,
                      opacity: interpolate(frame, [102, 114], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                      scale: interpolate(frame, [102, 114], [0.95, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    {DEMO.launchPrompt}
                  </div>
                ) : null}
              </div>
              <div
                style={{
                  minHeight: 82,
                  borderRadius: 22,
                  border: "1px solid rgba(7,17,31,0.15)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 13px 0 22px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    fontSize: 24,
                    color: typedPrompt ? COLORS.ink : COLORS.mutedDark,
                  }}
                >
                  {sent ? "Escreva uma pergunta curta" : typedPrompt}
                  {!sent && typedPrompt ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 24,
                        marginLeft: 3,
                        verticalAlign: -4,
                        backgroundColor: COLORS.cobalt,
                        opacity: frame % 16 < 9 ? 1 : 0,
                      }}
                    />
                  ) : null}
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
          <Cursor left={515} top={715} tapAt={98} />
        </div>
      </div>
      <TypingSfx
        characterCount={DEMO.launchPrompt.length}
        startFrame={24}
        framesPerCharacter={2}
      />
      <ClickSfx from={98} />
    </SceneShell>
  );
};
