"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/common/Button";
import TrainingExerciseCard from "./(components)/TrainingExerciseCard/TrainingExerciseCard";
import TrainingSearchModal from "./(components)/SearchModal/TrainingSearchModal";
import RestTimePickerModal from "./(components)/RestTimePickerModal/RestTimePickerModal";
import RestCountdownModal from "./(components)/RestCountdownModal/RestCountdownModal";
import { TrainingExercise, TrainingHistoryItem, TrainingSet, WeightUnit } from "@/lib/types/training";
import { useTrainingAutoCompleteQuery } from "@/lib/query/training";
import { getLatestHistory } from "@/services/trainingMain.service";
import { useTimer } from "@/hooks/useTimer";

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
  return /[\u3131-\u318E\uAC00-\uD7A3]/.test(s);
}

function getNameBases(name: string) {
  const trimmed = (name ?? "").trim();
  const byHyphen = trimmed.split("-")[0]?.trim() ?? "";
  const byParen = trimmed.split("(")[0]?.trim() ?? "";
  return Array.from(new Set([trimmed, byHyphen, byParen].filter(Boolean)));
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

function normalizeWeightInput(raw: string) {
  if (raw === "") return "0";
  if (raw.startsWith(".")) return `0${raw}`;

  const [intPart, decimalPart] = raw.split(".");
  const normalizedInt = intPart.replace(/^0+(?=\d)/, "");

  if (decimalPart === undefined) return normalizedInt;
  return `${normalizedInt}.${decimalPart}`;
}

function formatMMSS(totalSec: number) {
  const sec = Math.max(0, Math.floor(totalSec));
  const mm = pad2(Math.floor(sec / 60));
  const ss = pad2(sec % 60);
  return `${mm}:${ss}`;
}

type RestPickerTarget =
  | { type: "exercise"; exerciseId: string }
  | { type: "latestSet"; exerciseId: string; setId: string };

type LatestSetTarget = { exerciseId: string; setId: string; restSec: number; createdAt: number };
type RestCountdownTarget = {
  exerciseId: string;
  setId: string;
  exerciseName: string;
  setNumber: number;
  totalSeconds: number;
};

export default function FreeTrainingPage() {
  const router = useRouter();
  const audioContextRef = useRef<AudioContext | null>(null);

  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;

    const audioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!audioContextClass) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new audioContextClass();
    }
    return audioContextRef.current;
  };

  const primeRestDoneSound = async () => {
    const context = ensureAudioContext();
    if (!context) return;
    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        // Ignore; some browsers block resume until next user gesture.
      }
    }
  };

  const playRestDoneSound = async () => {
    const context = ensureAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return;
      }
    }

    const startAt = context.currentTime;
    const offsets = [0, 0.2];

    offsets.forEach((offset) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const at = startAt + offset;

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.15, at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);

      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(at);
      osc.stop(at + 0.18);
    });
  };

  const {
    seconds: elapsedSeconds,
    isRunning: isElapsedTimerRunning,
    start: startElapsedTimer,
    pause: pauseElapsedTimer,
    reset: resetElapsedTimer,
  } = useTimer({ autoStart: false, direction: "up" });
  const {
    seconds: restCountdownSeconds,
    isRunning: isRestCountdownRunning,
    start: startRestCountdown,
    pause: pauseRestCountdown,
    reset: resetRestCountdown,
  } = useTimer({
    autoStart: false,
    direction: "down",
    minSeconds: 0,
    onComplete: () => {
      void playRestDoneSound();
      setActiveRestCountdown(null);
    },
  });

  const [searchModalMode, setSearchModalMode] = useState<"add" | "change">("add");
  const [searchTargetExerciseId, setSearchTargetExerciseId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [restPickerTarget, setRestPickerTarget] = useState<RestPickerTarget | null>(null);
  const [activeRestCountdown, setActiveRestCountdown] = useState<RestCountdownTarget | null>(null);
  const [isRestCountdownModalOpen, setIsRestCountdownModalOpen] = useState(false);
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

      const baseNames = getNameBases(item.name);
      const aliasKeys = Array.from(
        new Set([
          resolved,
          enKey,
          koKey,
          ...baseNames.map((base) => normEn(base)),
          ...baseNames.map((base) => normKo(base)),
        ].filter(Boolean))
      );

      aliasKeys.forEach((key) => {
        const list = map.get(key) ?? [];
        list.push(item);
        map.set(key, list);
      });
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

  const getPreviousItemsForExercise = (exerciseName: string) => {
    const resolved = resolveExerciseKey(exerciseName);
    const baseNames = getNameBases(exerciseName);
    const candidates = Array.from(
      new Set([
        resolved,
        normEn(exerciseName),
        normKo(exerciseName),
        ...baseNames.map((base) => normEn(base)),
        ...baseNames.map((base) => normKo(base)),
      ].filter(Boolean))
    );

    for (const key of candidates) {
      const found = latestHistoryMap.get(key);
      if (found && found.length > 0) return found;
    }
    return [];
  };

  useEffect(() => {
    if (exercises.length === 0) return;

    setExercises((prev) => {
      let changed = false;

      const next = prev.map((exercise) => {
        const previousItems = getPreviousItemsForExercise(exercise.name);
        let exerciseChanged = false;

        const sets = exercise.sets.map((set, idx) => {
          const nextPrevious = formatPrevious(previousItems[idx]);
          if (set.previous === nextPrevious) return set;
          exerciseChanged = true;
          return { ...set, previous: nextPrevious };
        });

        if (!exerciseChanged) return exercise;
        changed = true;
        return { ...exercise, sets };
      });

      return changed ? next : prev;
    });
  }, [latestHistoryMap]); // Sync previous values after history is loaded

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
    const previousItems = getPreviousItemsForExercise(exerciseName);
    setExercises((prev) => {
      const nextIndex = prev.length + 1;
      const newExercise: TrainingExercise = {
        id: exerciseId,
        name: exerciseName || `종목 ${nextIndex}`,
        restLabel: "00:00",
        sets: [
          {
            id: makeId("set"),
            previous: formatPrevious(previousItems[0]),
            weight: "0",
            unit: "kg",
            reps: 0,
            restSec: 0,
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
        const previousItems = getPreviousItemsForExercise(exercise.name);
        const nextIndex = exercise.sets.length;
        const newSet: TrainingSet = {
          id: makeId("set"),
          previous: formatPrevious(previousItems[nextIndex]),
          weight: "0",
          unit: last?.unit ?? "kg",
          reps: 0,
          restSec: 0,
          done: false,
        };
        return { ...exercise, sets: [...exercise.sets, newSet] };
      })
    );
  };

  const toggleDone = (exerciseId: string, setId: string) => {
    const targetExercise = exercises.find((exercise) => exercise.id === exerciseId);
    const targetSetIndex = targetExercise?.sets.findIndex((set) => set.id === setId) ?? -1;
    const targetSet = targetSetIndex >= 0 ? targetExercise?.sets[targetSetIndex] : null;
    const nextDone = targetSet ? !targetSet.done : false;

    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => (set.id === setId ? { ...set, done: !set.done } : set)),
        };
      })
    );

    if (!targetExercise || !targetSet || targetSetIndex < 0) return;

    if (nextDone && targetSet.restSec > 0) {
      void primeRestDoneSound();
      setActiveRestCountdown({
        exerciseId,
        setId,
        exerciseName: targetExercise.name,
        setNumber: targetSetIndex + 1,
        totalSeconds: targetSet.restSec,
      });
      setIsRestCountdownModalOpen(true);
      return;
    }

    if (
      !nextDone &&
      activeRestCountdown &&
      activeRestCountdown.exerciseId === exerciseId &&
      activeRestCountdown.setId === setId
    ) {
      setActiveRestCountdown(null);
      setIsRestCountdownModalOpen(false);
    }
  };

  const removeExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
  };

  const applyExerciseRest = (exerciseId: string, nextSec: number) => {
    const restLabel = formatMMSS(nextSec);
    setExercises((prev) =>
      prev.map((item) => {
        if (item.id !== exerciseId) return item;
        return {
          ...item,
          restLabel,
          sets: item.sets.map((set) => ({ ...set, restSec: nextSec })),
        };
      })
    );
  };

  const applyLatestSetRest = (exerciseId: string, setId: string, nextSec: number) => {
    const restLabel = formatMMSS(nextSec);
    setExercises((prev) =>
      prev.map((item) => {
        if (item.id !== exerciseId) return item;
        return {
          ...item,
          restLabel,
          sets: item.sets.map((set) => (set.id === setId ? { ...set, restSec: nextSec } : set)),
        };
      })
    );
  };

  const setExerciseRest = (exerciseId: string) => {
    setRestPickerTarget({ type: "exercise", exerciseId });
  };

  const openChangeExerciseModal = (exerciseId: string) => {
    setSearchModalMode("change");
    setSearchTargetExerciseId(exerciseId);
    setIsSearchModalOpen(true);
  };

  const duplicateExercise = (exerciseId: string) => {
    setExercises((prev) => {
      const sourceIndex = prev.findIndex((exercise) => exercise.id === exerciseId);
      if (sourceIndex < 0) return prev;

      const source = prev[sourceIndex];
      const cloned: TrainingExercise = {
        ...source,
        id: makeId("ex"),
        name: `${source.name} (복사)`,
        sets: source.sets.map((set) => ({
          ...set,
          id: makeId("set"),
          done: false,
        })),
      };

      const next = [...prev];
      next.splice(sourceIndex + 1, 0, cloned);
      return next;
    });
  };

  const moveExercise = (exerciseId: string) => {
    const currentIndex = exercises.findIndex((exercise) => exercise.id === exerciseId);
    if (currentIndex < 0) return;

    const input = window.prompt(
      `이동할 위치를 입력하세요. (1-${exercises.length})`,
      String(currentIndex + 1)
    );
    if (input == null) return;

    const targetIndex = Number(input.trim()) - 1;
    if (
      Number.isNaN(targetIndex) ||
      targetIndex < 0 ||
      targetIndex >= exercises.length ||
      targetIndex === currentIndex
    ) {
      return;
    }

    setExercises((prev) => {
      const from = prev.findIndex((exercise) => exercise.id === exerciseId);
      if (from < 0) return prev;

      const next = [...prev];
      const [picked] = next.splice(from, 1);
      next.splice(targetIndex, 0, picked);
      return next;
    });
  };

  const getCreatedAtFromId = (id: string) => {
    const createdAtRaw = id.split("_").at(-1);
    const createdAt = Number(createdAtRaw);
    return Number.isFinite(createdAt) ? createdAt : 0;
  };

  const latestSetTarget = useMemo<LatestSetTarget | null>(() => {
    let latest: LatestSetTarget | null = null;

    exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        const createdAt = getCreatedAtFromId(set.id);
        if (!latest || createdAt > latest.createdAt) {
          latest = { exerciseId: exercise.id, setId: set.id, restSec: set.restSec, createdAt };
        }
      });
    });

    return latest;
  }, [exercises]);

  const selectedRestSeconds = useMemo(() => {
    if (!restPickerTarget) return 0;

    if (restPickerTarget.type === "exercise") {
      const selectedExercise = exercises.find((exercise) => exercise.id === restPickerTarget.exerciseId);
      return selectedExercise?.sets[0]?.restSec ?? 0;
    }

    const selectedExercise = exercises.find((exercise) => exercise.id === restPickerTarget.exerciseId);
    const selectedSet = selectedExercise?.sets.find((set) => set.id === restPickerTarget.setId);
    return selectedSet?.restSec ?? 0;
  }, [exercises, restPickerTarget]);

  const changeWeight = (exerciseId: string, setId: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed !== "" && !/^\d*\.?\d{0,2}$/.test(trimmed)) return;
    const nextWeight = normalizeWeightInput(trimmed);

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

  useEffect(() => {
    if (exercises.length > 0) {
      startElapsedTimer();
      return;
    }
    resetElapsedTimer(0);
  }, [exercises.length, startElapsedTimer, resetElapsedTimer]);

  const toggleElapsedTimer = () => {
    if (exercises.length === 0) return;
    if (isElapsedTimerRunning) {
      pauseElapsedTimer();
      return;
    }
    startElapsedTimer();
  };

  useEffect(() => {
    if (!activeRestCountdown) {
      pauseRestCountdown();
      resetRestCountdown(0);
      setIsRestCountdownModalOpen(false);
      return;
    }

    resetRestCountdown(activeRestCountdown.totalSeconds);
    startRestCountdown();
  }, [activeRestCountdown, pauseRestCountdown, resetRestCountdown, startRestCountdown]);

  const skipRestCountdown = () => {
    pauseRestCountdown();
    setActiveRestCountdown(null);
    setIsRestCountdownModalOpen(false);
  };

  const toggleRestCountdown = () => {
    if (!activeRestCountdown) return;

    if (isRestCountdownRunning) {
      pauseRestCountdown();
      return;
    }
    startRestCountdown();
  };

  const dismissRestCountdownModal = () => {
    setIsRestCountdownModalOpen(false);
  };

  const reopenRestCountdownModal = () => {
    if (!activeRestCountdown) return;
    setIsRestCountdownModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
            유저
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            onClick={toggleElapsedTimer}
            disabled={exercises.length === 0}
            aria-label={isElapsedTimerRunning ? "운동 타이머 일시정지" : "운동 타이머 시작"}
          >
            <span className="text-base leading-none">{isElapsedTimerRunning ? "⏸" : "▶"}</span>
            <span className="font-mono">{formatHMS(elapsedSeconds)}</span>
          </button>
        </div>
        <Button variant="outline" size="sm" className="bg-white px-4 font-semibold" onClick={() => router.back()}>
          finish
        </Button>
      </Header>

      <main className="mx-auto w-full max-w-[560px] px-5 pb-28 pt-5">
        <h1 className="mb-5 text-lg font-bold tracking-tight text-gray-800">{trainingDateLabel}</h1>

        <div className="space-y-5">
          {exercises.length === 0 && (
            <div className="rounded-xl bg-white p-5 text-sm text-gray-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              아직 추가된 종목이 없어요. 아래 버튼으로 종목을 추가해 주세요.
            </div>
          )}
          {exercises.map((exercise, idx) => (
            <TrainingExerciseCard
              key={exercise.id}
              index={idx + 1}
              exercise={exercise}
              onAddSet={() => addSet(exercise.id)}
              onRemoveExercise={() => removeExercise(exercise.id)}
              onSetRestTime={() => setExerciseRest(exercise.id)}
              onChangeExercise={() => openChangeExerciseModal(exercise.id)}
              onDuplicateExercise={() => duplicateExercise(exercise.id)}
              onMoveExercise={() => moveExercise(exercise.id)}
              onToggleDone={(setId) => toggleDone(exercise.id, setId)}
              onChangeWeight={(setId, value) => changeWeight(exercise.id, setId, value)}
              onChangeUnit={(setId, unit) => changeUnit(exercise.id, setId, unit)}
              onChangeReps={(setId, value) => changeReps(exercise.id, setId, value)}
            />
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-sky-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <Button
            variant="outline"
            size="md"
            fullWidth
            className="border-0 bg-sky-100 text-base font-semibold text-sky-950 enabled:hover:bg-sky-200"
            onClick={() => {
              setSearchModalMode("add");
              setSearchTargetExerciseId(null);
              setIsSearchModalOpen(true);
            }}
          >
            + 트레이닝 종목 추가
          </Button>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[560px] gap-3 px-5">
          <Button
            variant="outline"
            size="md"
            fullWidth
            className="border-0 bg-gray-300 font-semibold text-black enabled:hover:bg-gray-400"
            disabled={!latestSetTarget}
            onClick={() => {
              if (!latestSetTarget) return;
              setRestPickerTarget({
                type: "latestSet",
                exerciseId: latestSetTarget.exerciseId,
                setId: latestSetTarget.setId,
              });
            }}
          >
            휴식 타이머
          </Button>
          <Button variant="danger" size="md" fullWidth className="font-semibold">
            금일 트레이닝 취소
          </Button>
        </div>
      </footer>
      {activeRestCountdown && !isRestCountdownModalOpen ? (
        <div className="fixed inset-x-0 bottom-[88px] z-40">
          <div className="mx-auto w-full max-w-[560px] px-5">
            <div className="rounded-xl border border-sky-200 bg-white/95 px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.12)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-sky-700">휴식 타이머 진행 중</p>
                  <p className="truncate text-sm text-gray-700">
                    {activeRestCountdown.exerciseName} - Set {activeRestCountdown.setNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold tabular-nums text-gray-900">
                    {formatMMSS(restCountdownSeconds)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-0 bg-gray-200 text-black"
                    onClick={reopenRestCountdownModal}
                  >
                    보기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <TrainingSearchModal
        isOpen={isSearchModalOpen}
        mode={searchModalMode}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchModalMode("add");
          setSearchTargetExerciseId(null);
        }}
        onSelectExercise={(exerciseName) => {
          if (searchModalMode === "change" && searchTargetExerciseId) {
            const previousItems = getPreviousItemsForExercise(exerciseName);
            setExercises((prev) =>
              prev.map((exercise) =>
                exercise.id === searchTargetExerciseId
                  ? {
                      ...exercise,
                      name: exerciseName,
                      sets: exercise.sets.map((set, idx) => ({
                        ...set,
                        previous: formatPrevious(previousItems[idx]),
                      })),
                    }
                  : exercise
              )
            );
          } else {
            addExercise(exerciseName);
          }
          setIsSearchModalOpen(false);
          setSearchModalMode("add");
          setSearchTargetExerciseId(null);
        }}
      />
      <RestTimePickerModal
        isOpen={restPickerTarget !== null}
        initialSeconds={selectedRestSeconds}
        onClose={() => setRestPickerTarget(null)}
        onConfirm={(seconds) => {
          if (!restPickerTarget) return;
          if (restPickerTarget.type === "exercise") {
            applyExerciseRest(restPickerTarget.exerciseId, seconds);
          } else {
            applyLatestSetRest(restPickerTarget.exerciseId, restPickerTarget.setId, seconds);
          }
          setRestPickerTarget(null);
        }}
      />
      <RestCountdownModal
        isOpen={activeRestCountdown !== null && isRestCountdownModalOpen}
        exerciseName={activeRestCountdown?.exerciseName ?? ""}
        setNumber={activeRestCountdown?.setNumber ?? 0}
        totalSeconds={activeRestCountdown?.totalSeconds ?? 0}
        remainingSeconds={restCountdownSeconds}
        isRunning={isRestCountdownRunning}
        onDismiss={dismissRestCountdownModal}
        onToggleRunning={toggleRestCountdown}
        onSkip={skipRestCountdown}
      />
    </div>
  );
}
