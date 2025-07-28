'use client';

import styles from './nickname.module.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

export default function NaverNicknamePage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요.');
      return;
    }
    try {
      // TODO: 실제 백엔드 API 주소로 변경 필요
      const backendUrl = 'http://localhost:3001/api/v1/users/setNickname';
      await axios.post(backendUrl, { nickName: nickname, email: email });
      alert('닉네임이 등록되었습니다!');
      router.push('/'); // 메인 페이지로 이동
    } catch (err: any) {
      setError('닉네임 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>닉네임 입력</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.submitBtn}>
          등록하기
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
} 