"use client";

import React from "react";
import { TrainingSet } from "@/lib/types/training";

interface SetTableProps {
  sets: TrainingSet[];
  restLabel: string;
  onToggleDone: (setId: string) => void;
  onChangeWeight: (setId: string, value: string) => void;
  onChangeUnit: (setId: string, unit: TrainingSet["unit"]) => void;
  onChangeReps: (setId: string, value: string) => void;
}

const GRID_COLS =
  "grid-cols-[minmax(2rem,0.35fr)_minmax(0,2.8fr)_minmax(8.2rem,0.95fr)_minmax(3.8rem,0.55fr)_minmax(4.4rem,0.55fr)_minmax(2.1rem,0.35fr)]";

export default function SetTable({
  sets,
  restLabel,
  onToggleDone,
  onChangeWeight,
  onChangeUnit,
  onChangeReps,
}: SetTableProps) {
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
        <div className="min-w-0 text-center" aria-label="Done" />
      </div>

      <div className="mt-2 overflow-hidden rounded-lg bg-white">
        {sets.map((set, setIdx) => (
          <div
            key={set.id}
            className={[
              "grid w-full items-center gap-2 px-3 py-2.5 transition-colors",
              "text-xs text-gray-800",
              "border-b border-gray-200 last:border-b-0",
              set.done ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "",
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
                  onChange={(event) => onChangeWeight(set.id, event.target.value)}
                  className="h-6 w-[3.5rem] rounded-md border border-gray-400 bg-white px-1.5 text-center text-sm tabular-nums text-gray-900"
                  aria-label="Weight"
                />
                <select
                  value={set.unit}
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
                onChange={(event) => onChangeReps(set.id, event.target.value)}
                className="mx-auto h-6 w-[3.5rem] rounded-md border border-gray-400 bg-white px-1.5 text-center text-sm tabular-nums text-gray-900"
                aria-label="Reps"
              />
            </div>

            <div className="min-w-0 text-center text-xs font-medium text-gray-700">
              <span className="inline-block min-w-[3.1rem] rounded-md bg-gray-100 px-1.5 py-1 whitespace-nowrap">
                {restLabel}
              </span>
            </div>

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
          </div>
        ))}
      </div>
    </div>
  );
}
