import { interpolate, useCurrentFrame } from "remotion";
import { DEMO } from "../../data/demo";
import { ChatMock } from "../../shared/AppMocks";
import { Cursor } from "../../shared/Cursor";
import { PhoneFrame } from "../../shared/PhoneFrame";
import { SceneShell } from "../../shared/SceneShell";
import { ClickSfx, SuccessSfx } from "../../shared/Sfx";
import { Kicker, SceneTitle, SupportingText } from "../../shared/Typography";
import { COLORS, FONT_MONO } from "../../shared/tokens";

export const TutorialSendReceiveScene = () => {
  const frame = useCurrentFrame();
  const sendAt = 42;
  const responseStarts = 128;
  const responseCharacters = Math.min(
    DEMO.response.length,
    Math.max(0, Math.floor((frame - responseStarts) / 2)),
  );
  const response = DEMO.response.slice(0, responseCharacters);

  return (
    <SceneShell
      step="Tutorial / 04"
      caption="O prompt vira um nome DNS seguro; a resposta chega em registros TXT."
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "650px 1fr",
          alignItems: "center",
          gap: 88,
        }}
      >
        <div style={{ position: "relative" }}>
          <PhoneFrame width={600} height={810}>
            <ChatMock
              prompt={DEMO.tutorialPrompt}
              pending={frame >= sendAt && frame < responseStarts}
              {...(response ? { response } : {})}
            />
          </PhoneFrame>
          <Cursor left={515} top={714} tapAt={sendAt} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <Kicker>Enviar e receber</Kicker>
          <SceneTitle>O estado de cada etapa aparece na tela.</SceneTitle>
          <div
            style={{
              borderRadius: 22,
              padding: "22px 24px",
              border: "1px solid rgba(144,174,255,0.3)",
              backgroundColor: "rgba(13,26,43,0.82)",
              fontFamily: FONT_MONO,
              fontSize: 25,
              lineHeight: 1.4,
              color: COLORS.cobaltSoft,
              overflowWrap: "anywhere",
              opacity: interpolate(frame, [66, 88], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {DEMO.queryLabel}
          </div>
          <SupportingText muted>
            Este exemplo é fictício e não contém dados pessoais.
          </SupportingText>
        </div>
      </div>
      <ClickSfx from={sendAt} />
      <SuccessSfx from={258} />
    </SceneShell>
  );
};
