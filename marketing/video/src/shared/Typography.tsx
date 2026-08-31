import type {ReactNode} from 'react';
import {COLORS, FONT_MONO} from './tokens';

export const Kicker = ({children}: {children: ReactNode}) => {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 26,
        lineHeight: 1.2,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: COLORS.cobaltSoft,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
};

export const HeroTitle = ({children}: {children: ReactNode}) => {
  return (
    <div
      style={{
        maxWidth: 1120,
        fontSize: 112,
        lineHeight: 0.96,
        letterSpacing: -6,
        fontWeight: 760,
      }}
    >
      {children}
    </div>
  );
};

export const SceneTitle = ({children}: {children: ReactNode}) => {
  return (
    <div
      style={{
        maxWidth: 1120,
        fontSize: 72,
        lineHeight: 1.02,
        letterSpacing: -3,
        fontWeight: 760,
      }}
    >
      {children}
    </div>
  );
};

export const SupportingText = ({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) => {
  return (
    <div
      style={{
        maxWidth: 1050,
        fontSize: 38,
        lineHeight: 1.28,
        letterSpacing: -1,
        color: muted ? COLORS.muted : 'currentColor',
      }}
    >
      {children}
    </div>
  );
};
