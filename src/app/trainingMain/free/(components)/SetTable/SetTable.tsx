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

const MOBILE_GRID_COLS =
  "grid-cols-[1rem_minmax(0,2.15fr)_minmax(5.9rem,1.9fr)_minmax(2.9rem,0.9fr)_minmax(3rem,0.95fr)_1.2rem]";
const DESKTOP_GRID_COLS =
  "sm:grid-cols-[minmax(2rem,0.4fr)_minmax(0,2fr)_minmax(7rem,1.15fr)_minmax(3.75rem,0.75fr)_minmax(4.2rem,0.85fr)_minmax(2.4rem,0.45fr)]";

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

  const renderRowAction = (set: TrainingSet) => {
    if (isSetEditMode) {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemoveSet?.(set.id);
          }}
          className="rounded px-1 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-1.5 sm:text-[11px]"
          disabled={!onRemoveSet || sets.length <= 1}
        >
          삭제
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onToggleDone(set.id)}
        className={[
          "mx-auto flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors sm:h-6 sm:w-6",
          set.done ? "border-emerald-700 bg-emerald-700" : "border-gray-400 bg-transparent",
        ].join(" ")}
        aria-label={set.done ? "Done" : "Not done"}
      >
        {set.done ? <span className="h-2 w-2 rounded-full bg-white sm:h-2.5 sm:w-2.5" aria-hidden /> : null}
      </button>
    );
  };

  return (
    <div className="w-full rounded-xl bg-gray-200 p-2 sm:p-3.5">
      <div
        className={[
          "grid w-full items-center gap-x-1 rounded-lg bg-gray-600 px-2 py-2 text-[10px] font-semibold text-white sm:gap-x-2 sm:px-3 sm:py-2.5 sm:text-xs",
          MOBILE_GRID_COLS,
          DESKTOP_GRID_COLS,
        ].join(" ")}
      >
        <div className="min-w-0">Set</div>
        <div className="min-w-0">Previous</div>
        <div className="min-w-0 text-center">KG/LBS</div>
        <div className="min-w-0 text-center">Reps</div>
        <div className="min-w-0 text-center whitespace-nowrap">Rest</div>
        <div className="min-w-0 text-center" aria-label={isSetEditMode ? "Edit" : "Done"}>
          {isSetEditMode ? "E" : ""}
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
              "grid w-full items-center gap-x-1 border-b px-2 py-2 text-[10px] text-gray-800 transition-colors last:border-b-0 sm:gap-x-2 sm:px-3 sm:py-2.5 sm:text-xs",
              MOBILE_GRID_COLS,
              DESKTOP_GRID_COLS,
              set.done ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-gray-200",
              isSetEditMode ? "cursor-grab active:cursor-grabbing" : "",
              dragOverSetId === set.id && draggedSetId !== set.id ? "ring-2 ring-sky-200" : "",
            ].join(" ")}
          >
            <div className={["min-w-0 text-center tabular-nums", set.done ? "font-semibold" : ""].join(" ")}>
              {setIdx + 1}
            </div>

            <div
              className={[
                "min-w-0 text-[9px] leading-[1.15] break-words sm:text-[11px] sm:leading-tight",
                set.done ? "font-medium" : "",
                !set.previous || set.previous === "-" ? "text-center" : "",
              ].join(" ")}
            >
              {set.previous || "-"}
            </div>

            <div className="min-w-0">
              <div className="mx-auto flex w-full items-center justify-center gap-1 sm:w-fit">
                <input
                  type="text"
                  inputMode="decimal"
                  value={set.weight}
                  disabled={isSetEditMode}
                  onChange={(event) => onChangeWeight(set.id, event.target.value)}
                  className="h-6 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-1 text-center text-[11px] tabular-nums text-gray-900 sm:h-7 sm:w-[4rem] sm:flex-none sm:px-1.5 sm:text-sm"
                  aria-label="Weight"
                />
                <select
                  value={set.unit}
                  disabled={isSetEditMode}
                  onChange={(event) => onChangeUnit(set.id, event.target.value as TrainingSet["unit"])}
                  className="h-6 w-[2.7rem] rounded-md border border-gray-300 bg-white px-1 text-[10px] font-semibold text-gray-700 sm:h-7 sm:w-[3.25rem] sm:text-xs"
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
                className="mx-auto h-6 w-full rounded-md border border-gray-300 bg-white px-1 text-center text-[11px] tabular-nums text-gray-900 sm:h-7 sm:w-[3.75rem] sm:px-1.5 sm:text-sm"
                aria-label="Reps"
              />
            </div>

            <div className="min-w-0 text-center text-[10px] font-medium tabular-nums text-gray-700 sm:text-xs">
              <span className="inline-block whitespace-nowrap">{formatMMSS(set.restSec)}</span>
            </div>

            <div className="flex justify-center">{renderRowAction(set)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
