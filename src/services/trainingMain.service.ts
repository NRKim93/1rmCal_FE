import { APIResponse, LatestHistoryResponse } from "@/lib/types";
import instance from "./api";
import { TrainingCreate } from "@/lib/types/training";

//  최신 운동 이력 호출용 api 
export const getLatestHistory = async (seq: number) => {
    return await instance.get<APIResponse<LatestHistoryResponse>>('/api/v1/training/getLatestHistory', {
        params: { seq }
    });

};

//  자동완성 데이터 호출용 api 
export const getAutoComplete = async () => {
    const result = await instance.get('/api/v1/training/getAutoComplete');
    return result.data?.data ?? result.data;
};

//  트레이닝 create 호출용 api 
export const trainingCreate = async (payload: TrainingCreate[]) => {
    const result = await instance.post('/api/v1/training/create',{
        param: payload,
    });
    
    return result.data?.data ?? result.data;
}