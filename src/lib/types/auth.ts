// 회원가입 요청 데이터
export type SignUpPayload = {
  nickName: string;
  email: string;
};

// 네이버 로그인 응답 데이터
export type NaverLoginResponse = {
  code: number;
  email: string;
  identify: string;
  message: string;
  provider: string;
  userId: number;
};
