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

    if (code) {
      // 이 URL은 백엔드 서버의 주소여야 합니다.
      // 지금은 예시로 작성했으며, 실제 백엔드 주소로 변경해야 합니다.
      const backendUrl = 'http://localhost:3001/api/v1/users/naver/createNaverUser'; 

      axios.get(backendUrl, { params: { code, state } })
        .then((response: any) => {
          // TODO: 로그인 성공 후 처리 (예: 토큰 저장, 메인 페이지로 이동)
          console.log('로그인 성공:', response.data);
          alert(response.data.statusCode);
          router.push('/'); // 로그인 성공 시 메인 페이지로 이동
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