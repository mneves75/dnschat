import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

describe("installed Expo haptics capability contract", () => {
  it.each([true, false])(
    "returns the native hardware capability (%s)",
    async (supported) => {
      const source = fs.readFileSync(
        "node_modules/expo-haptics/src/Haptics.ts",
        "utf8",
      );
      const exports: Record<string, unknown> = {};
      const native = { isAvailableAsync: jest.fn(async () => supported) };
      const javascript = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText;
      vm.runInNewContext(javascript, {
        exports,
        require: (name: string) => {
          if (name === "./ExpoHaptics")
            return { __esModule: true, default: native };
          if (name === "./Haptics.types") return {};
          if (name === "expo-modules-core")
            return { Platform: { OS: "ios" }, UnavailabilityError: Error };
          throw new Error(`Unexpected haptics dependency ${name}`);
        },
      });
      const probe = exports["isAvailableAsync"] as () => Promise<boolean>;
      await expect(probe()).resolves.toBe(supported);
      expect(native.isAvailableAsync).toHaveBeenCalledTimes(1);
    },
  );
});
