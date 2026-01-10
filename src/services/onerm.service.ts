import { OneRmHistory } from "@/lib/types/oneRm"
import instance from "./api"

export const onermCal = async (weight: number, reps: number) => {
    return instance.post('/api/v1/onerm/cal',null,{
        params: {weight, reps}
    })
} 

export const saveOneRm = async (onerm:OneRmHistory) => {
    return instance.post('/api/v1/onerm/', onerm)
}