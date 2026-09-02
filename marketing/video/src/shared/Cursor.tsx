import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "./tokens";

type CursorProps = {
  left: number;
  top: number;
  tapAt?: number;
};

export const Cursor = ({ left, top, tapAt = 20 }: CursorProps) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        border: `4px solid ${COLORS.cobalt}`,
        boxShadow: "0 8px 28px rgba(7,17,31,0.35)",
        scale: interpolate(
          frame,
          [tapAt - 2, tapAt + 3, tapAt + 10],
          [1, 0.74, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: 32,
          border: "2px solid rgba(47,107,255,0.45)",
          opacity: interpolate(
            frame,
            [tapAt, tapAt + 2, tapAt + 12],
            [0, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          scale: interpolate(frame, [tapAt, tapAt + 12], [0.5, 1.25], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </div>
  );
};
