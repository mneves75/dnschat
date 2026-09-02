import { interpolate, useCurrentFrame } from "remotion";
import { DEMO } from "../../data/demo";
import { Cursor } from "../../shared/Cursor";
import { PhoneFrame } from "../../shared/PhoneFrame";
import { SceneShell } from "../../shared/SceneShell";
import { ClickSfx } from "../../shared/Sfx";
import { Kicker, SceneTitle, SupportingText } from "../../shared/Typography";
import { COLORS, FONT_MONO } from "../../shared/tokens";

export const TutorialSettingsScene = () => {
  const frame = useCurrentFrame();
  const menuVisible = frame >= 72;

  return (
    <SceneShell
      step="Tutorial / 06"
      caption="Escolha apenas um serviço DNS da lista permitida; não há entrada arbitrária."
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 660px",
          alignItems: "center",
          gap: 84,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <Kicker>Preferências controladas</Kicker>
          <SceneTitle>Serviço, tema e idioma.</SceneTitle>
          <SupportingText muted>
            O app limita a escolha de servidores a uma lista aprovada.
          </SupportingText>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              opacity: interpolate(frame, [100, 124], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {DEMO.services.map((service, index) => (
              <div
                key={service}
                style={{
                  borderRadius: 16,
                  padding: "13px 18px",
                  fontFamily: FONT_MONO,
                  fontSize: 24,
                  color: index === 0 ? COLORS.white : COLORS.cobaltSoft,
                  backgroundColor:
                    index === 0 ? COLORS.cobalt : "rgba(13,26,43,0.8)",
                  border: "1px solid rgba(144,174,255,0.25)",
                }}
              >
                {service}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", justifySelf: "end" }}>
          <PhoneFrame width={600} height={810} title="Preferências">
            <div
              style={{
                height: "100%",
                padding: 28,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 760 }}>Serviço DNS</div>
              <div
                style={{
                  minHeight: 80,
                  borderRadius: 18,
                  padding: "0 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "2px solid rgba(47,107,255,0.42)",
                  backgroundColor: "#FFFFFF",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {DEMO.selectedService}
                <span style={{ color: COLORS.cobalt }}>Selecionado</span>
              </div>
              {menuVisible ? (
                <div
                  style={{
                    borderRadius: 20,
                    padding: 10,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(7,17,31,0.1)",
                    boxShadow: "0 20px 50px rgba(7,17,31,0.12)",
                    opacity: interpolate(frame, [72, 88], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    translate: interpolate(
                      frame,
                      [72, 90],
                      ["0px -12px", "0px 0px"],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      },
                    ),
                  }}
                >
                  {DEMO.services.map((service, index) => (
                    <div
                      key={service}
                      style={{
                        minHeight: 64,
                        borderRadius: 14,
                        padding: "0 14px",
                        display: "flex",
                        alignItems: "center",
                        fontFamily: FONT_MONO,
                        fontSize: 24,
                        color: index === 0 ? COLORS.cobalt : COLORS.ink,
                        backgroundColor:
                          index === 0 ? "rgba(47,107,255,0.1)" : "transparent",
                      }}
                    >
                      {service}
                    </div>
                  ))}
                </div>
              ) : null}
              <div
                style={{
                  marginTop: "auto",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                {[
                  ["Tema", "Sistema"],
                  ["Idioma", "pt-BR"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      minHeight: 96,
                      borderRadius: 18,
                      padding: 16,
                      backgroundColor: "#E8EDF5",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 24, color: COLORS.mutedDark }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </PhoneFrame>
          <Cursor left={510} top={108} tapAt={62} />
        </div>
      </div>
      <ClickSfx from={62} />
    </SceneShell>
  );
};
