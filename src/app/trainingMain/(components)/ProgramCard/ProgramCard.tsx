"use client";
import React from 'react';
import { Button } from '@/components/common/Button';
import { Exercise } from '@/lib/types';
import ExerciseTable from '../ExerciseTable/ExerciseTable';

interface ProgramCardProps {
  exercises: Exercise[];
  trainingDate?: string; // YYYY-MM-DD HH:mm:ss 형식
  onStartTraining?: () => void;
}

// 날짜를 "M월 N주차" 형식으로 변환하는 함수
function formatTrainingDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // 0-based이므로 +1
  const day = date.getDate();

  // 주차 계산: 일자를 7로 나눈 후 올림
  const week = Math.ceil(day / 7);

  return `${month}월 ${week}주차`;
}

export default function ProgramCard({ exercises, trainingDate, onStartTraining }: ProgramCardProps) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div className="mb-5 flex items-center">
        <div className="mr-4 flex h-[50px] w-[50px] items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-600">
          트레이닝 아이콘
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold text-gray-800">트레이닝 명</span>
          <span className="text-sm text-gray-600">
            {trainingDate ? formatTrainingDate(trainingDate) : 'N주차 • M일차'}
          </span>
        </div>
      </div>

      <ExerciseTable exercises={exercises} />

      <Button
        variant="outline"
        size="md"
        fullWidth
        onClick={onStartTraining}
        className="border-0 bg-gray-300 text-black"
      >
        트레이닝 시작
      </Button>
    </div>
  );
}
