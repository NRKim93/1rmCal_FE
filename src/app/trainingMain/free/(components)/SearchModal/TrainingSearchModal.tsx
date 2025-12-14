"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

interface TrainingSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseName: string) => void;
}

export default function TrainingSearchModal({
  isOpen,
  onClose,
  onSelectExercise,
}: TrainingSearchModalProps) {
  const [name, setName] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSelectExercise(trimmed);
    setName("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setName("");
        onClose();
      }}
      width="92vw"
      contentClassName="px-5 py-6 text-left max-w-[480px] w-full"
    >
      <h2 className="mb-4 text-base font-semibold text-gray-900">종목 추가</h2>

      <label className="block text-xs font-medium text-gray-700" htmlFor="exerciseName">
        종목명
      </label>
      <input
        id="exerciseName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예) BENCHPRESS-BARBELL"
        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
      />

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="md" fullWidth className="bg-gray-200 text-black border-0" onClick={onClose}>
          닫기
        </Button>
        <Button
          variant="outline"
          size="md"
          fullWidth
          className="bg-gray-300 text-black border-0"
          disabled={!canSubmit}
          onClick={submit}
        >
          추가
        </Button>
      </div>
    </Modal>
  );
}
