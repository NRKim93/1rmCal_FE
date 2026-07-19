"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getLatestHistory } from "@/services/trainingMain.service";
import { hasLogin } from "@/services/auth.service";
import { Exercise, TrainingData, TrainingHistoryItem } from "@/lib/types";
import { parseSeq } from "@/lib/utils/seq";
import { Header } from "@/components/common/Header";
import ProgramCard from "./(components)/ProgramCard/ProgramCard";
import TrainingSection from "./(components)/TrainingSection/TrainingSection";

interface TrainingSlide {
  seq: number;
  trainingDate: string;
  trainingHistory: TrainingHistoryItem[];
  exercises: Exercise[];
}

const fallbackSlide: TrainingSlide = {
  seq: 0,
  trainingDate: "",
  trainingHistory: [],
  exercises: [
    { name: "종목 1", sets: 3, weight: "0kg", topSet: "15 reps" },
    { name: "종목 2", sets: 3, weight: "0kg", topSet: "15 reps" },
  ],
};

export default function TrainingMainPage() {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);

  const [trainingSlides, setTrainingSlides] = useState<TrainingSlide[]>([fallbackSlide]);
  const [activeSlide, setActiveSlide] = useState(0);
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

        if(!seqStr) {
          console.error('대상 유저 없음.');
          return;
        }

        const seq = parseSeq(seqStr);
        if (seq === null) {
          console.error("invalid seq in localStorage");
          return;
        }
        const response = await getLatestHistory(seq);

        // 응답 데이터 확인 및 매핑
        if (response?.data?.data && response.data.data.length > 0) {
          const slides = response.data.data.slice(0, 5).map((training: TrainingData) => ({
            seq: training.seq,
            trainingDate: training.training_date,
            trainingHistory: training.training_history,
            exercises: training.training_history.map((item) => ({
              name: item.name,
              sets: 1,
              weight: `${item.weight}${item.weight_unit}`,
              topSet: `${item.reps} reps`,
            })),
          }));

          setTrainingSlides(slides);
          setActiveSlide(0);
        }
      } catch (error) {
        console.error("운동 기록을 불러오는데 실패했습니다:", error);
      }
    };

    fetchLatestHistory();
  }, [isLoading]);

  const handleBack = () => router.back();

  const handleStartTraining = (slide: TrainingSlide) => {
    sessionStorage.setItem(
      "latestTrainingHistory",
      JSON.stringify(slide.trainingHistory),
    );
    router.push("/trainingMain/free?mode=program");
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;

    const swipeDistance = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(swipeDistance) < 50) return;
    setActiveSlide((current) =>
      Math.min(
        Math.max(current + (swipeDistance < 0 ? 1 : -1), 0),
        trainingSlides.length - 1,
      ),
    );
  };

  const getTrainingName = (slide: TrainingSlide, index: number) => {
    if (!slide.trainingDate) return `트레이닝 ${index + 1}`;

    const date = new Date(slide.trainingDate);
    if (Number.isNaN(date.getTime())) return `트레이닝 ${index + 1}`;

    return `${date.getMonth() + 1}월 ${date.getDate()}일 트레이닝`;
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header onBack={handleBack} />

      <section className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">현재 진행중인 프로그램</h2>

        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex items-start transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {trainingSlides.map((slide, index) => (
              <div
                key={slide.seq || `fallback-${index}`}
                className="w-full shrink-0"
                aria-hidden={activeSlide !== index}
              >
                <ProgramCard
                  trainingName={getTrainingName(slide, index)}
                  exercises={slide.exercises}
                  trainingDate={slide.trainingDate}
                  onStartTraining={() => handleStartTraining(slide)}
                />
              </div>
            ))}
          </div>
        </div>

        {trainingSlides.length > 1 && (
          <div className="mt-4 flex justify-center gap-2" aria-label="트레이닝 카드 위치">
            {trainingSlides.map((slide, index) => (
              <button
                key={slide.seq || `indicator-${index}`}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`${index + 1}번째 트레이닝 보기`}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  activeSlide === index ? "bg-gray-800" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </section>

      <TrainingSection
        title="자유 트레이닝"
        buttonText="자유 트레이닝 시작"
        onButtonClick={() => router.push("/trainingMain/free?mode=free")}
      />

      <TrainingSection
        title="신규 트레이닝 생성"
        buttonText="트레이닝 생성"
      />
    </div>
  );
}
