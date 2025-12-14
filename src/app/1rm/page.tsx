"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RepsTableItem, CalculateResult } from "@/lib/types";

const EVENTS = [
  "벤치프레스",
  "스쿼트",
  "데드리프트(컨벤)",
  "데드리프트(스모)",
  "오버헤드프레스"
];

export default function OneRMPage() {
  const router = useRouter();
  const [event, setEvent] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("KG");
  const [reps, setReps] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<RepsTableItem[]>([]);
  const [oneRM, setOneRM] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnitChange = (newUnit: "KG" | "LBS") => {
    if (!weight || isNaN(parseFloat(weight))) {
      setUnit(newUnit);
      return;
    }

    const currentWeight = parseFloat(weight);
    let convertedWeight;

    if (unit === "KG" && newUnit === "LBS") {
      convertedWeight = currentWeight * 2.20462;
    } else if (unit === "LBS" && newUnit === "KG") {
      convertedWeight = currentWeight * 0.453592;
    } else {
      setUnit(newUnit);
      return;
    }

    setWeight(convertedWeight.toFixed(2));
    setUnit(newUnit);
  };

  useEffect(() => {
    const calculateOnerm = async () => {
        // 입력값 검증
        if (!event) {
            setError('종목을 선택해주세요.');
            setShowResult(false);
            return;
        }
        
        if (!weight || weight.trim() === '') {
            setError('중량을 입력해주세요.');
            setShowResult(false);
            return;
        }

        const w = parseFloat(weight);
        if (isNaN(w) || w <= 0) {
            setError('유효한 중량을 입력해주세요.');
            setShowResult(false);
            return;
        }

        if (w > 1000) {
            setError('중량이 너무 큽니다. 다시 확인해주세요.');
            setShowResult(false);
            return;
        }

        if (!reps || reps < 1 || reps > 20) {
            setError('반복 횟수는 1-20 사이여야 합니다.');
            setShowResult(false);
            return;
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_ONERM_URL;
          
          if (!backendUrl) {
            throw new Error('서버 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
          }

          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              weight: w,
              reps: reps
            })
          });

          if (!response.ok) {
            let errorMessage = '1RM 계산 중 오류가 발생했습니다.';
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
              // JSON 파싱 실패 시 기본 에러 메시지 사용
              console.warn('에러 응답 파싱 실패:', parseError);
            }
            
            if (response.status === 404) {
              errorMessage = '1RM 계산 서비스를 찾을 수 없습니다.';
            } else if (response.status === 500) {
              errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else if (response.status >= 400 && response.status < 500) {
              errorMessage = '잘못된 요청입니다. 입력값을 확인해주세요.';
            }
            
            throw new Error(errorMessage);
          }

          const data: CalculateResult = await response.json();
          
          // 응답 데이터 유효성 검사
          if (!data || typeof data.oneRm !== 'number' || !Array.isArray(data.repsTable)) {
            throw new Error('서버에서 잘못된 응답을 받았습니다.');
          }
          
          setOneRM(data.oneRm);
          setResult(data.repsTable);
          setError(null);
          setShowResult(true);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '1RM 계산 중 오류가 발생했습니다.';
          setError(errorMessage);
          setShowResult(false);
          console.error('1RM 계산 오류:', error);
        }
    };

    // showResult 상태가 true일 때만 계산 실행 (handleStart 클릭 시 true가 됨)
    // 또는 event, weight, unit, reps가 모두 유효할 때 실행
    if (showResult || (event && parseFloat(weight) > 0 && reps)) {
         calculateOnerm();
    } else {
         setShowResult(false);
         setResult([]);
         setOneRM(null);
    }

  }, [event, weight, unit, reps, showResult]);

  const handleReset = () => {
    setEvent("");
    setWeight("");
    setUnit("KG");
    setReps(1);
    setShowResult(false);
    setResult([]);
    setOneRM(null);
    setError(null);
  };

  return (
    <div className="mx-auto my-10 max-w-[500px] text-center">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => router.back()}
          className="my-4 rounded-md border border-gray-300 bg-white px-4 py-2 font-bold hover:bg-gray-50"
        >
          ← 이전으로
        </button>
      </div>
      <h1 className="mb-2 text-4xl font-black">1RM 측정기</h1>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}
      {/* 종목 선택 */}
      <div className="mb-2 mt-6">
        <label className="mb-1 block font-semibold">종목 선택</label>
        <select
          value={event}
          onChange={e => setEvent(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white p-3 text-center text-base"
        >
          <option value="">종목을 선택하세요</option>
          {EVENTS.map(ev => (
            <option key={ev} value={ev}>{ev}</option>
          ))}
        </select>
      </div>
      {/* 중량 입력 */}
      <div className="my-4">
        <label className="mb-1 block font-semibold">중량을 입력해 주세요</label>
        <input
          type="text"
          placeholder="중량을 입력하세요"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className="mt-2 w-full rounded border border-gray-300 p-3 text-center text-base"
        />
      </div>
      {/* 단위 선택 */}
      <div className="my-4 flex gap-4">
        <button
          type="button"
          className={`flex-1 rounded p-3 font-bold ${unit === "KG" ? "bg-gray-400" : "bg-gray-200"}`}
          onClick={() => handleUnitChange('KG')}
        >KG</button>
        <button
          type="button"
          className={`flex-1 rounded p-3 font-bold ${unit === "LBS" ? "bg-gray-400" : "bg-gray-200"}`}
          onClick={() => handleUnitChange('LBS')}
        >LBS</button>
      </div>
      {/* 반복 횟수 선택 */}
      <div className="my-4 flex gap-4">
        {[1, 3, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`flex-1 rounded p-3 font-bold ${reps === n ? "bg-gray-400" : "bg-gray-200"}`}
            onClick={() => setReps(n)}
          >{n}회</button>
        ))}
      </div>
      {/* 측정 시작/초기화 버튼 */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          type="button"
          className="rounded bg-red-600 px-8 py-3 text-lg font-semibold text-white hover:bg-red-700"
          onClick={handleReset}
        >초기화</button>
      </div>
      {/* 결과 표시 */}
      {showResult && (
        <div className="mt-8">
          {oneRM !== null && <h2 className="mb-4 text-2xl">측정 결과</h2>}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-4">
            <div className="font-semibold">반복 횟수(Reps)</div>
            <div className="font-semibold">예상 무게(KG/LBS)</div>
            {result.map((item: RepsTableItem, index) => (
              <React.Fragment key={index}>
                <div>{item.reps}회</div>
                <div>{item.weight} {unit}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
