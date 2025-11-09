"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./trainingMain.module.css";
import { getLatestHistory } from "@/services/trainingMain.service";
import { hasLogin } from "@/services/auth.service";

export default function TrainingMainPage() {
  const router = useRouter();

  const [exercises, setExercises] = useState([
    { name: "종목 1", sets: 3, weight: "0kg", topSet: "15 reps" },
    { name: "종목 2", sets: 3, weight: "0kg", topSet: "15 reps" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // 1) 로그인 체크
  useEffect(() => {
    if (!hasLogin()) {
      alert("로그인이 필요합니다.");
      router.push("/");
      return; // 여기서 끝나도 훅 호출 순서는 유지됨
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

        //  null 처리
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

          // training_history를 exercises 형태로 변환
          const mappedExercises = trainingHistory.map((item) => ({
            name: item.name,
            sets: 1, // 각 항목을 1세트로 간주 (필요시 수정)
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userIcon}>유저 아이콘</div>
        <button className={styles.backBtn} onClick={handleBack}>
          뒤로 가기
        </button>
      </header>

      <section className={styles.programSection}>
        <h2>현재 진행중인 프로그램</h2>
        <div className={styles.programCard}>
          <div className={styles.programHeader}>
            <div className={styles.trainingIcon}>트레이닝 아이콘</div>
            <div className={styles.programInfo}>
              <span>트레이닝 명</span>
              <span>N 주차 • M일차</span>
            </div>
          </div>

          <div className={styles.exerciseTable}>
            <div className={styles.tableHeader}>
              <span>Exercise</span>
              <span>sets</span>
              <span>Weight</span>
              <span>Reps</span>
            </div>
            {exercises.map((e, i) => (
              <div key={i} className={styles.tableRow}>
                <span>{e.name}</span>
                <span>{e.sets}</span>
                <span>{e.weight}</span>
                <span>{e.topSet}</span>
              </div>
            ))}
          </div>

          <button className={styles.startTrainingBtn}>트레이닝 시작</button>
        </div>
      </section>

      <section className={styles.freeTrainingSection}>
        <h2>자유 트레이닝</h2>
        <div className={styles.freeTrainingCard}>
          <button className={styles.freeTrainingBtn}>자유 트레이닝 시작</button>
        </div>
      </section>

      <section className={styles.createTrainingSection}>
        <h2>신규 트레이닝 생성</h2>
        <div className={styles.createTrainingCard}>
          <button className={styles.createTrainingBtn}>트레이닝 생성</button>
        </div>
      </section>
    </div>
  );
}
