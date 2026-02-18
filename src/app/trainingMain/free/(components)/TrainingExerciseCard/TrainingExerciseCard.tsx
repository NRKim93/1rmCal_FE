"use client";

import React from "react";
import { Button } from "@/components/common/Button";
import { TrainingExercise } from "@/lib/types/training";
import SetTable from "../SetTable/SetTable";

interface TrainingExerciseCardProps {
  index: number;
  exercise: TrainingExercise;
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onToggleDone: (setId: string) => void;
  onChangeWeight: (setId: string, value: string) => void;
  onChangeUnit: (setId: string, unit: TrainingExercise["sets"][number]["unit"]) => void;
  onChangeReps: (setId: string, value: string) => void;
}

function displayExerciseName(name: string) {
  const parts = name.split("-");
  if (parts.length < 2) return name;

  const suffix = parts[parts.length - 1]?.trim().toUpperCase();

  return parts.slice(0, -1).join("-");
}

export default function TrainingExerciseCard({
  index,
  exercise,
  onAddSet,
  onRemoveExercise,
  onToggleDone,
  onChangeWeight,
  onChangeUnit,
  onChangeReps,
}: TrainingExerciseCardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="min-w-0">
          <div className="min-w-0 truncate text-lg font-bold text-gray-900">
            {index}. {displayExerciseName(exercise.name)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            <span className="whitespace-nowrap">휴식 시간 : {exercise.restLabel}</span>
          </div>
          <button
            type="button"
            onClick={onRemoveExercise}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-bold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Remove exercise"
            title="Remove exercise"
          >
            x
          </button>
        </div>
      </div>

      <div className="mt-4">
        <SetTable
          sets={exercise.sets}
          onToggleDone={onToggleDone}
          onChangeWeight={onChangeWeight}
          onChangeUnit={onChangeUnit}
          onChangeReps={onChangeReps}
        />
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          size="md"
          fullWidth
          className="border-0 bg-gray-300 text-sm font-semibold text-black enabled:hover:bg-gray-400"
          onClick={onAddSet}
        >
          + Set 추가
        </Button>
      </div>
    </section>
  );
}
