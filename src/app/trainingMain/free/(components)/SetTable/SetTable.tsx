"use client";

import React from "react";
import { TrainingSet } from "@/lib/types/training";

interface SetTableProps {
  sets: TrainingSet[];
  onToggleDone: (setId: string) => void;
}

export default function SetTable({ sets, onToggleDone }: SetTableProps) {
  return (
    <div className="rounded-md bg-gray-300 p-3">
      <div className="grid grid-cols-[0.7fr_1.5fr_1fr_1fr_1fr_0.6fr] gap-2 bg-gray-600 px-3 py-2 text-[11px] font-semibold text-white">
        <span>Set</span>
        <span>Previous</span>
        <span className="text-center">KG/LBS</span>
        <span className="text-center">Reps</span>
        <span className="text-center">Rests</span>
        <span className="text-center" aria-label="Done">
          {" "}
        </span>
      </div>

      <div className="divide-y divide-gray-200 bg-gray-100">
        {sets.map((set, setIdx) => (
          <div
            key={set.id}
            className="grid grid-cols-[0.7fr_1.5fr_1fr_1fr_1fr_0.6fr] items-center gap-2 px-3 py-2 text-[11px] text-gray-800"
          >
            <span className="tabular-nums">{setIdx + 1}</span>
            <span className="min-w-0 truncate">{set.previous}</span>
            <span className="text-center tabular-nums">
              {set.weight}
              {set.unit}
            </span>
            <span className="text-center tabular-nums">{set.reps} reps</span>
            <span className="text-center tabular-nums">{set.restSec} sec</span>
            <button
              type="button"
              onClick={() => onToggleDone(set.id)}
              className={[
                "mx-auto flex h-5 w-5 items-center justify-center rounded-full border",
                set.done ? "border-gray-900 bg-gray-900" : "border-gray-500 bg-transparent",
              ].join(" ")}
              aria-label={set.done ? "Done" : "Not done"}
            >
              <span className={set.done ? "text-[10px] text-white" : "text-transparent"}>✓</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

