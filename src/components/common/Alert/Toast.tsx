"use client";

import React, { useEffect } from "react";
import type { ToastVariant } from "./ToastProvider";

type ToastProps = {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
  onClose: (id: string) => void;
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export default function Toast({ id, message, variant, durationMs, onClose }: ToastProps) {
  useEffect(() => {
    if (durationMs <= 0) return;
    const timer = setTimeout(() => onClose(id), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, id, onClose]);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-center gap-3 rounded-md border px-4 py-3 text-sm shadow ${VARIANT_CLASSES[variant]}`}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        aria-label="Close"
        onClick={() => onClose(id)}
        className="rounded px-2 py-1 text-xs font-semibold hover:bg-black/5"
      >
        Close
      </button>
    </div>
  );
}
