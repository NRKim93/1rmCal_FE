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
      // 이 URL은 백엔드 서버의 주소여야 합니다.
      // 지금은 예시로 작성했으며, 실제 백엔드 주소로 변경해야 합니다.
      const backendUrl = 'http://localhost:3001/api/v1/users/naver/createNaverUser'; 

      axios.get(backendUrl, { params: { code, state, mode } })
        .then((response: any) => {
          // TODO: 로그인 성공 후 처리 (예: 토큰 저장, 메인 페이지로 이동)
          if(response.data.statusCode === 201){
            if(mode === 'signup') {
              router.push(`/auth/naver/nickname?email=${encodeURIComponent(response.data.data)}`); //  회원가입 후 닉네임 입력 페이지로 
            } else alert('등록되지 않은 회원입니다. 회원가입 부탁드립니다. ');

            router.push('/');

          }else if(response.data.statusCode === 200){
            if (mode === 'signup') {
              alert('이미 가입된 회원입니다.');
            }
            router.push('/'); //  이미 가입된 회원이면 로그인 처리
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