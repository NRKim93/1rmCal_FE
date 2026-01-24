import { APIResponse, LatestHistoryResponse } from "@/lib/types";
import instance from "./api";

export const getLatestHistory = async (seq: number) => {
    return await instance.get<APIResponse<LatestHistoryResponse>>('/api/v1/training/getLatestHistory', {
        params: { seq }
    });

};

//  
export const getAutoComplete = async () => {
    return await instance.get('/api/v1/training/getAutoComplete');
};