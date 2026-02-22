"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

interface RestTimePickerModalProps {
  isOpen: boolean;
  initialSeconds: number;
  onClose: () => void;
  onConfirm: (seconds: number) => void;
}

const ITEM_HEIGHT = 36;
const PAD_Y = 70;

function toMS(totalSeconds: number) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return { minutes, seconds };
}

function TimeWheelColumn({
  max,
  value,
  onChange,
  unit,
}: {
  max: number;
  value: number;
  onChange: (next: number) => void;
  unit: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const options = useMemo(() => Array.from({ length: max + 1 }, (_, i) => i), [max]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = value * ITEM_HEIGHT;
  }, [value, max]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="mb-2 text-center text-sm font-medium text-gray-600">{unit}</div>
      <div className="relative">
        <div
          ref={containerRef}
          className="h-44 overflow-y-auto rounded-xl bg-[#f3f4f6] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
            const target = event.currentTarget;
            rafRef.current = requestAnimationFrame(() => {
              const next = Math.round(target.scrollTop / ITEM_HEIGHT);
              const clamped = Math.min(max, Math.max(0, next));
              if (clamped !== value) onChange(clamped);
            });
          }}
        >
          <div style={{ paddingTop: PAD_Y, paddingBottom: PAD_Y }}>
            {options.map((n) => (
              <button
                key={`${unit}-${n}`}
                type="button"
                className={[
                  "block h-9 w-full text-center text-2xl tabular-nums transition-colors",
                  n === value ? "font-semibold text-gray-900" : "text-gray-500",
                ].join(" ")}
                onClick={() => {
                  onChange(n);
                  if (containerRef.current) {
                    containerRef.current.scrollTo({ top: n * ITEM_HEIGHT, behavior: "smooth" });
                  }
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-2 top-1/2 h-9 -translate-y-1/2 rounded-lg border border-gray-300" />
      </div>
    </div>
  );
}

export default function RestTimePickerModal({
  isOpen,
  initialSeconds,
  onClose,
  onConfirm,
}: RestTimePickerModalProps) {
  const initial = useMemo(() => toMS(initialSeconds), [initialSeconds]);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [seconds, setSeconds] = useState(initial.seconds);

  useEffect(() => {
    if (!isOpen) return;
    setMinutes(initial.minutes);
    setSeconds(initial.seconds);
  }, [isOpen, initial.minutes, initial.seconds]);

  const totalSeconds = minutes * 60 + seconds;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="560px"
      showCloseButton={false}
      overlayClassName="items-end bg-black/40 px-3"
      contentClassName="w-full max-w-[560px] rounded-t-2xl rounded-b-none p-4 text-left"
    >
      <div className="mx-auto w-full">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">휴식시간 설정</h2>
        <div className="grid grid-cols-2 gap-2">
          <TimeWheelColumn max={59} value={minutes} onChange={setMinutes} unit="분" />
          <TimeWheelColumn max={59} value={seconds} onChange={setSeconds} unit="초" />
        </div>

        <div className="mt-3 text-center text-sm text-gray-600">
          선택됨: <span className="font-semibold text-gray-900">{totalSeconds}초</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="md" fullWidth className="border-0 bg-gray-200 text-black" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="outline"
            size="md"
            fullWidth
            className="border-0 bg-gray-900 text-white enabled:hover:bg-gray-700"
            onClick={() => onConfirm(totalSeconds)}
          >
            적용
          </Button>
        </div>
      </div>
    </Modal>
  );
}
