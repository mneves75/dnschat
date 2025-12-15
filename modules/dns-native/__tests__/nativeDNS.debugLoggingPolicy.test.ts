describe("NativeDNS debug logging policy", () => {
  it("does not emit console.log in Jest by default", async () => {
    const originalLog = console.log;
    const spy = jest.fn();
    console.log = spy as unknown as typeof console.log;

    try {
      jest.resetModules();
      await import("../index");
    } finally {
      console.log = originalLog;
    }

    expect(spy).not.toHaveBeenCalled();
  });
});

