type DevLogValue = unknown;

declare const __DEV__: boolean | undefined;

function isJestRuntime(): boolean {
  try {
    return (
      typeof process !== "undefined" &&
      typeof process.env === "object" &&
      process.env !== null &&
      typeof process.env["JEST_WORKER_ID"] === "string"
    );
  } catch {
    return false;
  }
}

function isDevRuntime(): boolean {
  try {
    return typeof __DEV__ !== "undefined" && Boolean(__DEV__);
  } catch {
    return false;
  }
}

/**
 * Development-only logging helper.
 *
 * Goals:
 * - Keep production console output minimal (privacy + performance).
 * - Keep Jest output quiet by default (signal over noise).
 * - Preserve simple "turn on logs in dev" behavior.
 */
export function devLog(message: string, data?: DevLogValue): void {
  if (!isDevRuntime()) return;
  if (isJestRuntime()) return;

  if (data === undefined) {
    // eslint-disable-next-line no-console
    console.log(message);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(message, data);
}

export function devLogArgs(...args: unknown[]): void {
  if (!isDevRuntime()) return;
  if (isJestRuntime()) return;
  // eslint-disable-next-line no-console
  console.log(...args);
}

export function devWarn(message: string, data?: DevLogValue): void {
  if (!isDevRuntime()) return;
  if (isJestRuntime()) return;

  if (data === undefined) {
    // eslint-disable-next-line no-console
    console.warn(message);
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(message, data);
}
