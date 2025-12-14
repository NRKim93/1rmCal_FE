'use client';

import React, { useState } from 'react';
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

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 해당 날짜에 트레이닝 기록이 있는지 확인
  const hasTraining = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return trainingDates.includes(dateStr);
  };

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

    return (
      <>
        {/* 오늘 날짜 라벨 */}
        {isTodayDate && (
          <div className="workout-calendar__todayLabel">Today</div>
        )}
        {/* 트레이닝 완료 표시 */}
        {hasTrainingRecord && (
          <div className="workout-calendar__trainingIndicator">
            <span className="workout-calendar__dot">●</span>
          </div>
        )}
      </>
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
