//  드롭다운용 운동 데이터
export interface TrainingDropDown{
  seq: number;
  trainingName: string; 
  trainingDisplayName: string; 
}

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

export interface OneRmHistory {
  author: string;
  trainingName: string; 
  // 계산된 1RM
  weight: number;
  // 계산에 사용한 실제 수행 중량과 반복 횟수
  sourceWeight: number;
  sourceReps: number;
  unit: string; 
}
