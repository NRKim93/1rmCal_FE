"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/common/Button";
import TrainingExerciseCard from "./(components)/TrainingExerciseCard/TrainingExerciseCard";
import TrainingSearchModal from "./(components)/SearchModal/TrainingSearchModal";
import { TrainingExercise, TrainingHistoryItem, TrainingSet, WeightUnit } from "@/lib/types/training";
import { useTrainingAutoCompleteQuery } from "@/lib/query/training";
import { getLatestHistory } from "@/services/trainingMain.service";

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

function normEn(s: string) {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normKo(s: string) {
  return (s ?? "").replace(/\s+/g, "").trim().normalize("NFKC");
}

function hasKorean(s: string) {
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(s);
}

function formatPrevious(item?: TrainingHistoryItem) {
  if (!item) return "-";
  const weight = item.weight ?? "";
  const unit = item.weight_unit ?? "";
  const reps = item.reps ?? "";
  const weightText = unit ? `${weight} ${unit}` : `${weight}`;
  if (!weightText && !reps) return "-";
  if (!reps) return weightText || "-";
  return `${weightText} x ${reps}`;
}

export default function FreeTrainingPage() {
  const router = useRouter();
  const [elapsedSeconds] = useState(0);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);
  const [latestHistoryItems, setLatestHistoryItems] = useState<TrainingHistoryItem[]>([]);

  const { data: autoCompleteList = [] } = useTrainingAutoCompleteQuery(true);

  const autoIndex = useMemo(() => {
    const byEn = new Map<string, { trainingName: string; trainingDisplayName: string }>();
    const byKo = new Map<string, { trainingName: string; trainingDisplayName: string }>();

    autoCompleteList.forEach((item) => {
      const enKey = normEn(item.trainingName);
      const koKey = normKo(item.trainingDisplayName || item.trainingName || "");
      if (enKey) byEn.set(enKey, item);
      if (koKey) byKo.set(koKey, item);
    });

    return { byEn, byKo };
  }, [autoCompleteList]);

  const latestHistoryMap = useMemo(() => {
    const map = new Map<string, TrainingHistoryItem[]>();

    latestHistoryItems.forEach((item) => {
      const enKey = normEn(item.name);
      const koKey = normKo(item.name);
      const resolved =
        autoIndex.byEn.get(enKey)?.trainingName ||
        autoIndex.byKo.get(koKey)?.trainingName ||
        (hasKorean(item.name) ? koKey : enKey);

      const list = map.get(resolved) ?? [];
      list.push(item);
      map.set(resolved, list);
    });

    return map;
  }, [latestHistoryItems, autoIndex]);

  const resolveExerciseKey = (name: string) => {
    if (hasKorean(name)) {
      const koKey = normKo(name);
      return autoIndex.byKo.get(koKey)?.trainingName ?? koKey;
    }

    const enKey = normEn(name);
    return autoIndex.byEn.get(enKey)?.trainingName ?? enKey;
  };

  useEffect(() => {
    const fetchLatestHistory = async () => {
      try {
        const seqStr = localStorage.getItem("seq");
        if (!seqStr) return;
        const seq = Number(seqStr);
        const response = await getLatestHistory(seq);
        const latestTraining = response?.data?.data?.[0];
        const trainingHistory = latestTraining?.training_history ?? [];
        setLatestHistoryItems(trainingHistory);
      } catch (error) {
        console.error("latest history fetch failed", error);
      }
    };

    fetchLatestHistory();
  }, []);

  const trainingDateLabel = useMemo(() => `${todayYYYYMMDD()} 트레이닝 기록`, []);

  const addExercise = (exerciseName: string) => {
    const exerciseId = makeId("ex");
    const key = resolveExerciseKey(exerciseName);
    const previousItems = latestHistoryMap.get(key) ?? [];
    setExercises((prev) => {
      const nextIndex = prev.length + 1;
      const newExercise: TrainingExercise = {
        id: exerciseId,
        name: exerciseName || `종목 ${nextIndex}`,
        restLabel: "MM:SS",
        sets: [
          {
            id: makeId("set"),
            previous: formatPrevious(previousItems[0]),
            weight: "0",
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
        const key = resolveExerciseKey(exercise.name);
        const previousItems = latestHistoryMap.get(key) ?? [];
        const nextIndex = exercise.sets.length;
        const newSet: TrainingSet = {
          id: makeId("set"),
          previous: formatPrevious(previousItems[nextIndex]),
          weight: "0",
          unit: last?.unit ?? "kg",
          reps: 0,
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

  const changeWeight = (exerciseId: string, setId: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed !== "" && !/^\d*\.?\d{0,2}$/.test(trimmed)) return;
    const nextWeight = trimmed === "" ? "0" : trimmed;

    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.id !== setId) return set;
            return { ...set, weight: nextWeight };
          }),
        };
      })
    );
  };

  const changeUnit = (exerciseId: string, setId: string, unit: WeightUnit) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => (set.id === setId ? { ...set, unit } : set)),
        };
      })
    );
  };

  const changeReps = (exerciseId: string, setId: string, value: string) => {
    const nextReps = value.trim() === "" ? 0 : Number.isNaN(Number(value)) ? null : Number(value);

    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.id !== setId) return set;
            if (nextReps === null) return set;
            return { ...set, reps: nextReps };
          }),
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
              onChangeWeight={(setId, value) => changeWeight(exercise.id, setId, value)}
              onChangeUnit={(setId, unit) => changeUnit(exercise.id, setId, unit)}
              onChangeReps={(setId, value) => changeReps(exercise.id, setId, value)}
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
