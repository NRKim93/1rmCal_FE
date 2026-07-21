import { APIResponse, LatestHistoryResponse } from "@/lib/types";
import instance from "./api";
import {
    CreateTrainingProgramRequest,
    TrainingCreate,
    TrainingCreateContext,
    ProgramTrainingSessionResponse,
    TrainingProgramResponse,
} from "@/lib/types/training";

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
export const trainingCreate = async (
    payload: TrainingCreate[],
    context?: TrainingCreateContext,
) => {
    const result = await instance.post('/api/v1/training/create',{
        param: payload,
        ...context,
    });
    
    return result.data?.data ?? result.data;
}

// 정규 트레이닝 프로그램과 주차별 운동 구성을 등록한다.
export const createTrainingProgram = async (payload: CreateTrainingProgramRequest) => {
    const result = await instance.post('/api/v1/training-programs', payload);
    return result.data?.data ?? result.data;
};

// 현재 선택 가능한 활성 트레이닝 프로그램 목록을 조회한다.
export const getActiveTrainingPrograms = async (userSeq?: number) => {
    const result = await instance.get<{
        data: TrainingProgramResponse[];
        message: string;
    }>('/api/v1/training-programs/active', {
        params: userSeq ? { userSeq } : undefined,
    });
    return result.data?.data ?? [];
};

// 사용자에게 프로그램을 배정하고 현재 수행할 회차를 반환한다.
export const startTrainingProgram = async (programSeq: number, userSeq: number) => {
    const result = await instance.post<{
        data: ProgramTrainingSessionResponse;
        message: string;
    }>(`/api/v1/training-programs/${programSeq}/start`, { userSeq });
    return result.data.data;
};
