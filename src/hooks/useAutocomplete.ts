"use client";

import { useMemo, useState, useCallback } from "react";

import type { AutoCompleteItem } from "@/lib/types/training";
import { useTrainingAutoCompleteQuery } from "@/lib/query/training";

/** 영문 정규화: 소문자화 + 영숫자만 유지 */
function normEn(s: string) {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * 한글/자모 정규화
 * - 호환 자모(ㅂ 등) / 조합형 차이를 줄이기 위해 NFKC 권장
 * - 공백 제거
 */
function normKo(s: string) {
  const cleaned = (s ?? "").replace(/\s+/g, "").trim();
  return cleaned.normalize("NFKC");
}

/** 한글(자모 포함) 여부 */
function hasKorean(s: string) {
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(s);
}

type IndexedItem = AutoCompleteItem & {
  _en: string;
  _ko: string;
};

export function useAutoComplete(options?: {
  enabled?: boolean;
  limit?: number;
}) {
  const enabled = options?.enabled ?? true;
  const limit = options?.limit ?? 30;

  const { data: list = [], isLoading, isError, error } =
    useTrainingAutoCompleteQuery(enabled);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // 인덱스: 한 번만 만들어두고 재사용
  const indexed = useMemo<IndexedItem[]>(() => {
    return list.map((x) => ({
      ...x,
      _en: normEn(x.trainingName),
      // displayName + name까지 같이 인덱싱(표시명이 비어있거나 혼용된 경우 커버)
      _ko: normKo(`${x.trainingDisplayName ?? ""}${x.trainingName ?? ""}`),
    }));
  }, [list]);

  const results = useMemo<AutoCompleteItem[]>(() => {
    const q = query.trim();
    if (!q) return indexed.slice(0, limit);

    const korean = hasKorean(q);
    const qKo = normKo(q);
    const qEn = normEn(q);

    const scored = indexed
      .map((x) => {
        let score = 0;

        // ✅ 한글 입력이면 한글 인덱스를 우선으로 점수
        if (korean) {
          if (qKo && x._ko.includes(qKo)) score += 100;
          // 한글 입력인데 영문도 같이 치는 케이스(예: "벤치 bench") 대비
          if (qEn && x._en.includes(qEn)) score += 20;
        } else {
          // ✅ 영문 입력이면 영문 인덱스 우선
          if (qEn && x._en.includes(qEn)) score += 100;
          // 영문 입력인데 한글도 같이 들어올 수 있음 대비
          if (qKo && x._ko.includes(qKo)) score += 20;
        }

        return { x, score };
      })
      .filter((t) => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((t) => t.x);

    return scored;
  }, [indexed, query, limit]);

  const setQuerySafe = useCallback((v: string) => {
    setQuery(v);
    setActiveIndex(0);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!results.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    },
    [results.length]
  );

  const getActiveItem = useCallback(() => results[activeIndex], [results, activeIndex]);

  const reset = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
  }, []);

  return {
    isLoading,
    isError,
    error,

    query,
    setQuery: setQuerySafe,

    results,

    activeIndex,
    setActiveIndex,
    getActiveItem,

    onKeyDown,
    reset,
  };
}
