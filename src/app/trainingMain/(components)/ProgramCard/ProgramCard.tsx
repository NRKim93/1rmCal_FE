"use client";
import React from 'react';
import { Button } from '@/components/common/Button';
import { Exercise } from '@/lib/types';
import ExerciseTable from '../ExerciseTable/ExerciseTable';

interface ProgramCardProps {
  trainingName?: string;
  exercises: Exercise[];
  subtitle?: string;
  description?: string | null;
  onStartTraining?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  progress?: {
    completedSessions: number;
    totalSessions: number;
    percentage: number;
  };
}

export default function ProgramCard({
  trainingName,
  exercises,
  subtitle,
  description,
  onStartTraining,
  actionLabel = '트레이닝 시작',
  actionDisabled = false,
  progress,
}: ProgramCardProps) {
  const progressPercentage = Math.min(
    Math.max(progress?.percentage ?? 0, 0),
    100,
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div className="mb-5 flex items-center">
        <div className="mr-4 flex h-[50px] w-[50px] items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-600">
          트레이닝 아이콘
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold text-gray-800">
            {trainingName ?? '트레이닝 명'}
          </span>
          <span className="text-sm text-gray-600">
            {subtitle ?? '프로그램 구성을 불러오는 중입니다.'}
          </span>
        </div>
      </div>

      {description && (
        <p className="mb-5 text-sm leading-6 text-gray-600">{description}</p>
      )}

      {progress && (
        <div className="mb-5" aria-label="프로그램 진행률">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-bold text-slate-800">{progressPercentage}%</span>
            <span className="text-slate-500">
              {progress.completedSessions}/{progress.totalSessions}회 완료
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercentage}
            className="h-2.5 overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className="h-full rounded-full bg-sky-500 transition-[width] duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <ExerciseTable exercises={exercises} />

      <Button
        variant="outline"
        size="md"
        fullWidth
        onClick={onStartTraining}
        disabled={actionDisabled}
        className="border-0 bg-gray-300 text-black"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
