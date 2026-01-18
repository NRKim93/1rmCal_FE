import { APIResponse } from "@/lib/types"
import { OneRmHistory, TrainingDropDown } from "@/lib/types/oneRm"
import instance from "./api"

export const trainingDropdown = async (): Promise<TrainingDropDown[]> => {
    const { data } = await instance.get<APIResponse<{ data: TrainingDropDown[] }>>("/api/v1/training/getAllTrainingCategories")
    return data.data ?? []
}

export const onermCal = async (weight: number, reps: number) => {
    return instance.post("/api/v1/onerm/cal", null, {
        params: { weight, reps }
    })
}

export const saveOneRm = async (onerm: OneRmHistory) => {
    return instance.post("/api/v1/onerm/", onerm)
}
