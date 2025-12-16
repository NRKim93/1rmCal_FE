import { Suspense } from 'react';
import NaverNicknameClient from './NaverNicknameClient';

export default function NaverNicknamePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto my-16 max-w-[400px] rounded-lg border border-gray-200 p-6">
          Loading...
        </div>
      }
    >
      <NaverNicknameClient />
    </Suspense>
  );
}
