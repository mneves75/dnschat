import { normalizeRouteParam, parseProfileHandle } from "../src/utils/routeParams";

describe("route params", () => {
  describe("normalizeRouteParam", () => {
    it("returns null for empty values", () => {
      expect(normalizeRouteParam(undefined)).toBeNull();
      expect(normalizeRouteParam("")).toBeNull();
      expect(normalizeRouteParam(["", " "])).toBeNull();
    });

    it("returns trimmed strings for valid values", () => {
      expect(normalizeRouteParam(" chat-1 ")).toBe("chat-1");
      expect(normalizeRouteParam(["chat-2"])).toBe("chat-2");
      expect(normalizeRouteParam(["", "chat-3"])).toBe("chat-3");
    });
  });

  describe("parseProfileHandle", () => {
    it("returns null for invalid handles", () => {
      expect(parseProfileHandle(undefined)).toBeNull();
      expect(parseProfileHandle("jane")).toBeNull();
      expect(parseProfileHandle("@")).toBeNull();
      expect(parseProfileHandle("@invalid!")).toBeNull();
      expect(parseProfileHandle(["@bad!", "@jane"])).toBeNull();
    });

    it("returns handle without @ for valid values", () => {
      expect(parseProfileHandle("@jane")).toBe("jane");
      expect(parseProfileHandle(["@john-doe"])).toBe("john-doe");
    });
  });
});
