'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signup } from '@/services/auth.service';

export default function NaverNicknameClient() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요');
      return;
    }

    if (!email) {
      setError('이메일이 누락되어있습니다.');
      return;
    }

    try {
      await signup({ email, nickName: nickname });
      alert('닉네임이 등록되었습니다');
      router.push('/');
    } catch {
      setError('닉네임 등록에 실패했습니다. 다시 시도해 주세요');
    }
  };

  return (
    <div className="mx-auto my-16 max-w-[400px] rounded-lg border border-gray-200 p-6">
      <h2 className="mb-5 text-2xl font-bold">닉네임 입력</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          className="mb-3 w-full rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-[#2db400] px-4 py-2.5 font-bold text-white hover:bg-[#279a00]"
        >
          등록하기
        </button>
        {error && <p className="mt-3 text-red-600">{error}</p>}
      </form>
    </div>
  );
}
