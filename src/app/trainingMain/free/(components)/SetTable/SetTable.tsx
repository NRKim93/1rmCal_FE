"use client";

import React from "react";
import { TrainingSet } from "@/lib/types/training";

interface SetTableProps {
  sets: TrainingSet[];
  onToggleDone: (setId: string) => void;
  onChangeWeight: (setId: string, value: string) => void;
  onChangeUnit: (setId: string, unit: TrainingSet["unit"]) => void;
  onChangeReps: (setId: string, value: string) => void;
}

const GRID_COLS =
  "grid-cols-[minmax(2.25rem,0.6fr)_minmax(0,1.7fr)_minmax(7.5rem,1fr)_minmax(3.25rem,1fr)_minmax(2.25rem,0.6fr)]";

export default function SetTable({
  sets,
  onToggleDone,
  onChangeWeight,
  onChangeUnit,
  onChangeReps,
}: SetTableProps) {
  return (
    <div className="w-full rounded-lg bg-gray-200 p-3">
      {/* Header */}
      <div
        className={[
          "grid w-full items-center gap-2 rounded-md bg-gray-600 px-4 py-2",
          "text-[11px] font-semibold text-white",
          GRID_COLS,
        ].join(" ")}
      >
        <div className="min-w-0">Set</div>
        <div className="min-w-0">Previous</div>
        <div className="min-w-0 text-center">KG/LBS</div>
        <div className="min-w-0 text-center">Reps</div>
        <div className="min-w-0 text-center" aria-label="Done" />
      </div>

      {/* Body */}
      <div className="mt-2 overflow-hidden rounded-md bg-white">
        {sets.map((set, setIdx) => (
          <div
            key={set.id}
            className={[
              "grid w-full items-center gap-2 px-4 py-2",
              "text-[11px] text-gray-800",
              "border-b border-gray-200 last:border-b-0",
              GRID_COLS,
            ].join(" ")}
          >
            {/* Set */}
            <div className="min-w-0 tabular-nums">{setIdx + 1}</div>

            {/* Previous */}
            <div
              className={[
                "min-w-0 truncate",
                !set.previous || set.previous === "-" ? "text-center" : "",
              ].join(" ")}
            >
              {set.previous || "-"}
            </div>

            {/* KG/LBS (Weight + Unit) */}
            <div className="min-w-0">
              <div className="mx-auto flex w-fit items-center justify-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={set.weight}
                  onChange={(event) => onChangeWeight(set.id, event.target.value)}
                  className="h-5 w-14 rounded border border-gray-400 bg-white px-1 text-center text-[11px] tabular-nums text-gray-900"
                  aria-label="Weight"
                />
                <select
                  value={set.unit}
                  onChange={(event) => onChangeUnit(set.id, event.target.value as TrainingSet["unit"])}
                  className="h-5 w-12 rounded border border-gray-400 bg-white px-1 text-[10px] font-semibold text-gray-700"
                  aria-label="Unit"
                >
                  <option value="kg">KG</option>
                  <option value="lbs">LBS</option>
                </select>
              </div>
            </div>

            {/* Reps */}
            <div className="min-w-0 text-center tabular-nums">
              <input
                type="text"
                inputMode="numeric"
                value={String(set.reps)}
                onChange={(event) => onChangeReps(set.id, event.target.value)}
                className="mx-auto h-5 w-12 rounded border border-gray-400 bg-white px-1 text-center text-[11px] tabular-nums text-gray-900"
                aria-label="Reps"
              />
            </div>

            {/* Done */}
            <button
              type="button"
              onClick={() => onToggleDone(set.id)}
              className={[
                "mx-auto flex h-5 w-5 items-center justify-center rounded-full border",
                set.done ? "border-gray-900 bg-gray-900" : "border-gray-500 bg-transparent",
              ].join(" ")}
              aria-label={set.done ? "Done" : "Not done"}
            >
              <span className={set.done ? "text-[10px] text-white" : "text-transparent"}>
                ✓
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
