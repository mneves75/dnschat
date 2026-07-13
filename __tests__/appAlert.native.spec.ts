import { Alert } from "react-native";
import { appAlert } from "../src/utils/appAlert";

/**
 * Regression guard for the appAlert migration: on native, React Native only
 * synthesizes its default "OK" action when `buttons` is `undefined`. Passing an
 * empty array yields a dialog with no dismissable button on Android, trapping
 * the user in error alerts (chat-create failure, settings save, log clear, ...).
 * The test harness maps `react-native` to a mock with `Platform.OS === "ios"`,
 * so appAlert takes its native branch here.
 */
describe("appAlert native branch", () => {
  const alertSpy = jest
    .spyOn(Alert, "alert")
    .mockImplementation(() => undefined);

  afterEach(() => {
    alertSpy.mockClear();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("forwards undefined (not []) when no buttons are supplied", () => {
    appAlert("Title", "Message");

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith("Title", "Message", undefined);
  });

  it("passes an explicit button list through unchanged", () => {
    const buttons = [
      { text: "Cancel", style: "cancel" as const },
      { text: "Delete", style: "destructive" as const },
    ];

    appAlert("Delete?", "This cannot be undone.", buttons);

    expect(alertSpy).toHaveBeenCalledWith(
      "Delete?",
      "This cannot be undone.",
      buttons,
    );
  });
});
