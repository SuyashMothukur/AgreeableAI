import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Deadline-based countdown for reliable elapsed tracking.
 */
export function useCountdown(onComplete) {
  const deadlineRef = useRef(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [remainingMs, setRemainingMs] = useState(0);
  const [running, setRunning] = useState(false);

  const stop = useCallback(() => {
    setRunning(false);
    deadlineRef.current = null;
  }, []);

  const resetCompleted = useCallback(() => {
    completedRef.current = false;
  }, []);

  const start = useCallback((durationMs) => {
    completedRef.current = false;
    deadlineRef.current = Date.now() + durationMs;
    setRemainingMs(durationMs);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running || !deadlineRef.current) return undefined;

    const tick = () => {
      const left = Math.max(0, deadlineRef.current - Date.now());
      setRemainingMs(left);
      if (left <= 0 && !completedRef.current) {
        completedRef.current = true;
        setRunning(false);
        onCompleteRef.current?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  return { remainingMs, running, start, stop, resetCompleted };
}
