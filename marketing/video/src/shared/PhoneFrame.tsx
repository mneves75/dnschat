import type {ReactNode} from 'react';
import {COLORS, FONT_MONO, FONT_SANS} from './tokens';

type PhoneFrameProps = {
  children: ReactNode;
  title?: string;
  width?: number;
  height?: number;
};

export const PhoneFrame = ({
  children,
  title = 'DNSChat',
  width = 590,
  height = 820,
}: PhoneFrameProps) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 58,
        padding: 15,
        boxSizing: 'border-box',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.35), rgba(144,174,255,0.08))',
        border: '1px solid rgba(255,255,255,0.34)',
        boxShadow:
          '0 42px 100px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(255,255,255,0.12)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 44,
          overflow: 'hidden',
          backgroundColor: COLORS.paper,
          color: COLORS.ink,
          fontFamily: FONT_SANS,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: 76,
            padding: '0 30px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(7,17,31,0.09)',
            backgroundColor: 'rgba(255,255,255,0.92)',
          }}
        >
          <div style={{fontSize: 28, fontWeight: 760, letterSpacing: -1}}>
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: FONT_MONO,
              fontSize: 24,
              color: COLORS.mutedDark,
              textTransform: 'uppercase',
              letterSpacing: 1.3,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: COLORS.mint,
              }}
            />
            DNS ativo
          </div>
        </div>
        <div style={{flex: 1, minHeight: 0}}>{children}</div>
      </div>
    </div>
  );
};
