// 운동 기록 항목
export interface TrainingHistoryItem {
  name: string;
  weight: string;
  weight_unit: string;
  reps: string;
}

// 사용자 정보
export interface TrainingUser {
  seq: number;
  id: string;
}

// 트레이닝 데이터
export interface TrainingData {
  seq: number;
  user_seq: number;
  training_date: string;
  training_history: TrainingHistoryItem[];
  users: TrainingUser;
}

// API 응답 타입
export type LatestHistoryResponse = {
  data: TrainingData[];
  message: string;
};
