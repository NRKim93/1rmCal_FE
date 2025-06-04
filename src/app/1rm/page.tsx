"use client";
import React, { useState, useEffect } from "react";

const EVENTS = [
  "벤치프레스",
  "스쿼트",
  "데드리프트(컨벤)",
  "데드리프트(스모)",
  "오버헤드프레스"
];

export default function OneRMPage() {
  const [event, setEvent] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("KG");
  const [reps, setReps] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any[]>([]);
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

  const handleStart = async () => {
    if (!event || !weight || !reps) {
      setError("모든 필드를 입력해주세요.");
      setShowResult(false);
      return;
    }

    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      setError("올바른 무게를 입력해주세요.");
      setShowResult(false);
      return;
    }

    setShowResult(true);
    setError(null);
  };

  useEffect(() => {
    const calculateOnerm = async () => {
      if (!event || !weight || !reps) {
        setShowResult(false);
        return;
      }

      const w = parseFloat(weight);
      if (isNaN(w) || w <= 0) {
        setShowResult(false);
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

        const data = await response.json();
        setOneRM(data.oneRm);
        setResult(data.repsTable.map((item: any) => ({
          reps: item.reps,
          weight: `${item.weight} ${unit}`
        })));
        setError(null);
        setShowResult(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : '1RM 계산 중 오류가 발생했습니다.');
        setShowResult(false);
      }
    };

    if (showResult) {
      calculateOnerm();
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
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontWeight: 900, fontSize: 36, marginBottom: 8 }}>1RM 측정기</h1>
      {error && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          {error}
        </div>
      )}
      {/* 종목 선택 */}
      <div style={{ margin: "24px 0 8px 0" }}>
        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>종목 선택</label>
        <select
          value={event}
          onChange={e => setEvent(e.target.value)}
          style={{ width: "100%", padding: 12, fontSize: 16, background: 'white', border: '1px solid #ccc', borderRadius: 4, textAlign: 'center' }}
        >
          <option value="">종목을 선택하세요</option>
          {EVENTS.map(ev => (
            <option key={ev} value={ev}>{ev}</option>
          ))}
        </select>
      </div>
      {/* 중량 입력 */}
      <div style={{ margin: "16px 0" }}>
        <label style={{ fontWeight: 600 }}>중량을 입력해 주세요</label>
        <input
          type="text"
          placeholder="중량을 입력하세요"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 8, borderRadius: 4, border: '1px solid #ccc', textAlign: 'center' }}
        />
      </div>
      {/* 단위 선택 */}
      <div style={{ display: 'flex', gap: 16, margin: '16px 0' }}>
        <button
          type="button"
          style={{ flex: 1, padding: 12, background: unit === 'KG' ? '#bbb' : '#eee', border: 'none', borderRadius: 4, fontWeight: 700 }}
          onClick={() => handleUnitChange('KG')}
        >KG</button>
        <button
          type="button"
          style={{ flex: 1, padding: 12, background: unit === 'LBS' ? '#bbb' : '#eee', border: 'none', borderRadius: 4, fontWeight: 700 }}
          onClick={() => handleUnitChange('LBS')}
        >LBS</button>
      </div>
      {/* 반복 횟수 선택 */}
      <div style={{ display: 'flex', gap: 16, margin: '16px 0' }}>
        {[1, 3, 5].map(n => (
          <button
            key={n}
            type="button"
            style={{ flex: 1, padding: 12, background: reps === n ? '#bbb' : '#eee', border: 'none', borderRadius: 4, fontWeight: 700 }}
            onClick={() => setReps(n)}
          >{n}회</button>
        ))}
      </div>
      {/* 측정 시작/초기화 버튼 */}
      <div style={{ textAlign: 'center', margin: '32px 0 0 0', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button
          type="button"
          style={{ padding: '12px 32px', background: '#ccc', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 18 }}
          onClick={() => setShowResult(true)}
        >측정 시작</button>
        <button
          type="button"
          style={{ padding: '12px 32px', background: 'Crimson', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 18 }}
          onClick={handleReset}
        >초기화</button>
      </div>
      {/* 결과 표시 */}
      {showResult && (
        <div style={{ marginTop: 32 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '8px',
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 8
          }}>
            <div style={{ fontWeight: 600 }}>반복 횟수(Reps)</div>
            <div style={{ fontWeight: 600 }}>예상 무게(KG/LBS)</div>
            {result.map((item, index) => (
              <React.Fragment key={index}>
                <div>{item.reps}회</div>
                <div>{item.weight}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 