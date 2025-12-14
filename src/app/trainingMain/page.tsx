"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLatestHistory } from "@/services/trainingMain.service";
import { hasLogin } from "@/services/auth.service";
import { Exercise } from "@/lib/types";
import { Header } from "@/components/common/Header";
import ProgramCard from "./(components)/ProgramCard/ProgramCard";
import TrainingSection from "./(components)/TrainingSection/TrainingSection";

export default function TrainingMainPage() {
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "종목 1", sets: 3, weight: "0kg", topSet: "15 reps" },
    { name: "종목 2", sets: 3, weight: "0kg", topSet: "15 reps" },
  ]);
  const [trainingDate, setTrainingDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // 1) 로그인 체크
  useEffect(() => {
    if (!hasLogin()) {
      alert("로그인이 필요합니다.");
      router.push("/");
      return;
    }
    setIsLoading(false);
  }, [router]);

  // 2) 최신 기록 가져오기 (로딩 끝난 뒤만 실행)
  useEffect(() => {
    if (isLoading) return;

    const fetchLatestHistory = async () => {
      try {
        const seqStr = localStorage.getItem('seq');
        console.log("현재 유저 : " + seqStr);

        if(!seqStr) {
          console.error('대상 유저 없음.');
          return;
        }

        const seq = Number(seqStr);
        const response = await getLatestHistory(seq);

        // 응답 데이터 확인 및 매핑
        if (response?.data?.data && response.data.data.length > 0) {
          const latestTraining = response.data.data[0];
          const trainingHistory = latestTraining.training_history;

          // training_date 저장
          if (latestTraining.training_date) {
            setTrainingDate(latestTraining.training_date);
          }

          // training_history를 exercises 형태로 변환
          const mappedExercises = trainingHistory.map((item) => ({
            name: item.name,
            sets: 1,
            weight: `${item.weight}${item.weight_unit}`,
            topSet: `${item.reps} reps`
          }));

          setExercises(mappedExercises);
        }
      } catch (error) {
        console.error("운동 기록을 불러오는데 실패했습니다:", error);
      }
    };

    fetchLatestHistory();
  }, [isLoading]);

  const handleBack = () => router.back();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header onBack={handleBack} />

      <section className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">현재 진행중인 프로그램</h2>
        <ProgramCard exercises={exercises} trainingDate={trainingDate} />
      </section>

      <TrainingSection
        title="자유 트레이닝"
        buttonText="자유 트레이닝 시작"
      />

      <TrainingSection
        title="신규 트레이닝 생성"
        buttonText="트레이닝 생성"
      />
    </div>
  );
}
