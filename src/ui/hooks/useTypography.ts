import {
  applyDynamicType,
  getTypographyForPlatform,
} from "../theme/liquidGlassTypography";
import type { TypographyScale } from "../theme/liquidGlassTypography";
import { useFontSize } from "../../context/AccessibilityContext";

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
