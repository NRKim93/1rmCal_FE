"use client";
import React from 'react';
import { Exercise } from '@/lib/types';

interface ExerciseTableProps {
  exercises: Exercise[];
}

export default function ExerciseTable({ exercises }: ExerciseTableProps) {
  return (
    <div className="mb-5">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 bg-[#9e9e9e] px-4 py-3 text-sm font-bold text-white">
        <span className="min-w-0">Exercise</span>
        <span>sets</span>
        <span>Weight</span>
        <span>Reps</span>
      </div>
      {exercises.map((e, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-xs text-[#333]"
        >
          <span className="min-w-0 truncate">{e.name}</span>
          <span className="whitespace-nowrap">{e.sets}</span>
          <span className="whitespace-nowrap">{e.weight}</span>
          <span className="whitespace-nowrap">{e.topSet}</span>
        </div>
      ))}
    </div>
  );
}
