'use client';

import React, { useMemo, useState } from 'react';
import Calendar from 'react-calendar';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface WorkoutCalendarProps {
  /** 트레이닝을 완료한 날짜 배열 (YYYY-MM-DD 형식) */
  trainingDates?: string[];
  /** 날짜 선택 시 호출되는 콜백 */
  onDateClick?: (date: Date) => void;
}

export default function WorkoutCalendar({
  trainingDates = [],
  onDateClick
}: WorkoutCalendarProps) {
  const [value, setValue] = useState<Value>(new Date());

  const trainingDateSet = useMemo(() => new Set(trainingDates), [trainingDates]);

  // UTC 변환으로 날짜가 하루 밀리지 않도록 달력의 로컬 날짜를 사용한다.
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const hasTraining = (date: Date): boolean =>
    trainingDateSet.has(formatDate(date));

  // 오늘 날짜인지 확인
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 각 날짜 타일의 콘텐츠 렌더링
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    // 월 뷰에서만 표시
    if (view !== 'month') return null;

    const isTodayDate = isToday(date);
    const hasTrainingRecord = hasTraining(date);

    if (!isTodayDate && !hasTrainingRecord) return null;

    return (
      <div className="workout-calendar__markers">
        {isTodayDate && (
          <span className="workout-calendar__todayLabel">Today</span>
        )}
        {hasTrainingRecord && (
          <span className="workout-calendar__trainingBadge" aria-label="운동 기록 있음">
            <span aria-hidden="true">●</span> 운동
          </span>
        )}
      </div>
    );
  };

  // 날짜 클릭 핸들러
  const handleDateChange = (value: Value) => {
    setValue(value);
    if (value instanceof Date && onDateClick) {
      onDateClick(value);
    }
  };

  return (
    <div className="workout-calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={value}
        tileContent={tileContent}
        calendarType="gregory"
        formatDay={(locale, date) => date.getDate().toString()}
        className="workout-calendar"
      />
    </div>
  );
}
