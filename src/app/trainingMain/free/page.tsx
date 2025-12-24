"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/common/Button";
import TrainingExerciseCard from "./(components)/TrainingExerciseCard/TrainingExerciseCard";
import TrainingSearchModal from "./(components)/SearchModal/TrainingSearchModal";
import { TrainingExercise, TrainingSet } from "@/lib/types/training";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatHMS(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function todayYYYYMMDD() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function FreeTrainingPage() {
  const router = useRouter();
  const [elapsedSeconds] = useState(0);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);

  const trainingDateLabel = useMemo(() => `${todayYYYYMMDD()} 트레이닝 기록`, []);

  const addExercise = (exerciseName: string) => {
    const exerciseId = makeId("ex");
    setExercises((prev) => {
      const nextIndex = prev.length + 1;
      const newExercise: TrainingExercise = {
        id: exerciseId,
        name: exerciseName || `종목 ${nextIndex}`,
        restLabel: "MM:SS",
        sets: [
          {
            id: makeId("set"),
            previous: "-",
            weight: 0,
            unit: "kg",
            reps: 0,
            restSec: 60,
            done: false,
          },
        ],
      };
      return [...prev, newExercise];
    });
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const last = exercise.sets[exercise.sets.length - 1];
        const newSet: TrainingSet = {
          id: makeId("set"),
          previous: last ? `${last.weight} ${last.unit} x ${last.reps}` : "-",
          weight: last?.weight ?? 0,
          unit: last?.unit ?? "kg",
          reps: last?.reps ?? 0,
          restSec: last?.restSec ?? 60,
          done: false,
        };
        return { ...exercise, sets: [...exercise.sets, newSet] };
      })
    );
  };

  const toggleDone = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => (set.id === setId ? { ...set, done: !set.done } : set)),
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
            유저
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm">
            <span className="text-base leading-none">▶</span>
            <span className="font-mono">{formatHMS(elapsedSeconds)}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          finish
        </Button>
      </Header>

      <main className="mx-auto w-full max-w-[480px] px-5 pb-28 pt-4">
        <h1 className="mb-4 text-base font-semibold text-gray-800">{trainingDateLabel}</h1>

        <div className="space-y-4">
          {exercises.length === 0 && (
            <div className="rounded-lg bg-white p-5 text-sm text-gray-600 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              아직 추가된 종목이 없어요. 아래 버튼으로 종목을 추가해 주세요.
            </div>
          )}
          {exercises.map((exercise, idx) => (
            <TrainingExerciseCard
              key={exercise.id}
              index={idx + 1}
              exercise={exercise}
              onAddSet={() => addSet(exercise.id)}
              onToggleDone={(setId) => toggleDone(exercise.id, setId)}
            />
          ))}
        </div>

        <div className="mt-8 rounded-lg bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
          <Button
            variant="outline"
            size="md"
            fullWidth
            className="border-0 bg-gray-300 text-black"
            onClick={() => setIsSearchModalOpen(true)}
          >
            + 트레이닝 종목 추가
          </Button>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
        <div className="mx-auto flex w-full max-w-[480px] gap-3 px-5">
          <Button variant="outline" size="md" fullWidth className="border-0 bg-gray-300 text-black">
            휴식 타이머
          </Button>
          <Button variant="outline" size="md" fullWidth className="border-0 bg-gray-300 text-black">
            금일 트레이닝 취소
          </Button>
        </div>
      </footer>

      <TrainingSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectExercise={(exerciseName) => {
          addExercise(exerciseName);
          setIsSearchModalOpen(false);
        }}
      />
    </div>
  );
}
