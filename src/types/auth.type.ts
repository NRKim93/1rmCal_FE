export type SignUpPayload = {
  email: string;
  nickName: string;
};

export type NaverLoginResponse = {
  code: number;
  email: string;
  identify: string;
  message: string;
  provider: string;
  userId: number;
};
