import { Share } from "react-native";
import { ShareService } from "../src/services/ShareService";
import { appAlert } from "../src/utils/appAlert";
import type { Message } from "../src/types/chat";

jest.mock("../src/utils/appAlert", () => ({ appAlert: jest.fn() }));
jest.mock("../src/utils/haptics", () => ({
  HapticFeedback: { medium: jest.fn() },
}));

const message = (
  role: Message["role"],
  content: string,
  status: Message["status"] = "sent",
): Message => ({ id: content, role, content, status, timestamp: new Date(0) });

describe("ShareService.shareChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("labels each speaker in the selected language and hides raw error text", async () => {
    const share = jest.spyOn(Share, "share").mockResolvedValue({
      action: "sharedAction",
    });

    await ShareService.shareChat(
      [
        message("user", "o que é dns"),
        message("assistant", "Error: All 3 DNS transports failed", "error"),
        message("user", "de novo"),
        message("assistant", "", "sending"),
      ],
      "pt-BR",
    );

    const shared = String(share.mock.calls[0]?.[0].message);
    expect(shared).toBe(
      [
        "Você: o que é dns",
        "Assistente: A consulta DNS falhou. Tente de novo ou veja os logs DNS em Ajustes.",
        "Você: de novo",
      ].join("\n\n"),
    );
    expect(shared).not.toContain("transports failed");
  });

  it("turns a share failure into a localized alert instead of a rejection", async () => {
    jest
      .spyOn(Share, "share")
      .mockRejectedValueOnce(new Error("no share providers"));

    await expect(
      ShareService.shareChat([message("user", "oi")], "pt-BR"),
    ).resolves.toBeUndefined();

    expect(jest.mocked(appAlert)).toHaveBeenCalledWith(
      "Falha ao compartilhar",
      expect.any(String),
      expect.any(Array),
    );
  });

  it("does nothing for a chat with nothing to share", async () => {
    const share = jest.spyOn(Share, "share");

    await ShareService.shareChat(
      [message("assistant", "", "sending")],
      "en-US",
    );

    expect(share).not.toHaveBeenCalled();
  });
});
