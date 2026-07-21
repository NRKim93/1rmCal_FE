"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasLogin } from "@/services/auth.service";
import { getLatestHistory } from "@/services/trainingMain.service";
import { parseSeq } from "@/lib/utils/seq";
import WorkoutCalendar from "@/components/WorkoutCalendar";
import { Header } from "@/components/common/Header";
import { DashboardSkeleton } from "@/components/common/ui/PageSkeletons";
import { Modal } from "@/components/common/Modal";
import type { TrainingData } from "@/lib/types/training";

function formatCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function trainingDateKey(trainingDate: string) {
  return trainingDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
}

function formatKoreanDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

const gyms = [
  { id: 1, name: "1번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
  { id: 2, name: "2번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
  { id: 3, name: "3번 헬스장", distance: "500m", hours: "24h", closed: "매 주 일요일" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [trainingDates, setTrainingDates] = useState<string[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<TrainingData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const loginResponse = await hasLogin();
        if (loginResponse.data.data !== 200) {
          alert("로그인이 필요합니다.");
          router.replace("/");
          return;
        }

        const userSeq = parseSeq(localStorage.getItem("seq"));
        if (userSeq === null) {
          alert("사용자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
          router.replace("/");
          return;
        }

        const response = await getLatestHistory(userSeq);
        if (cancelled) return;

        const history = response.data.data;
        const dates = history
          .map((training) => trainingDateKey(training.training_date))
          .filter(Boolean);

        setTrainingHistory(history);
        setTrainingDates(Array.from(new Set(dates)));
        setHistoryError(false);
      } catch (error) {
        console.error("트레이닝 이력을 불러오지 못했습니다.", error);
        if (!cancelled) {
          setTrainingDates([]);
          setTrainingHistory([]);
          setSelectedDate(null);
          setHistoryError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // const handleLogout = () => {
  //   logout();
  //   router.push('/');
  // };

  const selectedTrainings = useMemo(
    () =>
      selectedDate
        ? trainingHistory.filter(
            (training) => trainingDateKey(training.training_date) === selectedDate,
          )
        : [],
    [selectedDate, trainingHistory],
  );

  const exerciseSummaries = useMemo(() => {
    const summaries = new Map<
      string,
      { name: string; setCount: number; bestWeight: number; unit: string; reps: number }
    >();

    selectedTrainings.forEach((training) => {
      training.training_history.forEach((item) => {
        const weight = Number(item.weight);
        const reps = Number(item.reps);
        const current = summaries.get(item.name);

        if (!current) {
          summaries.set(item.name, {
            name: item.name,
            setCount: 1,
            bestWeight: Number.isFinite(weight) ? weight : 0,
            unit: item.weight_unit,
            reps: Number.isFinite(reps) ? reps : 0,
          });
          return;
        }

        current.setCount += 1;
        if (Number.isFinite(weight) && weight >= current.bestWeight) {
          current.bestWeight = weight;
          current.unit = item.weight_unit;
          current.reps = Number.isFinite(reps) ? reps : 0;
        }
      });
    });

    return Array.from(summaries.values());
  }, [selectedTrainings]);

  const handleDateClick = (date: Date) => {
    const dateKey = formatCalendarDate(date);
    setSelectedDate(trainingDates.includes(dateKey) ? dateKey : null);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 py-8">
      <Modal
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        width="520px"
        contentClassName="px-5 py-6 text-left sm:px-6"
      >
        {selectedDate && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-green-600">
              Workout summary
            </p>
            <h2 className="mt-1 pr-8 text-xl font-bold text-gray-900">
              {formatKoreanDate(selectedDate)} 운동 기록
            </h2>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-gray-100 px-2 py-3">
                <p className="text-lg font-bold text-gray-900">{selectedTrainings.length}</p>
                <p className="mt-1 text-xs text-gray-500">세션</p>
              </div>
              <div className="rounded-lg bg-gray-100 px-2 py-3">
                <p className="text-lg font-bold text-gray-900">{exerciseSummaries.length}</p>
                <p className="mt-1 text-xs text-gray-500">종목</p>
              </div>
              <div className="rounded-lg bg-gray-100 px-2 py-3">
                <p className="text-lg font-bold text-gray-900">
                  {exerciseSummaries.reduce((sum, exercise) => sum + exercise.setCount, 0)}
                </p>
                <p className="mt-1 text-xs text-gray-500">세트</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {exerciseSummaries.map((exercise) => (
                <div
                  key={exercise.name}
                  className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{exercise.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{exercise.setCount}세트</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-gray-700">
                    {exercise.bestWeight > 0
                      ? `최고 ${exercise.bestWeight}${exercise.unit} × ${exercise.reps}회`
                      : `${exercise.reps}회`}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-800"
            >
              닫기
            </button>
          </>
        )}
      </Modal>
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
        {historyError && (
          <p className="mb-3 pl-2 text-sm text-red-600">운동 이력을 불러오지 못했습니다.</p>
        )}
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
