export type SessionDataProbeOutcome<T> = { value: T; ready: boolean };
export type SessionDataProbe<T> = () => Promise<SessionDataProbeOutcome<T>>;

export type WaitClock = {
  now: () => number;
  sleep: (durationMs: number) => Promise<void>;
};

export type WaitForSessionDataOptions = {
  timeoutMs: number;
  pollIntervalMs: number;
};

export type WaitForSessionDataOutcome<T> = {
  value: T;
  timedOut: boolean;
  attempts: number;
};

/**
 * Block until a probe reports the session data is ready, or the timeout elapses.
 *
 * The probe is always run at least once and its latest `value` is returned in
 * both the ready and timed-out cases, so the caller can surface whatever was
 * last observed. Between unsuccessful probes the loop sleeps `pollIntervalMs`,
 * capped so it never overshoots the deadline. The clock is injected so the loop
 * is deterministic under test; production passes the real `Date.now`/`setTimeout`.
 */
export async function waitForNewSessionData<T>(
  probe: SessionDataProbe<T>,
  clock: WaitClock,
  options: WaitForSessionDataOptions,
): Promise<WaitForSessionDataOutcome<T>> {
  const deadline = clock.now() + options.timeoutMs;
  let attempts = 1;
  let probed = await probe();

  while (!probed.ready) {
    const remaining = deadline - clock.now();
    if (remaining <= 0) {
      return { value: probed.value, timedOut: true, attempts };
    }
    await clock.sleep(Math.min(options.pollIntervalMs, remaining));
    attempts += 1;
    probed = await probe();
  }

  return { value: probed.value, timedOut: false, attempts };
}
