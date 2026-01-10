"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "./Toast";

export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastInput = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
  durationMs: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 3000;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(item => item.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const item: ToastItem = {
        id: createId(),
        message: toast.message,
        variant: toast.variant ?? "info",
        durationMs: toast.durationMs ?? DEFAULT_DURATION_MS,
      };
      setToasts(prev => [...prev, item]);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(360px,90vw)] flex-col gap-2"
      >
        {toasts.map(item => (
          <div key={item.id} className="pointer-events-auto">
            <Toast
              id={item.id}
              message={item.message}
              variant={item.variant}
              durationMs={item.durationMs}
              onClose={dismissToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
