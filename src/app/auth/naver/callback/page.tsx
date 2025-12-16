import { Suspense } from 'react';
import NaverCallbackClient from './NaverCallbackClient';

export default function NaverCallbackPage() {
  return (
    <Suspense fallback={<div>네이버 로그인 처리 중입니다...</div>}>
      <NaverCallbackClient />
    </Suspense>
  );
}
