/**
 * Regression: the markdown renderer's `markdownit`, `topLevelMaxExceededItem`
 * and `allowedImageHandlers` props are DEFAULT PARAMETERS in the library, so
 * omitting them re-evaluates them on every render: a fresh MarkdownIt parser, a
 * fresh element and a fresh array. That invalidates the library's own
 * `useMemo`, rebuilding the AstRenderer and a ~50-key StyleSheet per assistant
 * bubble per render. SafeMarkdown must hand over stable module-scope values.
 *
 * The renderer package ships untransformed ESM, so it is mocked here rather
 * than loaded; `project-rules/astgrep-safe-markdown*.yml` exempts this file.
 */
import type React from "react";

jest.mock("react-native-markdown-display", () => ({
  __esModule: true,
  default: () => null,
  MarkdownIt: jest.requireActual("markdown-it"),
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { SafeMarkdown } from "../src/components/SafeMarkdown";

interface RendererProps {
  markdownit?: unknown;
  topLevelMaxExceededItem?: unknown;
  allowedImageHandlers?: unknown;
}

// SafeMarkdown's only hook is the mocked useTranslation, so calling it directly
// yields the element it hands to the markdown renderer, props included.
const renderProps = (): RendererProps =>
  (
    SafeMarkdown({
      children: "**hello** world",
    }) as React.ReactElement<RendererProps>
  ).props;

describe("SafeMarkdown render engine stability", () => {
  it("passes an explicit markdown parser instead of the per-render default", () => {
    const first = renderProps();
    const second = renderProps();

    expect(first.markdownit).toBeDefined();
    expect(second.markdownit).toBe(first.markdownit);
  });

  it("passes stable overflow and image-handler values", () => {
    const first = renderProps();
    const second = renderProps();

    expect(first.topLevelMaxExceededItem).toBeDefined();
    expect(second.topLevelMaxExceededItem).toBe(first.topLevelMaxExceededItem);

    expect(first.allowedImageHandlers).toBeDefined();
    expect(second.allowedImageHandlers).toBe(first.allowedImageHandlers);
  });

  it("does not widen the allowed image handlers", () => {
    expect(renderProps().allowedImageHandlers).toEqual([]);
  });
});
