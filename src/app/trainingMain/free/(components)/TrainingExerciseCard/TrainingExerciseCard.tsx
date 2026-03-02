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
  isSetEditMode: boolean;
  onToggleSetEditMode: () => void;
  onRemoveExercise: () => void;
  onSetRestTime: () => void;
  onChangeExercise: () => void;
  onDuplicateExercise: () => void;
  onMoveExercise: () => void;
  onToggleDone: (setId: string) => void;
  onChangeWeight: (setId: string, value: string) => void;
  onChangeUnit: (setId: string, unit: TrainingExercise["sets"][number]["unit"]) => void;
  onChangeReps: (setId: string, value: string) => void;
  onRemoveSet: (setId: string) => void;
  onReorderSets: (sourceSetId: string, targetSetId: string) => void;
}

export default function TrainingExerciseCard({
  index,
  exercise,
  onAddSet,
  isSetEditMode,
  onToggleSetEditMode,
  onRemoveExercise,
  onSetRestTime,
  onChangeExercise,
  onDuplicateExercise,
  onMoveExercise,
  onToggleDone,
  onChangeWeight,
  onChangeUnit,
  onChangeReps,
  onRemoveSet,
  onReorderSets,
}: TrainingExerciseCardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0 truncate text-lg font-bold text-gray-900">
              {index}. {exercise.name}
            </div>
            {isSetEditMode ? (
              <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                세트 편집 중
              </span>
            ) : null}
          </div>
        </div>
        <MeatballMenu
          items={[
            { label: isSetEditMode ? "세트 편집 종료" : "세트 편집 시작", onClick: onToggleSetEditMode },
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
          isSetEditMode={isSetEditMode}
          onToggleDone={onToggleDone}
          onChangeWeight={onChangeWeight}
          onChangeUnit={onChangeUnit}
          onChangeReps={onChangeReps}
          onRemoveSet={onRemoveSet}
          onReorderSets={onReorderSets}
        />
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          size="md"
          fullWidth
          className="border-0 bg-gray-300 text-sm font-semibold text-black enabled:hover:bg-gray-400"
          onClick={onAddSet}
          disabled={isSetEditMode}
        >
          + Set 추가
        </Button>
      </div>
    </section>
  );
}
