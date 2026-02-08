"use client";

import React, { useMemo, useCallback } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useAutoComplete } from "@/hooks/useAutocomplete";

interface TrainingSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseName: string) => void;
}

// ✅ 허용: 한글(가-힣) + 자모(ㄱ-ㅎ, ㅏ-ㅣ) + 영문 + 공백
function sanitizeExerciseQuery(v: string) {
  return v
    .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g, "")
    .replace(/\s+/g, " "); // 연속 공백 1칸으로(원치 않으면 이 줄 제거)
}

export default function TrainingSearchModal({
  isOpen,
  onClose,
  onSelectExercise,
}: TrainingSearchModalProps) {
  const {
    query,
    setQuery,
    results,
    activeIndex,
    setActiveIndex,
    getActiveItem,
    onKeyDown,
    reset,
    isLoading,
  } = useAutoComplete({ enabled: isOpen, limit: 30 });

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const canSubmit = useMemo(() => hasQuery, [hasQuery]);

  const pickItem = useCallback(
    (name: string) => {
      onSelectExercise(name);
      reset();
    },
    [onSelectExercise, reset]
  );

  const submit = useCallback(() => {
    if (!trimmedQuery) return;
    pickItem(trimmedQuery);
  }, [pickItem, trimmedQuery]);

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const active = getActiveItem();
        if (active) {
          pickItem(active.trainingDisplayName || active.trainingName);
        } else {
          submit();
        }
        return;
      }

      onKeyDown(e);
    },
    [getActiveItem, onKeyDown, pickItem, submit]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      contentClassName="px-5 py-6 text-left w-full"
    >
      <h2 className="mb-4 text-base font-semibold text-gray-900">종목 추가</h2>

      <label className="block text-xs font-medium text-gray-700" htmlFor="exerciseName">
        종목명
      </label>
      <input
        id="exerciseName"
        value={query}
        onChange={(e) => setQuery(sanitizeExerciseQuery(e.target.value))} // ✅ 여기만 바꿈
        onKeyDown={onInputKeyDown}
        placeholder="예) BENCHPRESS"
        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
      />

      {hasQuery && (
        isLoading ? (
          <div className="mt-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
            Loading...
          </div>
        ) : results.length > 0 ? (
          <ul className="mt-2 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white">
            {results.map((item, idx) => {
              const displayName = item.trainingDisplayName || item.trainingName;
              const isActive = idx === activeIndex;
              return (
                <li
                  key={item.seq}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => pickItem(displayName)}
                >
                  <span className="font-medium">{displayName}</span>
                  {item.trainingDisplayName && item.trainingName !== item.trainingDisplayName && (
                    <span className="ml-2 text-xs text-gray-500">{item.trainingName}</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
            검색 결과가 없습니다.
          </div>
        )
      )}

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="md"
          fullWidth
          className="bg-gray-200 text-black border-0"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          닫기
        </Button>

        <Button
          variant="outline"
          size="md"
          fullWidth
          className="bg-gray-300 text-black border-0"
          disabled={!canSubmit}
          onClick={submit}
        >
          추가
        </Button>
      </div>
    </Modal>
  );
}
