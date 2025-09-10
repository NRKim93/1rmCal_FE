"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../css/dashboard.module.css";
import { hasLogin } from "@/services/auth.service";

const gyms = [
  { id: 1, name: "1번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
  { id: 2, name: "2번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
  { id: 3, name: "3번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 인증 상태 확인
    if (!hasLogin()) {
      alert('로그인이 필요합니다.');
      router.push('/');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userIcon}>유저 아이콘</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={styles.mapBtn}>지도</button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            로그아웃
          </button>
        </div>
      </header>
      <section className={styles.gymSection}>
        <h2>내 주변 헬스장</h2>
        <div className={styles.gymList}>
          {gyms.map(gym => (
            <div key={gym.id} className={styles.gymItem}>
              <div className={styles.gymIcon}>🏋️‍♂️</div>
              <div className={styles.gymInfo}>
                <strong>{gym.name}</strong>
                <div>거리 : {gym.distance}</div>
                <div>운영 시간 : {gym.hours}</div>
                <div>휴무일 : {gym.closed}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.historySection}>
        <h2>Workout History</h2>
        <div className={styles.calendarPlaceholder}>달력 표시</div>
      </section>
      <footer className={styles.footer}>
        <button className={styles.footerBtn}>트레이닝 기록</button>
        <button className={styles.footerBtn}>트레이닝 분석</button>
        <button className={styles.footerBtn} onClick={() => router.push('/1rm')}>1RM 측정</button>
      </footer>
    </div>
  );
}