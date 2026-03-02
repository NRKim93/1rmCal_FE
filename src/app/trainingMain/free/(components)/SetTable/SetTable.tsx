"use client";

import React, { useState } from "react";
import { TrainingSet } from "@/lib/types/training";

interface SetTableProps {
  sets: TrainingSet[];
  isSetEditMode?: boolean;
  onToggleDone: (setId: string) => void;
  onChangeWeight: (setId: string, value: string) => void;
  onChangeUnit: (setId: string, unit: TrainingSet["unit"]) => void;
  onChangeReps: (setId: string, value: string) => void;
  onRemoveSet?: (setId: string) => void;
  onReorderSets?: (sourceSetId: string, targetSetId: string) => void;
}

const GRID_COLS =
  "grid-cols-[minmax(2rem,0.35fr)_minmax(0,2.8fr)_minmax(8.2rem,0.95fr)_minmax(3.8rem,0.55fr)_minmax(4.4rem,0.55fr)_minmax(2.1rem,0.35fr)]";

export default function SetTable({
  sets,
  isSetEditMode = false,
  onToggleDone,
  onChangeWeight,
  onChangeUnit,
  onChangeReps,
  onRemoveSet,
  onReorderSets,
}: SetTableProps) {
  const [draggedSetId, setDraggedSetId] = useState<string | null>(null);
  const [dragOverSetId, setDragOverSetId] = useState<string | null>(null);

  const formatMMSS = (totalSec: number) => {
    const sec = Math.max(0, Math.floor(totalSec));
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="w-full rounded-xl bg-gray-200 p-3.5">
      <div
        className={[
          "grid w-full items-center gap-2 rounded-lg bg-gray-600 px-3 py-2.5",
          "text-xs font-semibold text-white",
          GRID_COLS,
        ].join(" ")}
      >
        <div className="min-w-0">Set</div>
        <div className="min-w-0">Previous</div>
        <div className="min-w-0 text-center">KG/LBS</div>
        <div className="min-w-0 text-center">Reps</div>
        <div className="min-w-0 text-center">휴식 시간</div>
        <div className="min-w-0 text-center" aria-label={isSetEditMode ? "Edit" : "Done"}>
          {isSetEditMode ? "편집" : ""}
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-lg bg-white">
        {sets.map((set, setIdx) => (
          <div
            key={set.id}
            draggable={isSetEditMode}
            onDragStart={() => {
              if (!isSetEditMode) return;
              setDraggedSetId(set.id);
              setDragOverSetId(set.id);
            }}
            onDragOver={(event) => {
              if (!isSetEditMode || !draggedSetId) return;
              event.preventDefault();
              if (dragOverSetId !== set.id) setDragOverSetId(set.id);
            }}
            onDrop={(event) => {
              if (!isSetEditMode || !draggedSetId) return;
              event.preventDefault();
              if (draggedSetId !== set.id) {
                onReorderSets?.(draggedSetId, set.id);
              }
              setDraggedSetId(null);
              setDragOverSetId(null);
            }}
            onDragEnd={() => {
              setDraggedSetId(null);
              setDragOverSetId(null);
            }}
            className={[
              "grid w-full items-center gap-2 px-3 py-2.5 transition-colors",
              "text-xs text-gray-800",
              "border-b border-gray-200 last:border-b-0",
              set.done ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "",
              isSetEditMode ? "cursor-grab active:cursor-grabbing" : "",
              dragOverSetId === set.id && draggedSetId !== set.id ? "ring-2 ring-sky-200" : "",
              GRID_COLS,
            ].join(" ")}
          >
            <div className={["min-w-0 tabular-nums", set.done ? "font-semibold" : ""].join(" ")}>
              {setIdx + 1}
            </div>

            <div
              className={[
                "min-w-0 text-[11px] leading-tight",
                set.done ? "font-medium" : "",
                !set.previous || set.previous === "-" ? "text-center" : "",
              ].join(" ")}
            >
              {set.previous || "-"}
            </div>

            <div className="min-w-0">
              <div className="mx-auto flex w-fit items-center justify-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={set.weight}
                  disabled={isSetEditMode}
                  onChange={(event) => onChangeWeight(set.id, event.target.value)}
                  className="h-6 w-[3.5rem] rounded-md border border-gray-400 bg-white px-1.5 text-center text-sm tabular-nums text-gray-900"
                  aria-label="Weight"
                />
                <select
                  value={set.unit}
                  disabled={isSetEditMode}
                  onChange={(event) => onChangeUnit(set.id, event.target.value as TrainingSet["unit"])}
                  className="h-6 w-[3rem] rounded-md border border-gray-400 bg-white px-1 text-xs font-semibold text-gray-700"
                  aria-label="Unit"
                >
                  <option value="kg">KG</option>
                  <option value="lbs">LBS</option>
                </select>
              </div>
            </div>

            <div className="min-w-0 text-center tabular-nums">
              <input
                type="text"
                inputMode="numeric"
                value={String(set.reps)}
                disabled={isSetEditMode}
                onChange={(event) => onChangeReps(set.id, event.target.value)}
                className="mx-auto h-6 w-[3.5rem] rounded-md border border-gray-400 bg-white px-1.5 text-center text-sm tabular-nums text-gray-900"
                aria-label="Reps"
              />
            </div>

            <div className="min-w-0 text-center text-xs font-medium text-gray-700">
              <span className="inline-block min-w-[3.1rem] rounded-md px-1.5 py-1 whitespace-nowrap">
                {formatMMSS(set.restSec)}
              </span>
            </div>

            {isSetEditMode ? (
              <div className="mx-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveSet?.(set.id);
                  }}
                  className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!onRemoveSet || sets.length <= 1}
                >
                  삭제
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onToggleDone(set.id)}
                className={[
                  "mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                  set.done ? "border-emerald-700 bg-emerald-700" : "border-gray-400 bg-transparent",
                ].join(" ")}
                aria-label={set.done ? "Done" : "Not done"}
              >
                {set.done ? <span className="h-2.5 w-2.5 rounded-full bg-white" aria-hidden /> : null}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
