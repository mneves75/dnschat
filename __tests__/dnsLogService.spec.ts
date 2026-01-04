import { DNSLogService } from "../src/services/dnsLogService";

describe("DNSLogService cleanup scheduler", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    DNSLogService.stopCleanupScheduler();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("initializes cleanup scheduler only once", async () => {
    const setIntervalSpy = jest
      .spyOn(global, "setInterval")
      .mockImplementation(((fn: () => void, _delay?: number) => {
        return 123 as unknown as NodeJS.Timeout;
      }) as any);

    await DNSLogService.initializeCleanupScheduler();
    await DNSLogService.initializeCleanupScheduler();

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
  });
});
