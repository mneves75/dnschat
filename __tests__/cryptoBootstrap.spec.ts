describe("crypto bootstrap", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");

  afterEach(() => {
    jest.resetModules();
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "crypto", originalDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, "crypto");
    }
  });

  it("fails loudly when a secure RNG shim cannot be installed", () => {
    jest.resetModules();
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: Object.freeze({}),
    });

    expect(() => require("../src/bootstrap/crypto")).toThrow(
      /Secure RNG unavailable/,
    );
  });
});
