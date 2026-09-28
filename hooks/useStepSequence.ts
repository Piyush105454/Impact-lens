"use client";
import { useCallback, useRef, useState } from "react";
import { sleep } from "@/lib/utils";

/**
 * Drives a multi-step progress display while an async task runs.
 * Steps advance on a cadence; the sequence completes only when the task resolves.
 * active: -1 idle, 0..count-1 in progress, count = complete.
 */
export function useStepSequence(count: number, stepMs = 380) {
  const [active, setActive] = useState(-1);
  const runId = useRef(0);

  const run = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T> => {
      const id = ++runId.current;
      setActive(0);
      const pending = task();
      pending.catch(() => undefined);
      for (let i = 0; i < count - 1; i++) {
        await sleep(stepMs);
        if (runId.current !== id) break;
        setActive(i + 1);
      }
      try {
        const result = await pending;
        await sleep(stepMs * 0.7);
        if (runId.current === id) setActive(count);
        return result;
      } catch (e) {
        if (runId.current === id) setActive(-1);
        throw e;
      }
    },
    [count, stepMs],
  );

  const reset = useCallback(() => {
    runId.current++;
    setActive(-1);
  }, []);

  return { active, run, reset, running: active >= 0 && active < count, done: active >= count };
}
