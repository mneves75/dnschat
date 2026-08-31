import type {ReactNode} from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {COLORS, FONT_MONO, FONT_SANS} from './tokens';

type SceneShellProps = {
  children: ReactNode;
  caption?: string;
  step?: string;
  light?: boolean;
};

export const SceneShell = ({
  children,
  caption,
  step,
  light = false,
}: SceneShellProps) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: light ? COLORS.paper : COLORS.ink,
        color: light ? COLORS.ink : COLORS.white,
        fontFamily: FONT_SANS,
        overflow: 'hidden',
      }}
    >
      <Img
        src={staticFile('assets/signal-path-hero.png')}
        style={{
          position: 'absolute',
          width: 1600,
          height: 900,
          right: -300,
          top: 70,
          objectFit: 'cover',
          opacity: light ? 0.055 : 0.11,
          mixBlendMode: light ? 'multiply' : 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: light
            ? 'linear-gradient(rgba(7,17,31,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(7,17,31,0.035) 1px, transparent 1px)'
            : 'linear-gradient(rgba(144,174,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(144,174,255,0.055) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 820,
          height: 820,
          borderRadius: 410,
          right: -240,
          bottom: -350,
          background: light
            ? 'radial-gradient(circle, rgba(47,107,255,0.14) 0%, rgba(47,107,255,0) 68%)'
            : 'radial-gradient(circle, rgba(47,107,255,0.27) 0%, rgba(47,107,255,0) 68%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 96,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: interpolate(frame, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: COLORS.cobalt,
            boxShadow: '0 0 24px rgba(47,107,255,0.65)',
          }}
        />
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 24,
            lineHeight: 1,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: light ? COLORS.mutedDark : COLORS.cobaltSoft,
          }}
        >
          {step ?? 'DNSChat'}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: '132px 96px 128px',
        }}
      >
        {children}
      </div>
      {caption ? (
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            bottom: 42,
            minHeight: 62,
            borderRadius: 18,
            border: light
              ? '1px solid rgba(7,17,31,0.12)'
              : '1px solid rgba(144,174,255,0.25)',
            backgroundColor: light
              ? 'rgba(255,255,255,0.94)'
              : 'rgba(7,17,31,0.94)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 28px',
            boxSizing: 'border-box',
            fontSize: 34,
            lineHeight: 1.2,
            textAlign: 'center',
            fontWeight: 650,
            letterSpacing: -0.5,
            color: light ? COLORS.ink : COLORS.white,
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
