"use client";

import React from "react";
import { Button } from "@/components/common/Button";
import { MeatballMenu } from "@/components/common/MeatballMenu";
import { TrainingExercise } from "@/lib/types/training";
import SetTable from "../SetTable/SetTable";

interface TrainingExerciseCardProps {
  index: number;
  exercise: TrainingExercise;
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onSetRestTime: () => void;
  onChangeExercise: () => void;
  onDuplicateExercise: () => void;
  onMoveExercise: () => void;
  onToggleDone: (setId: string) => void;
  onChangeWeight: (setId: string, value: string) => void;
  onChangeUnit: (setId: string, unit: TrainingExercise["sets"][number]["unit"]) => void;
  onChangeReps: (setId: string, value: string) => void;
}

export default function TrainingExerciseCard({
  index,
  exercise,
  onAddSet,
  onRemoveExercise,
  onSetRestTime,
  onChangeExercise,
  onDuplicateExercise,
  onMoveExercise,
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
            {index}. {exercise.name}
          </div>
        </div>
        <MeatballMenu
          items={[
            { label: "휴식시간 설정", onClick: onSetRestTime },
            { label: "종목 복사", onClick: onDuplicateExercise },
            { label: "종목 변경", onClick: onChangeExercise },
            { label: "종목 이동", onClick: onMoveExercise },
            { label: "종목 삭제", danger: true, onClick: onRemoveExercise },
          ]}
        />
      </div>

      <div className="mt-4">
        <SetTable
          sets={exercise.sets}
          onToggleDone={onToggleDone}
          onChangeWeight={onChangeWeight}
          onChangeUnit={onChangeUnit}
          onChangeReps={onChangeReps}
          restLabel={exercise.restLabel}
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
