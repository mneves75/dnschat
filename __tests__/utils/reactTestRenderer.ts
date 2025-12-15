import TestRenderer from "react-test-renderer";
import type { ReactElement } from "react";

type ConsoleError = typeof console.error;

function shouldSuppressReactTestRendererWarning(args: unknown[]): boolean {
  const first = args[0];
  return (
    typeof first === "string" &&
    first.includes("react-test-renderer is deprecated")
  );
}

export function createWithSuppressedWarnings(
  element: ReactElement,
): TestRenderer.ReactTestRenderer {
  const original: ConsoleError = console.error;

  // Temporarily filter the known React 19 deprecation warning produced by
  // react-test-renderer on create(). Do not suppress other errors.
  // Keeping this localized avoids polluting stack traces for unrelated console errors.
  console.error = (...args: unknown[]) => {
    if (shouldSuppressReactTestRendererWarning(args)) return;
    return original(...(args as Parameters<ConsoleError>));
  };

  try {
    return TestRenderer.create(element);
  } finally {
    console.error = original;
  }
}
