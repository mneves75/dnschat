import { Share } from "react-native";
import { ShareService } from "../src/services/ShareService";
import { appAlert } from "../src/utils/appAlert";

jest.mock("../src/utils/appAlert", () => ({ appAlert: jest.fn() }));
jest.mock("../src/utils/haptics", () => ({
  HapticFeedback: { medium: jest.fn() },
}));

describe("ShareService.shareConversation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shares a localized transcript and turns a share failure into an alert", async () => {
    const share = jest
      .spyOn(Share, "share")
      .mockRejectedValueOnce(new Error("no share providers"));

    await expect(
      ShareService.shareConversation(["oi", "olá"], "pt-BR"),
    ).resolves.toBeUndefined();

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ message: "1. oi\n\n2. olá" }),
    );
    const [title] = jest.mocked(appAlert).mock.calls[0] ?? [];
    expect(title).toBeDefined();
    expect(title).not.toBe("Share Failed");
  });
});
