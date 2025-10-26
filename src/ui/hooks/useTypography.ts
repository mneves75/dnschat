import { Platform } from 'react-native';
import {
  LiquidGlassType,
  Material3Type,
  Typography,
  TypographyStyle,
  getTypographyForPlatform,
} from '../theme/liquidGlassTypography';

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
export const useTypography = () => {
  return getTypographyForPlatform();
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
  key: keyof typeof LiquidGlassType | keyof typeof Material3Type
): TypographyStyle => {
  const typography = useTypography();
  return typography[key] as TypographyStyle;
};

export default useTypography;
