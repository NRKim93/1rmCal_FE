import axios from 'axios';

// axios 전역 설정
export const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// 요청 인터셉터 (요청 전에 실행)
instance.interceptors.request.use(
  (config) => config,
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (응답 후에 실행)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response Error:', error);
    
    // 401 에러 (인증 실패) 처리
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      console.log('인증 실패: 로그인 페이지로 리다이렉트');
      // 여기서 로그아웃 처리나 리다이렉트 로직을 추가할 수 있습니다
    }
    
    return Promise.reject(error);
  }
);

export default instance; 