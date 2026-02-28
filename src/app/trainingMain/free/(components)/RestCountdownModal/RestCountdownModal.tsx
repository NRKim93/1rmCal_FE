"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

interface RestCountdownModalProps {
  isOpen: boolean;
  exerciseName: string;
  setNumber: number;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  onDismiss: () => void;
  onToggleRunning: () => void;
  onSkip: () => void;
}

function formatMMSS(totalSec: number) {
  const sec = Math.max(0, Math.floor(totalSec));
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function RestCountdownModal({
  isOpen,
  exerciseName,
  setNumber,
  totalSeconds,
  remainingSeconds,
  isRunning,
  onDismiss,
  onToggleRunning,
  onSkip,
}: RestCountdownModalProps) {
  const safeTotal = Math.max(1, Math.floor(totalSeconds));
  const safeRemaining = Math.max(0, Math.floor(remainingSeconds));
  const progress = Math.min(100, Math.max(0, ((safeTotal - safeRemaining) / safeTotal) * 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDismiss}
      width="380px"
      showCloseButton={false}
      overlayClassName="bg-black/40 px-4"
      contentClassName="w-full max-w-[380px] rounded-2xl p-5 text-left"
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Rest Timer</h2>
          <p className="mt-1 text-sm text-gray-600">
            {exerciseName} - Set {setNumber}
          </p>
        </div>

        <div className="text-center">
          <p className="font-mono text-5xl font-bold tracking-tight text-gray-900">{formatMMSS(safeRemaining)}</p>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            fullWidth
            className="border-0 bg-gray-200 text-black"
            onClick={onToggleRunning}
          >
            {isRunning ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="outline"
            size="md"
            fullWidth
            className="border-0 bg-gray-900 text-white enabled:hover:bg-gray-700"
            onClick={onSkip}
          >
            Skip
          </Button>
        </div>
      </div>
    </Modal>
  );
}
