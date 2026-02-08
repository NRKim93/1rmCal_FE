"use client";

import React from "react";
import { Button } from "@/components/common/Button";
import { TrainingExercise } from "@/lib/types/training";
import SetTable from "../SetTable/SetTable";

interface TrainingExerciseCardProps {
  index: number;
  exercise: TrainingExercise;
  onAddSet: () => void;
  onToggleDone: (setId: string) => void;
  onChangeWeight: (setId: string, value: string) => void;
  onChangeUnit: (setId: string, unit: TrainingExercise["sets"][number]["unit"]) => void;
  onChangeReps: (setId: string, value: string) => void;
}

function displayExerciseName(name: string) {
  const parts = name.split("-");
  if (parts.length < 2) return name;

  const suffix = parts[parts.length - 1]?.trim().toUpperCase();
  const equipmentSuffixes = new Set([
    "BARBELL",
    "DUMBBELL",
    "KETTLEBELL",
    "SMITH",
    "MACHINE",
    "CABLE",
    "BAND",
    "BODYWEIGHT",
    "\uBC14\uBCA8",
    "\uB364\uBCA8",
  ]);

  if (!suffix || !equipmentSuffixes.has(suffix)) return name;
  return parts.slice(0, -1).join("-");
}

export default function TrainingExerciseCard({
  index,
  exercise,
  onAddSet,
  onToggleDone,
  onChangeWeight,
  onChangeUnit,
  onChangeReps,
}: TrainingExerciseCardProps) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="min-w-0 truncate text-sm font-semibold text-gray-900">
            {index}. {displayExerciseName(exercise.name)}
          </div>
        </div>
        <div className="shrink-0 text-xs text-gray-700">
          <span className="whitespace-nowrap">휴식 시간 : {exercise.restLabel}</span>
        </div>
      </div>

      <div className="mt-3">
        <SetTable
          sets={exercise.sets}
          onToggleDone={onToggleDone}
          onChangeWeight={onChangeWeight}
          onChangeUnit={onChangeUnit}
          onChangeReps={onChangeReps}
        />
      </div>

      <div className="mt-3">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="border-0 bg-gray-200 text-black"
          onClick={onAddSet}
        >
          + Set 추가
        </Button>
      </div>
    </section>
  );
}
