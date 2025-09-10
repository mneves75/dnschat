export type ColorTokens = {
  background: string;
  card: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  primaryContrast: string;
  border: string;
  danger: string;
  success: string;
};

export const spacing = [0, 4, 8, 12, 16, 20, 24, 32, 40] as const;
export type Spacing = typeof spacing;

export const typography = {
  h1: 28,
  h2: 22,
  body: 16,
  caption: 12,
} as const;

export const lightColors: ColorTokens = {
  background: '#FFFFFF',
  card: '#F7F7F8',
  surface: '#EFEFF0',
  text: '#11181C',
  muted: '#6B7280',
  primary: '#007AFF',
  primaryContrast: '#FFFFFF',
  border: '#E5E7EB',
  danger: '#DC2626',
  success: '#16A34A',
};

export const darkColors: ColorTokens = {
  background: '#0B0B0C',
  card: '#111315',
  surface: '#1A1D21',
  text: '#E5E7EB',
  muted: '#9CA3AF',
  primary: '#0A84FF',
  primaryContrast: '#0B0B0C',
  border: '#252B32',
  danger: '#F87171',
  success: '#34D399',
};

export const highContrastAdjust = (c: ColorTokens): ColorTokens => ({
  ...c,
  primary: '#005FCC',
  border: '#9CA3AF',
});
