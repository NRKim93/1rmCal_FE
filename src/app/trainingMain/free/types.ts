export type WeightUnit = "kg" | "lbs";

export type TrainingSet = {
  id: string;
  previous: string;
  weight: number;
  unit: WeightUnit;
  reps: number;
  restSec: number;
  done: boolean;
};

export type TrainingExercise = {
  id: string;
  name: string;
  restLabel: string;
  sets: TrainingSet[];
};

