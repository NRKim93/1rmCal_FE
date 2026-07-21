"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getActiveTrainingPrograms,
  startTrainingProgram,
} from "@/services/trainingMain.service";
import { hasLogin } from "@/services/auth.service";
import { Exercise } from "@/lib/types";
import {
  ProgramTrainingSessionResponse,
  TrainingProgramResponse,
} from "@/lib/types/training";
import { parseSeq } from "@/lib/utils/seq";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { TrainingMainSkeleton } from "@/components/common/ui/PageSkeletons";
import ProgramCard from "./(components)/ProgramCard/ProgramCard";
import TrainingSection from "./(components)/TrainingSection/TrainingSection";

interface TrainingSlide {
  seq: number;
  trainingName: string;
  subtitle: string;
  description: string | null;
  exercises: Exercise[];
  progress: NonNullable<TrainingProgramResponse["progress"]>;
}

function toTrainingSlide(program: TrainingProgramResponse): TrainingSlide {
  const firstWeek = program.weeks[0];
  const firstDay = firstWeek?.days[0];
  const totalDays = program.weeks.reduce(
    (sum, week) => sum + week.days.length,
    0,
  );
  const progress: NonNullable<TrainingProgramResponse["progress"]> =
    program.progress ?? {
      userProgramSeq: null,
      status: "NOT_STARTED",
      completedSessions: 0,
      totalSessions: totalDays,
      percentage: 0,
      currentWeek: firstWeek?.weekOrder ?? 1,
      currentDay: firstDay?.dayOrder ?? 1,
    };
  const currentWeek =
    program.weeks.find(
      (week) => week.weekOrder === progress.currentWeek,
    ) ?? firstWeek;
  const currentDay =
    currentWeek?.days.find(
      (day) => day.dayOrder === progress.currentDay,
    ) ?? firstDay;

  return {
    seq: program.seq,
    trainingName: `${program.name} v${program.version}`,
    subtitle: currentWeek && currentDay
      ? `${currentWeek.weekOrder}주차 ${currentDay.dayOrder}회차 (${currentDay.name}) · ${progress.completedSessions}/${progress.totalSessions}회 완료`
      : `${program.weeks.length}주 · ${totalDays}회차 구성`,
    description: program.description,
    exercises: (currentDay?.exercises ?? []).map((exercise) => ({
      name: exercise.trainingDisplayName || exercise.trainingName,
      sets: exercise.targetSets,
      weight: exercise.targetWeightRate === null
        ? "-"
        : exercise.oneRmReferenceTrainingDisplayName
          ? `${exercise.oneRmReferenceTrainingDisplayName} 1RM의 ${exercise.targetWeightRate}%`
          : `${exercise.targetWeightRate}% 1RM`,
      topSet: exercise.targetRepsMin === exercise.targetRepsMax
        ? `${exercise.targetRepsMin} reps`
        : `${exercise.targetRepsMin}-${exercise.targetRepsMax} reps`,
    })),
    progress,
  };
}

export default function TrainingMainPage() {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);

  const [trainingSlides, setTrainingSlides] = useState<TrainingSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [startingProgramSeq, setStartingProgramSeq] = useState<number | null>(null);
  const [pendingSession, setPendingSession] =
    useState<ProgramTrainingSessionResponse | null>(null);

  useEffect(() => {
    if (!hasLogin()) {
      alert("로그인이 필요합니다.");
      router.push("/");
      return;
    }

    let cancelled = false;
    const fetchPrograms = async () => {
      try {
        const userSeq = parseSeq(localStorage.getItem("seq"));
        const programs = await getActiveTrainingPrograms(userSeq ?? undefined);
        if (cancelled) return;
        setTrainingSlides(programs.map(toTrainingSlide));
        setActiveSlide(0);
      } catch (error) {
        console.error("트레이닝 프로그램을 불러오는데 실패했습니다:", error);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPrograms();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleBack = () => router.back();

  const handleStartTraining = async (programSeq: number) => {
    const userSeq = parseSeq(localStorage.getItem("seq"));
    if (userSeq === null) {
      window.alert("로그인이 필요합니다.");
      return;
    }

    setStartingProgramSeq(programSeq);
    try {
      const session = await startTrainingProgram(programSeq, userSeq);
      const oneRmExercises = session.exercises.filter(
        (exercise) => exercise.oneRmSupported,
      );
      if (oneRmExercises.length === 0) {
        startProgramSession(session, false);
      } else {
        setPendingSession(session);
      }
    } catch (error) {
      console.error("프로그램 시작에 실패했습니다:", error);
      window.alert("프로그램을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setStartingProgramSeq(null);
    }
  };

  const startProgramSession = (
    session: ProgramTrainingSessionResponse,
    useOneRmEstimates: boolean,
  ) => {
    sessionStorage.setItem(
      "programTrainingSession",
      JSON.stringify({ ...session, useOneRmEstimates }),
    );
    setPendingSession(null);
    router.push("/trainingMain/free?mode=program");
  };

  const availableOneRmExercises = pendingSession?.exercises.filter(
    (exercise) =>
      exercise.oneRmSupported && typeof exercise.estimatedWeight === "number",
  ) ?? [];
  const missingOneRmExercises = pendingSession?.exercises.filter(
    (exercise) =>
      exercise.oneRmSupported && typeof exercise.oneRmWeight !== "number",
  ) ?? [];

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

  if (isLoading) {
    return <TrainingMainSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header onBack={handleBack} />

      <Modal
        isOpen={pendingSession !== null}
        onClose={() => setPendingSession(null)}
        width="520px"
        contentClassName="px-6 py-7 text-left"
      >
        {pendingSession && (
          <>
            <h2 className="text-lg font-bold text-slate-900">1RM 기준 목표 중량</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              저장된 1RM으로 이번 회차의 목표 중량을 추정할 수 있습니다.
            </p>

            <div className="mt-5 space-y-2">
              {pendingSession.exercises
                .filter((exercise) => exercise.oneRmSupported)
                .map((exercise) => (
                  <div key={exercise.trainingCategorySeq} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="font-semibold text-slate-800">{exercise.trainingDisplayName}</p>
                    {typeof exercise.oneRmWeight === "number" ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {exercise.oneRmReferenceTrainingDisplayName ?? exercise.trainingDisplayName} 1RM {exercise.oneRmWeight}{exercise.oneRmUnit}
                        {" · "}적용 비율 {exercise.targetWeightRate}% → <strong>{exercise.estimatedWeight}{exercise.oneRmUnit}</strong>
                        {exercise.estimatedWeightNote && ` (${exercise.estimatedWeightNote})`}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-amber-700">신뢰 가능한 1RM 기록이 없습니다.</p>
                    )}
                  </div>
                ))}
            </div>

            <div className="mt-6 grid gap-2">
              {availableOneRmExercises.length > 0 && (
                <Button fullWidth onClick={() => startProgramSession(pendingSession, true)}>
                  가능한 기록을 적용하고 시작
                </Button>
              )}
              <Button variant="outline" fullWidth onClick={() => startProgramSession(pendingSession, false)}>
                직접 중량을 입력하며 시작
              </Button>
              {missingOneRmExercises.length > 0 && (
                <Button variant="outline" fullWidth onClick={() => router.push("/1rm")}>
                  1RM 측정하러 가기
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>

      <section className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">등록된 트레이닝 프로그램</h2>

        {loadError ? (
          <div className="rounded-lg bg-white p-6 text-center text-sm text-red-600 shadow-sm">
            프로그램을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        ) : trainingSlides.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            현재 등록된 활성 프로그램이 없습니다.
          </div>
        ) : (
          <>
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
                    key={slide.seq}
                    className="w-full shrink-0"
                    aria-hidden={activeSlide !== index}
                  >
                    <ProgramCard
                      trainingName={slide.trainingName}
                      subtitle={slide.subtitle}
                      description={slide.description}
                      exercises={slide.exercises}
                      progress={slide.progress}
                      onStartTraining={() => handleStartTraining(slide.seq)}
                      actionLabel={startingProgramSeq === slide.seq ? "시작 중..." : "트레이닝 시작"}
                      actionDisabled={startingProgramSeq !== null}
                    />
                  </div>
                ))}
              </div>
            </div>

            {trainingSlides.length > 1 && (
              <div className="mt-4 flex justify-center gap-2" aria-label="트레이닝 카드 위치">
                {trainingSlides.map((slide, index) => (
                  <button
                    key={slide.seq}
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
          </>
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
        onButtonClick={() => router.push("/trainingMain/create")}
      />
    </div>
  );
}
