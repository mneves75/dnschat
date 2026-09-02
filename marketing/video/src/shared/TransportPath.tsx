import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_MONO } from "./tokens";

type TransportPathProps = {
  compact?: boolean;
};

export const TransportPath = ({ compact = false }: TransportPathProps) => {
  const frame = useCurrentFrame();
  const nodes = [
    ["Nativo", "principal"],
    ["UDP", "reserva"],
    ["TCP", "reserva"],
  ] as const;

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 110px 1fr 110px 1fr",
        alignItems: "center",
        width: compact ? 950 : 1320,
      }}
    >
      {nodes.map(([name, label], index) => (
        <div
          key={name}
          style={{
            gridColumn: index * 2 + 1,
            minHeight: compact ? 150 : 196,
            borderRadius: 30,
            border: "1px solid rgba(144,174,255,0.3)",
            backgroundColor:
              index === 0 ? "rgba(47,107,255,0.19)" : "rgba(13,26,43,0.85)",
            boxShadow:
              index === 0
                ? "0 18px 60px rgba(47,107,255,0.2)"
                : "0 18px 60px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: interpolate(frame, [index * 12, index * 12 + 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [index * 12, index * 12 + 18],
              ["0px 20px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: compact ? 34 : 42,
              fontWeight: 800,
              color: index === 0 ? COLORS.white : COLORS.cobaltSoft,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: compact ? 22 : 26,
              color: COLORS.muted,
            }}
          >
            {label}
          </div>
        </div>
      ))}
      {[0, 1].map((index) => (
        <div
          key={index}
          style={{
            gridColumn: index * 2 + 2,
            height: 2,
            backgroundColor: COLORS.line,
            position: "relative",
            overflow: "visible",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: 7,
              top: -6,
              left: 0,
              backgroundColor: COLORS.cobalt,
              boxShadow: "0 0 22px rgba(47,107,255,0.8)",
              opacity: interpolate(
                frame,
                [
                  30 + index * 28,
                  32 + index * 28,
                  55 + index * 28,
                  57 + index * 28,
                ],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: `${interpolate(
                frame,
                [32 + index * 28, 55 + index * 28],
                [0, 96],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              )}px 0px`,
            }}
          />
        </div>
      ))}
    </div>
  );
};
