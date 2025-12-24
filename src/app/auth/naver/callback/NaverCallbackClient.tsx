'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasLogin, naverLogin } from '@/services/auth.service';

export default function NaverCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const mode = searchParams.get('mode');

    if (!code) return;

    const backendUrl = process.env.NEXT_PUBLIC_NAVER_LOGIN_API_URL;

    if (!backendUrl) {
      console.error('백엔드 URL이 설정되지 않았습니다');
      alert('서버 설정 오류가 발생했습니다.');
      router.push('/');
      return;
    }

    naverLogin(code, state ?? '', mode ?? '')
      .then((response: any) => {
        if (response.data.data === 201) {
          if (mode === 'signup') {
            router.push(`api/v1/auth/naver/nickname?email=${encodeURIComponent(response.data.data)}`);
          } else {
            alert('등록되지 않은 회원입니다. 회원가입 부탁드립니다.');
            router.push('api/v1/users/setNickname');
          }
        } else if (response.data.data.code === 200) {
          if (mode === 'signup') {
            alert('이미 가입된 회원입니다.');
            router.push('/');
          } else {
            const seq = response.data.data.seq;
            if (seq) {
              localStorage.setItem('seq', seq);
              console.log('사용자 ID 저장', seq);
            }

            setTimeout(async () => {
              if (await hasLogin()) {
                console.log('로그인 성공: 쿠키가 정상적으로 저장되었습니다.');
                router.push('/dashboard');
              } else {
                console.error('로그인 실패: 쿠키가 저장되지 않았습니다');
                alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                router.push('/');
              }
            }, 100);
          }
        }
      })
      .catch((error: any) => {
        console.error('로그인 실패:', error);
        router.push('/login-failed');
      });
  }, [searchParams, router]);

  return (
    <div>
      <p>네이버 로그인 처리 중입니다...</p>
    </div>
  );
}
