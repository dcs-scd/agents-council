import { describe, expect, test } from "bun:test";

import { type SessionDataProbe, type WaitClock, waitForNewSessionData } from "./sessionDataWait";

function advancingClock(): WaitClock & { sleeps: number[] } {
  let current = 0;
  const sleeps: number[] = [];
  return {
    now: () => current,
    sleep: async (durationMs: number) => {
      sleeps.push(durationMs);
      current += durationMs;
    },
    sleeps,
  };
}

describe("waitForNewSessionData", () => {
  test("returns immediately when the first probe is ready", async () => {
    let calls = 0;
    const probe: SessionDataProbe<string> = async () => {
      calls += 1;
      return { value: "data", ready: true };
    };
    const clock = advancingClock();

    const outcome = await waitForNewSessionData(probe, clock, { timeoutMs: 10_000, pollIntervalMs: 1_000 });

    expect(outcome).toEqual({ value: "data", timedOut: false, attempts: 1 });
    expect(calls).toBe(1);
    expect(clock.sleeps).toEqual([]);
  });

  test("polls until a probe is ready, returning that value without timing out", async () => {
    let calls = 0;
    const probe: SessionDataProbe<number> = async () => {
      calls += 1;
      return { value: calls, ready: calls >= 3 };
    };
    const clock = advancingClock();

    const outcome = await waitForNewSessionData(probe, clock, { timeoutMs: 10_000, pollIntervalMs: 1_000 });

    expect(outcome).toEqual({ value: 3, timedOut: false, attempts: 3 });
    expect(clock.sleeps).toEqual([1_000, 1_000]);
  });

  test("times out when no probe is ready before the deadline, returning the last value", async () => {
    const probe: SessionDataProbe<string> = async () => ({ value: "none", ready: false });
    const clock = advancingClock();

    const outcome = await waitForNewSessionData(probe, clock, { timeoutMs: 5_000, pollIntervalMs: 1_000 });

    expect(outcome.timedOut).toBe(true);
    expect(outcome.value).toBe("none");
    expect(outcome.attempts).toBe(6);
  });

  test("caps the final sleep so it never overshoots the deadline", async () => {
    const probe: SessionDataProbe<string> = async () => ({ value: "none", ready: false });
    const clock = advancingClock();

    const outcome = await waitForNewSessionData(probe, clock, { timeoutMs: 2_500, pollIntervalMs: 1_000 });

    expect(outcome.timedOut).toBe(true);
    expect(clock.sleeps).toEqual([1_000, 1_000, 500]);
  });
});
