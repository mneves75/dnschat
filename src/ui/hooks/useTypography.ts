import {
  applyDynamicType,
  LiquidGlassType,
  Material3Type,
  Typography,
  getTypographyForPlatform,
} from '../theme/liquidGlassTypography';
import type { TypographyKey, TypographyScale, TypographyStyle } from '../theme/liquidGlassTypography';
import { useFontSize } from '../../context/AccessibilityContext';

/**
 * useTypography Hook
 * Returns platform-appropriate typography system
 *
 * Usage:
 * ```typescript
 * const typography = useTypography();
 * <Text style={typography.body}>Hello</Text>
 * ```
 *
 * Returns:
 * - iOS: LiquidGlassType (SF Pro scales)
 * - Android: Material3Type (Roboto scales)
 */
export const useTypography = (): TypographyScale => {
  const { scale } = useFontSize();
  const baseTypography = getTypographyForPlatform();
  if (scale === 1) {
    return baseTypography;
  }

  return Object.fromEntries(
    Object.entries(baseTypography).map(([key, style]) => [
      key,
      applyDynamicType(style, scale),
    ]),
  ) as TypographyScale;
};

/**
 * useSemanticTypography Hook
 * Returns semantic typography aliases that automatically
 * map to the correct platform-specific styles
 *
 * Usage:
 * ```typescript
 * const { screenTitle, body, button } = useSemanticTypography();
 * <Text style={screenTitle}>Screen Title</Text>
 * <Text style={body}>Body text</Text>
 * ```
 */
export const useSemanticTypography = () => {
  return Typography;
};

/**
 * useTypographyStyle Hook
 * Returns a specific typography style for the current platform
 *
 * Usage:
 * ```typescript
 * const bodyStyle = useTypographyStyle('body');
 * <Text style={bodyStyle}>Hello</Text>
 * ```
 */
export const useTypographyStyle = (
  key: TypographyKey
): TypographyStyle => {
  const typography = useTypography();
  return typography[key];
};

export default useTypography;
