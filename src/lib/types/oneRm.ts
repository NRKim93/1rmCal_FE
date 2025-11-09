// 1RM 계산 - 각 횟수별 중량 테이블 항목
export interface RepsTableItem {
  reps: number;
  weight: number;
}

// 1RM 계산 결과
export interface CalculateResult {
  oneRm: number;
  repsTable: RepsTableItem[];
}
