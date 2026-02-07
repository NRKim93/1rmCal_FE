"use client";

import { useMemo, useState, useCallback } from "react";

import type { AutoCompleteItem } from "@/lib/types/training";
import { useTrainingAutoCompleteQuery } from "@/lib/query/training";

/** 영문 정규화: 소문자화 + 영숫자만 유지 */
function normEn(s: string) {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * 한글 정규화(음절 검색용)
 * - 공백 제거
 * - 호환 자모/조합형 차이를 줄이기 위해 NFKC 권장
 */
function normKo(s: string) {
  const cleaned = (s ?? "").replace(/\s+/g, "").trim();
  return cleaned.normalize("NFKC");
}

/** 한글(자모 포함) 여부 */
function hasKorean(s: string) {
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(s);
}

/** ✅ 초성 테이블 */
const CHO = [
  "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
] as const;

/** ✅ 한글 음절 -> 초성 문자열 */
function toChosung(str: string) {
  const s = (str ?? "").replace(/\s+/g, "");
  let out = "";

  for (const ch of s) {
    const code = ch.charCodeAt(0);

    // 한글 음절(가-힣)
    if (code >= 0xac00 && code <= 0xd7a3) {
      const idx = code - 0xac00;
      out += CHO[Math.floor(idx / 588)] ?? "";
      continue;
    }

    // 이미 자음(ㄱ-ㅎ)이면 그대로
    if (ch >= "ㄱ" && ch <= "ㅎ") {
      out += ch;
      continue;
    }
  }

  return out;
}

/** ✅ 입력이 "자음만"인지(ㅂ, ㄷㅂ, ㅂㅊ 등) */
function isChosungQuery(q: string) {
  const t = q.replace(/\s+/g, "");
  return t.length > 0 && /^[ㄱ-ㅎ]+$/.test(t);
}

type IndexedItem = AutoCompleteItem & {
  _en: string;
  _ko: string;
  _cho: string; // ✅ 초성 인덱스 추가
};

export function useAutoComplete(options?: { enabled?: boolean; limit?: number }) {
  const enabled = options?.enabled ?? true;
  const limit = options?.limit ?? 30;

  const { data: list = [], isLoading, isError, error } =
    useTrainingAutoCompleteQuery(enabled);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ 인덱스: 한 번만 만들어두고 재사용
  const indexed = useMemo<IndexedItem[]>(() => {
    return list.map((x) => {
      const display = x.trainingDisplayName || x.trainingName || "";
      return {
        ...x,
        _en: normEn(x.trainingName),
        _ko: normKo(`${display}${x.trainingName ?? ""}`), // 음절 검색용
        _cho: toChosung(display),                         // ✅ 초성 검색용
      };
    });
  }, [list]);

  const results = useMemo<AutoCompleteItem[]>(() => {
    const q = query.trim();
    if (!q) return indexed.slice(0, limit);

    const korean = hasKorean(q);
    const qKo = normKo(q);
    const qEn = normEn(q);

    // ✅ 초성 모드(자음만 입력)
    const qCho = q.replace(/\s+/g, "");
    const choMode = isChosungQuery(qCho);

    const scored = indexed
      .map((x) => {
        let score = 0;

        // ✅ 1) 초성 검색: "ㅂ" -> "벤치프레스(ㅂㅊㅍㄹㅅ)" 매칭
        if (choMode) {
          if (x._cho.includes(qCho)) score += 120; // 초성은 최우선
          // 영문도 같이 치는 경우 대비
          if (qEn && x._en.includes(qEn)) score += 10;
          return { x, score };
        }

        // ✅ 2) 일반 검색: 한글(음절) + 영문
        if (korean) {
          if (qKo && x._ko.includes(qKo)) score += 100;
          if (qEn && x._en.includes(qEn)) score += 20;
        } else {
          if (qEn && x._en.includes(qEn)) score += 100;
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

  const getActiveItem = useCallback(
    () => results[activeIndex],
    [results, activeIndex]
  );

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