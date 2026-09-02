import { Alert, Platform } from "react-native";
import type { AlertButton } from "react-native";
import { devWarn } from "./devLog";

interface Catchable {
  catch: (onRejected: (reason: unknown) => void) => unknown;
}

function isCatchable(value: unknown): value is Catchable {
  if (
    (typeof value !== "object" || value === null) &&
    typeof value !== "function"
  ) {
    return false;
  }

  return "catch" in value && typeof value.catch === "function";
}

function invokeButton(button: AlertButton | undefined): void {
  if (!button?.onPress) {
    return;
  }

  try {
    const result: unknown = button.onPress();
    if (isCatchable(result)) {
      result.catch((error) => {
        devWarn("[appAlert] Alert action failed", error);
      });
    }
  } catch (error) {
    devWarn("[appAlert] Alert action failed", error);
  }
}

function composeAlertText(title: string, message?: string): string {
  return message ? `${title}\n\n${message}` : title;
}

export function appAlert(
  title: string,
  message?: string,
  buttons: AlertButton[] = [],
): void {
  if (Platform.OS === "web") {
    const text = composeAlertText(title, message);

    if (buttons.length <= 1) {
      window.alert(text);
      invokeButton(buttons[0]);
      return;
    }

    if (buttons.length > 2) {
      // window.confirm is binary (OK/Cancel); a third action is unreachable on
      // web. Every current caller uses the cancel+confirm pair — warn so a
      // future 3-button alert does not silently drop its middle option.
      devWarn(
        `[appAlert] ${buttons.length} buttons on web collapse to confirm/cancel; extra actions are dropped`,
      );
    }

    const accepted = window.confirm(text);
    if (accepted) {
      const preferredButton = buttons.find(
        (button) =>
          button.style === "destructive" || button.style === "default",
      );
      const nonCancelButton = buttons.find(
        (button) => button.style !== "cancel",
      );
      invokeButton(preferredButton ?? nonCancelButton);
      return;
    }

    invokeButton(buttons.find((button) => button.style === "cancel"));
    return;
  }

  // Forward `undefined` for an empty list: React Native only synthesizes its
  // default "OK" action when `buttons` is undefined. Passing `[]` yields a
  // dialog with no dismissable button on Android.
  Alert.alert(title, message, buttons.length > 0 ? buttons : undefined);
}
