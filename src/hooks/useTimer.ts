"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TimerDirection = "up" | "down";

type UseTimerOptions = {
  initialSeconds?: number;
  intervalMs?: number;
  autoStart?: boolean;
  direction?: TimerDirection;
  minSeconds?: number;
  onComplete?: () => void;
};

export function useTimer(options?: UseTimerOptions) {
  const initialSeconds = options?.initialSeconds ?? 0;
  const intervalMs = options?.intervalMs ?? 1000;
  const autoStart = options?.autoStart ?? false;
  const direction = options?.direction ?? "up";
  const minSeconds = options?.minSeconds ?? 0;

  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const onCompleteRef = useRef(options?.onComplete);

  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      setSeconds((prev) => {
        if (direction === "up") return prev + 1;

        const next = prev - 1;
        if (next <= minSeconds) {
          window.clearInterval(id);
          setIsRunning(false);
          onCompleteRef.current?.();
          return minSeconds;
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [isRunning, intervalMs, direction, minSeconds]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(
    (nextSeconds?: number) => {
      setIsRunning(false);
      setSeconds(nextSeconds ?? initialSeconds);
    },
    [initialSeconds]
  );

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    setSeconds,
  };
}
