'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function NaverCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const mode = searchParams.get('mode');

    if (code) {
      // 환경변수에서 백엔드 URL 가져오기
      const backendUrl = process.env.NEXT_PUBLIC_NAVER_LOGIN_API_URL;
      
      if (!backendUrl) {
        console.error('백엔드 URL이 설정되지 않았습니다.');
        alert('서버 설정 오류가 발생했습니다.');
        router.push('/');
        return;
      }

      axios.get(backendUrl, { params: { code, state, mode } })
        .then((response: any) => {
          // TODO: 로그인 성공 후 처리 (예: 토큰 저장, 메인 페이지로 이동)
          if(response.data.statusCode === 201){
            if(mode === 'signup') {
              router.push(`/auth/naver/nickname?email=${encodeURIComponent(response.data.data)}`); //  회원가입 후 닉네임 입력 페이지로 
            } else {
              alert('등록되지 않은 회원입니다. 회원가입 부탁드립니다. ');
              router.push('/');
            }

          }else if(response.data.statusCode === 200){
            if (mode === 'signup') {
              alert('이미 가입된 회원입니다.');
              router.push('/');
            } else router.push('/dashboard'); //  이미 가입된 회원이면 로그인 처리
          }

        })
        .catch((error: any) => {
          console.error('로그인 실패:', error);
          // TODO: 에러 처리 (예: 에러 페이지로 이동)
          router.push('/login-failed'); 
        });
    }
  }, [searchParams, router]);

  return (
    <div>
      <p>네이버 로그인 처리 중입니다...</p>
    </div>
  );
} 