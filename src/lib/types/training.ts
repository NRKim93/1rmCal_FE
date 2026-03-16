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

// UI 표시용 운동 항목
export interface Exercise {
  name: string;
  sets: number;
  weight: string;
  topSet: string;
}

//  단위 용 type 
export type WeightUnit = "kg" | "lbs";

// 자유 트레이닝 화면에서 "세트 1개"가 관리하는 UI 상태
export type TrainingSet = {
  // 프론트에서만 쓰는 로컬 식별자
  id: string;
  // 이전 기록 표시용 텍스트 (서버 저장 대상 아님)
  previous: string;
  // 입력 중 값을 유지하기 위해 string으로 관리
  weight: string;
  // 무게 단위
  unit: WeightUnit;
  // 반복 횟수
  reps: number;
  // 휴식 시간(초)
  restSec: number;
  // 완료 체크 상태
  done: boolean;
};

// 자유 트레이닝 화면에서 "운동 종목 카드 1개"가 관리하는 UI 상태
export type TrainingExercise = {
  // 프론트에서만 쓰는 로컬 식별자
  id: string;
  // 종목명
  name: string;
  // 휴식 시간 표시 라벨(mm:ss)
  restLabel: string;
  // 해당 종목의 세트 목록
  sets: TrainingSet[];
};

//  자동완성 dto
export interface AutoCompleteItem{
  seq: number;
  trainingName: string; 
  trainingDisplayName: string; 
}

//  트레이닝 기록 정보 dto
export interface TrainingCreate {
  // training_history PK (생성 시 미포함 가능)
  seq?: number; 
  // 트레이닝 세션 식별자 (생성 시 미포함 가능)
  trainingSeq?: number;
  // 사용자 식별자
  userSeq:number;
  // 종목명
  name:string;
  // 중량
  weight:number;
  // 중량 단위
  weightUnit: WeightUnit;
  // 반복 횟수
  reps:number; 
  // 휴식 시간(mm:ss)
  rest:string;
  // 세트 번호(또는 세트 인덱스)
  sets:number; 
}
