"use client";

import { getAutoComplete } from "@/services/trainingMain.service";
import { useQuery } from "@tanstack/react-query";
import { AutoCompleteItem } from "../types/training";

export const trainingQueryKeys = {
  autoComplete: ["training", "autoComplete"] as const,
};

export function useTrainingAutoCompleteQuery(enabled = true) {
  return useQuery<AutoCompleteItem[]>({
    queryKey: trainingQueryKeys.autoComplete,
    queryFn: getAutoComplete,
    enabled,

    staleTime: 1000 * 60 * 60 * 24,   // 24h 동안은 “신선” 취급 -> 재호출 거의 없음
    gcTime: 1000 * 60 * 60 * 24 * 7,  // 7일 캐시 유지

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}