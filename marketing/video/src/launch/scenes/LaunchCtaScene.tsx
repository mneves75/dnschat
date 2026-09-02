import { interpolate, useCurrentFrame } from "remotion";
import { DEMO } from "../../data/demo";
import { SceneShell } from "../../shared/SceneShell";
import { SuccessSfx } from "../../shared/Sfx";
import { HeroTitle, Kicker, SupportingText } from "../../shared/Typography";
import { COLORS, FONT_MONO } from "../../shared/tokens";

export const LaunchCtaScene = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell step="DNSChat">
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 30,
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Kicker>Código aberto</Kicker>
        <HeroTitle>
          DNS<span style={{ color: COLORS.cobaltSoft }}>Chat</span>
        </HeroTitle>
        <SupportingText>Chat por DNS, com o transporte à vista.</SupportingText>
        <div
          style={{
            marginTop: 12,
            borderRadius: 22,
            border: "1px solid rgba(144,174,255,0.36)",
            backgroundColor: "rgba(13,26,43,0.86)",
            padding: "20px 30px",
            fontFamily: FONT_MONO,
            fontSize: 30,
            color: COLORS.cobaltSoft,
            boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
          }}
        >
          {DEMO.repoUrl}
        </div>
      </div>
      <SuccessSfx from={8} />
    </SceneShell>
  );
};
