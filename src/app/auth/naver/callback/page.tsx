import { Suspense } from 'react';
import NaverCallbackClient from './NaverCallbackClient';
import { AuthCardSkeleton } from '@/components/common/ui/PageSkeletons';

export default function NaverCallbackPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton label="네이버 로그인을 처리하는 중" />}>
      <NaverCallbackClient />
    </Suspense>
  );
}
