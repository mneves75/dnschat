import { interpolate, useCurrentFrame } from "remotion";
import { HistoryMock } from "../../shared/AppMocks";
import { SceneShell } from "../../shared/SceneShell";
import { Kicker, SceneTitle } from "../../shared/Typography";
import { COLORS, FONT_MONO } from "../../shared/tokens";

const ProofPanel = ({
  title,
  label,
  index,
  children,
}: {
  title: string;
  label: string;
  index: number;
  children: React.ReactNode;
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        minWidth: 0,
        height: 560,
        borderRadius: 30,
        overflow: "hidden",
        border: "1px solid rgba(144,174,255,0.26)",
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
        boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
        opacity: interpolate(
          frame,
          [12 + index * 12, 32 + index * 12],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
        translate: interpolate(
          frame,
          [12 + index * 12, 34 + index * 12],
          ["0px 30px", "0px 0px"],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <div
        style={{
          height: 82,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(7,17,31,0.08)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 760 }}>{title}</div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 24,
            color: COLORS.cobalt,
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          {label}
        </div>
      </div>
      <div style={{ height: 478 }}>{children}</div>
    </div>
  );
};

export const LaunchProofScene = () => {
  return (
    <SceneShell step="04 / Produto">
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "end", gap: 30 }}>
          <Kicker>Controle local</Kicker>
          <SceneTitle>O que fica com você continua visível.</SceneTitle>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 24,
          }}
        >
          <ProofPanel title="Histórico" label="Criptografado" index={0}>
            <HistoryMock />
          </ProofPanel>
          <ProofPanel title="Ajustes" label="Neste aparelho" index={1}>
            <div
              style={{
                height: "100%",
                padding: 28,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 14,
              }}
            >
              {[
                ["Servidor DNS", "Automático"],
                ["Idioma", "Português"],
                ["Háptica", "Ativada"],
              ].map(([setting, value]) => (
                <div
                  key={setting}
                  style={{
                    minHeight: 70,
                    borderRadius: 18,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(7,17,31,0.09)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    fontSize: 24,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{setting}</span>
                  <span style={{ color: COLORS.mutedDark }}>{value}</span>
                </div>
              ))}
              <div
                style={{
                  fontSize: 24,
                  lineHeight: 1.4,
                  color: "#5B6D84",
                }}
              >
                Preferências locais, sem perfil e sem conta.
              </div>
            </div>
          </ProofPanel>
          <ProofPanel title="Logs DNS" label="Inspecionáveis" index={2}>
            <div
              style={{
                height: "100%",
                padding: 28,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 16,
              }}
            >
              {[
                ["Nativo", "Concluído"],
                ["UDP", "Não usado"],
                ["TCP", "Não usado"],
              ].map(([transport, state], rowIndex) => (
                <div
                  key={transport}
                  style={{
                    minHeight: 78,
                    borderRadius: 18,
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor:
                      rowIndex === 0 ? "rgba(47,107,255,0.11)" : "#FFFFFF",
                    border:
                      rowIndex === 0
                        ? "1px solid rgba(47,107,255,0.26)"
                        : "1px solid rgba(7,17,31,0.08)",
                    fontSize: 24,
                  }}
                >
                  <span style={{ fontFamily: FONT_MONO, fontWeight: 760 }}>
                    {transport}
                  </span>
                  <span style={{ color: COLORS.mutedDark }}>{state}</span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 4,
                  fontSize: 24,
                  lineHeight: 1.35,
                  color: COLORS.mutedDark,
                }}
              >
                Reservas só entram quando necessárias.
              </div>
            </div>
          </ProofPanel>
        </div>
      </div>
    </SceneShell>
  );
};
