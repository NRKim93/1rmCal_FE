import { Suspense } from 'react';
import NaverNicknameClient from './NaverNicknameClient';
import { AuthCardSkeleton } from '@/components/common/ui/PageSkeletons';

export default function NaverNicknamePage() {
  return (
    <Suspense
      fallback={<AuthCardSkeleton label="회원 정보를 불러오는 중" />}
    >
      <NaverNicknameClient />
    </Suspense>
  );
}
