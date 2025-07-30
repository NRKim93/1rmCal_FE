"use client";
import styles from './css/1rm.module.css';
import React, { useState, useEffect } from "react";

const EVENTS = [
  "벤치프레스",
  "스쿼트",
  "데드리프트(컨벤)",
  "데드리프트(스모)",
  "오버헤드프레스"
];

interface RepsTableItem {
  reps: number;
  weight: number;
}

interface CalculateResult {
    oneRm: number;
    repsTable: RepsTableItem[];
}

export default function OneRMPage() {
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
        if (!event || !weight || !reps) {
            setShowResult(false); // 필드 미완성 시 결과 숨김
            return;
        }

        const w = parseFloat(weight);
        if (isNaN(w) || w <= 0) {
             setShowResult(false); // 유효하지 않은 무게 입력 시 결과 숨김
             return;
        }

        try {
          const response = await fetch('http://localhost:3001/onerm/cal', {
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
            const errorData = await response.json();
            throw new Error(errorData.message || '1RM 계산 중 오류가 발생했습니다.');
          }

          const data: CalculateResult = await response.json();
          setOneRM(data.oneRm);
          setResult(data.repsTable);
          setError(null);
          setShowResult(true); // 성공적으로 결과를 받아오면 결과 영역 표시
        } catch (error) {
          setError(error instanceof Error ? error.message : '1RM 계산 중 오류가 발생했습니다.');
          setShowResult(false); // 에러 발생 시 결과 숨김
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
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>1RM 측정기</h1>
      {error && (
        <div className={styles.error}>{error}</div>
      )}
      {/* 종목 선택 */}
      <div className={styles.selectBox}>
        <label className={styles.label}>종목 선택</label>
        <select
          value={event}
          onChange={e => setEvent(e.target.value)}
          className={styles.select}
        >
          <option value="">종목을 선택하세요</option>
          {EVENTS.map(ev => (
            <option key={ev} value={ev}>{ev}</option>
          ))}
        </select>
      </div>
      {/* 중량 입력 */}
      <div className={styles.inputBox}>
        <label className={styles.label}>중량을 입력해 주세요</label>
        <input
          type="text"
          placeholder="중량을 입력하세요"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className={styles.input}
        />
      </div>
      {/* 단위 선택 */}
      <div className={styles.unitBox}>
        <button
          type="button"
          className={unit === 'KG' ? styles.unitActive : styles.unit}
          onClick={() => handleUnitChange('KG')}
        >KG</button>
        <button
          type="button"
          className={unit === 'LBS' ? styles.unitActive : styles.unit}
          onClick={() => handleUnitChange('LBS')}
        >LBS</button>
      </div>
      {/* 반복 횟수 선택 */}
      <div className={styles.repsBox}>
        {[1, 3, 5].map(n => (
          <button
            key={n}
            type="button"
            className={reps === n ? styles.repsActive : styles.reps}
            onClick={() => setReps(n)}
          >{n}회</button>
        ))}
      </div>
      {/* 측정 시작/초기화 버튼 */}
      <div className={styles.actionBox}>
        <button
          type="button"
          className={styles.resetBtn}
          onClick={handleReset}
        >초기화</button>
      </div>
      {/* 결과 표시 */}
      {showResult && (
        <div className={styles.resultBox}>
          {oneRM !== null && <h2 className={styles.resultTitle}>측정 결과</h2>}
          <div className={styles.resultGrid}>
            <div className={styles.resultHeader}>반복 횟수(Reps)</div>
            <div className={styles.resultHeader}>예상 무게(KG/LBS)</div>
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