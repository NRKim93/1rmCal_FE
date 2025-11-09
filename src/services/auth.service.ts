import { APIResponse, NaverLoginResponse, SignUpPayload } from "@/lib/types"
import instance from "./api"

export const naverLogin = async (code:string, state?: string, mode?: string) => {
    return await instance.get<APIResponse<{data : NaverLoginResponse}>> (
        '/api/v1/users/naver/createNaverUser',
        { params : {code,state,mode}}
    );
};

export const signup = (payload : SignUpPayload) => {
    return instance.post<APIResponse>('/api/v1/users/setNickname',payload);
};

export const hasLogin = async () => {
    return await instance.get<
    APIResponse <{data: {isLoggedIn:boolean}}>
    >("/api/v1/auth/status");
};