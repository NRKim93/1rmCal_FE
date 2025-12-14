"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasLogin } from "@/services/auth.service";
import WorkoutCalendar from "@/components/WorkoutCalendar";
import { Header } from "@/components/common/Header";

const gyms = [
  { id: 1, name: "1번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
  { id: 2, name: "2번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
  { id: 3, name: "3번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // 트레이닝 완료한 날짜들 (임시 샘플 데이터)
  const [trainingDates, setTrainingDates] = useState<string[]>([
    '2025-11-10',
    '2025-11-12',
    '2025-11-14',
  ]);

  useEffect(() => {
    // 인증 상태 확인
    if (!hasLogin()) {
      alert('로그인이 필요합니다.');
      router.push('/');
      return;
    }
    setIsLoading(false);
  }, [router]);

  // const handleLogout = () => {
  //   logout();
  //   router.push('/');
  // };

  const handleDateClick = (date: Date) => {
    console.log('선택한 날짜:', date);
    // TODO: 해당 날짜의 트레이닝 상세 정보 조회 및 표시
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 py-8">
      <Header className="mb-6 flex w-[90%] items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-bold">
          유저 아이콘
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-gray-300 bg-white px-6 py-3 text-lg"
          >
            지도
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>
      </Header>
      <section className="mb-6 w-[90%] rounded-lg border-2 border-gray-300 bg-white p-4">
        <h2>내 주변 헬스장</h2>
        <div className="mt-3 flex flex-col gap-3">
          {gyms.map(gym => (
            <div key={gym.id} className="flex items-center gap-4 rounded-md bg-gray-200 p-3">
              <div className="rounded-lg bg-white p-2 text-3xl">🏋️‍♂️</div>
              <div className="text-sm text-gray-700">
                <strong>{gym.name}</strong>
                <div>거리 : {gym.distance}</div>
                <div>운영 시간 : {gym.hours}</div>
                <div>휴무일 : {gym.closed}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-6 w-[90%]">
        <h2 className="mb-4 pl-2 text-xl font-semibold text-gray-800">Workout History</h2>
        <WorkoutCalendar
          trainingDates={trainingDates}
          onDateClick={handleDateClick}
        />
      </section>
      <footer className="mt-6 flex w-[90%] justify-between gap-6">
        <button
          type="button"
          className="flex-1 rounded-md bg-gray-200 py-4 text-xl font-bold hover:bg-gray-300"
          onClick={() => router.push('/trainingMain')}
        >
          트레이닝 기록
        </button>
        <button type="button" className="flex-1 rounded-md bg-gray-200 py-4 text-xl font-bold hover:bg-gray-300">
          트레이닝 분석
        </button>
        <button
          type="button"
          className="flex-1 rounded-md bg-gray-200 py-4 text-xl font-bold hover:bg-gray-300"
          onClick={() => router.push('/1rm')}
        >
          1RM 측정
        </button>
      </footer>
    </div>
  );
}
