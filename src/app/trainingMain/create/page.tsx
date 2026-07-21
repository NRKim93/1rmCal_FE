"use client";

import { FormEvent, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { ProgramBuilderSkeleton } from "@/components/common/ui/PageSkeletons";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/Alert/ToastProvider";
import { TrainingCategoryCombobox } from "@/components/training/TrainingCategoryCombobox";
import { useTrainingAutoCompleteQuery } from "@/lib/query/training";
import { CreateTrainingProgramRequest } from "@/lib/types/training";
import { createTrainingProgram } from "@/services/trainingMain.service";

type ExerciseDraft = {
  id: string;
  categorySeq: number;
  oneRmReferenceCategorySeq: number;
  sets: string;
  repsMin: string;
  repsMax: string;
  restSeconds: string;
  weightRate: string;
};
type DayDraft = { id: string; name: string; exercises: ExerciseDraft[] };
type WeekDraft = { id: string; days: DayDraft[] };

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const makeExercise = (id = makeId("exercise")): ExerciseDraft => ({
  id,
  categorySeq: 0,
  oneRmReferenceCategorySeq: 0,
  sets: "5",
  repsMin: "5",
  repsMax: "5",
  restSeconds: "180",
  weightRate: "75",
});

const makeDay = (name = "Workout A", id = makeId("day")): DayDraft => ({
  id,
  name,
  exercises: [makeExercise()],
});

const makeWeek = (id = makeId("week")): WeekDraft => ({
  id,
  days: [makeDay()],
});

const initialWeeks: WeekDraft[] = [
  {
    id: "initial-week",
    days: [
      {
        id: "initial-day",
        name: "Workout A",
        exercises: [makeExercise("initial-exercise")],
      },
    ],
  },
];

function cloneWeek(week: WeekDraft): WeekDraft {
  return {
    id: makeId("week"),
    days: week.days.map((day) => ({
      ...day,
      id: makeId("day"),
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        id: makeId("exercise"),
      })),
    })),
  };
}

function apiErrorMessage(error: unknown) {
  if (!isAxiosError(error)) return "프로그램 등록에 실패했습니다.";
  const body = error.response?.data as
    | { message?: string | string[]; error?: { message?: string | string[] } }
    | undefined;
  const message = body?.message ?? body?.error?.message;
  return Array.isArray(message)
    ? message.join("\n")
    : message ?? "프로그램 등록에 실패했습니다.";
}

function validateNumericDraft({
  value,
  label,
  min,
  max,
  integer = true,
}: {
  value: string;
  label: string;
  min: number;
  max?: number;
  integer?: boolean;
}) {
  if (!value.trim()) return `${label} 값을 입력해 주세요.`;

  const number = Number(value);
  if (!Number.isFinite(number)) return `${label} 값이 올바르지 않습니다.`;
  if (integer && !Number.isInteger(number)) return `${label} 값은 정수여야 합니다.`;
  if (!integer && !/^\d+(\.\d{1,2})?$/.test(value)) {
    return `${label} 값은 소수 둘째 자리까지 입력할 수 있습니다.`;
  }
  if (number < min) return `${label} 값은 ${min} 이상이어야 합니다.`;
  if (max !== undefined && number > max) {
    return `${label} 값은 ${max} 이하여야 합니다.`;
  }

  return null;
}

export default function CreateTrainingProgramPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    data: trainingCategories = [],
    isLoading: loadingCategories,
  } = useTrainingAutoCompleteQuery();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [weeks, setWeeks] = useState(initialWeeks);
  const [collapsedDayIds, setCollapsedDayIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [saving, setSaving] = useState(false);

  const benchPressCategorySeq = useMemo(
    () =>
      trainingCategories.find((category) => category.trainingName === "BENCHPRESS")
        ?.seq ?? 0,
    [trainingCategories],
  );

  const applyTrainingCategory = (
    weekId: string,
    dayId: string,
    exercise: ExerciseDraft,
    category: (typeof trainingCategories)[number] | null,
  ) => {
    const benchBasedRates: Record<string, string> = {
      PECDECFLY: "30",
      DUMBBELLFLY: "12.5",
      INCLINEBENCHPRESS: "70",
      INCLINECHESTPRESS: "50",
      DECLINEBENCHPRESS: "80",
    };
    const suggestedRate = category
      ? benchBasedRates[category.trainingName]
      : undefined;

    patchExercise(weekId, dayId, exercise.id, {
      categorySeq: category?.seq ?? 0,
      oneRmReferenceCategorySeq:
        suggestedRate && benchPressCategorySeq ? benchPressCategorySeq : 0,
      weightRate: suggestedRate ?? exercise.weightRate,
    });
  };

  const counts = useMemo(
    () => ({
      days: weeks.reduce((sum, week) => sum + week.days.length, 0),
      exercises: weeks.reduce(
        (sum, week) =>
          sum + week.days.reduce((daySum, day) => daySum + day.exercises.length, 0),
        0,
      ),
    }),
    [weeks],
  );

  const updateDay = (weekId: string, dayId: string, next: (day: DayDraft) => DayDraft) =>
    setWeeks((current) =>
      current.map((week) =>
        week.id === weekId
          ? { ...week, days: week.days.map((day) => (day.id === dayId ? next(day) : day)) }
          : week,
      ),
    );

  const patchExercise = (
    weekId: string,
    dayId: string,
    exerciseId: string,
    patch: Partial<ExerciseDraft>,
  ) =>
    updateDay(weekId, dayId, (day) => ({
      ...day,
      exercises: day.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, ...patch } : exercise,
      ),
    }));

  const moveExercise = (
    weekId: string,
    dayId: string,
    exerciseIndex: number,
    direction: -1 | 1,
  ) =>
    updateDay(weekId, dayId, (day) => {
      const targetIndex = exerciseIndex + direction;
      if (targetIndex < 0 || targetIndex >= day.exercises.length) return day;

      const exercises = [...day.exercises];
      [exercises[exerciseIndex], exercises[targetIndex]] = [
        exercises[targetIndex],
        exercises[exerciseIndex],
      ];
      return { ...day, exercises };
    });

  const toggleDayCollapsed = (dayId: string) =>
    setCollapsedDayIds((current) => {
      const next = new Set(current);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });

  const toggleWeekCollapsed = (week: WeekDraft) =>
    setCollapsedDayIds((current) => {
      const next = new Set(current);
      const allCollapsed = week.days.every((day) => next.has(day.id));
      week.days.forEach((day) => {
        if (allCollapsed) next.delete(day.id);
        else next.add(day.id);
      });
      return next;
    });

  const collapseAllCurrentDays = () =>
    setCollapsedDayIds((current) => {
      const next = new Set(current);
      weeks.forEach((week) =>
        week.days.forEach((day) => next.add(day.id)),
      );
      return next;
    });

  const addDayToWeek = (week: WeekDraft) => {
    const newDay = makeDay(
      `Workout ${String.fromCharCode(65 + week.days.length)}`,
    );
    collapseAllCurrentDays();
    setWeeks((current) =>
      current.map((item) =>
        item.id === week.id
          ? { ...item, days: [...item.days, newDay] }
          : item,
      ),
    );
  };

  const addWeek = (copyPrevious: boolean) => {
    const newWeek = copyPrevious
      ? cloneWeek(weeks.at(-1) ?? makeWeek())
      : makeWeek();
    collapseAllCurrentDays();
    setWeeks((current) => [...current, newWeek]);
  };

  const validate = () => {
    if (!code.trim() || !name.trim()) return "프로그램 코드와 이름을 입력해 주세요.";

    const versionError = validateNumericDraft({
      value: version,
      label: "버전",
      min: 1,
    });
    if (versionError) return versionError;

    for (const [weekIndex, week] of weeks.entries()) {
      for (const [dayIndex, day] of week.days.entries()) {
        if (!day.name.trim()) return `${weekIndex + 1}주차 ${dayIndex + 1}일차 이름이 필요합니다.`;
        for (const [exerciseIndex, exercise] of day.exercises.entries()) {
          if (!exercise.categorySeq) return `${weekIndex + 1}주차 ${dayIndex + 1}일차 운동을 선택해 주세요.`;

          const context = `${weekIndex + 1}주차 ${dayIndex + 1}일차 운동 ${exerciseIndex + 1}`;
          const numericFields = [
            { value: exercise.sets, label: `${context} 세트`, min: 1 },
            { value: exercise.repsMin, label: `${context} 최소 횟수`, min: 1 },
            { value: exercise.repsMax, label: `${context} 최대 횟수`, min: 1 },
            { value: exercise.restSeconds, label: `${context} 휴식 시간`, min: 0 },
            {
              value: exercise.weightRate,
              label: `${context} 1RM 비율`,
              min: 0,
              max: 100,
              integer: false,
            },
          ];
          for (const field of numericFields) {
            const fieldError = validateNumericDraft(field);
            if (fieldError) return fieldError;
          }

          if (Number(exercise.repsMin) > Number(exercise.repsMax)) {
            return `${context} 최소 횟수는 최대 횟수보다 클 수 없습니다.`;
          }
        }
      }
    }
    return null;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      showToast({ message: error, variant: "warning" });
      return;
    }

    const payload: CreateTrainingProgramRequest = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
      version: Number(version),
      isActive,
      weeks: weeks.map((week, weekIndex) => ({
        weekOrder: weekIndex + 1,
        days: week.days.map((day, dayIndex) => ({
          dayOrder: dayIndex + 1,
          name: day.name.trim(),
          exercises: day.exercises.map((exercise, exerciseIndex) => ({
            trainingCategorySeq: exercise.categorySeq,
            oneRmReferenceCategorySeq:
              exercise.oneRmReferenceCategorySeq || undefined,
            exerciseOrder: exerciseIndex + 1,
            targetSets: Number(exercise.sets),
            targetRepsMin: Number(exercise.repsMin),
            targetRepsMax: Number(exercise.repsMax),
            restSeconds: Number(exercise.restSeconds),
            targetWeightRate: Number(exercise.weightRate),
          })),
        })),
      })),
    };

    setSaving(true);
    try {
      await createTrainingProgram(payload);
      showToast({ message: "트레이닝 프로그램을 등록했습니다.", variant: "success" });
      router.push("/trainingMain");
    } catch (caught) {
      showToast({ message: apiErrorMessage(caught), variant: "error", durationMs: 5000 });
    } finally {
      setSaving(false);
    }
  };

  if (loadingCategories) {
    return <ProgramBuilderSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      <Header
        onBack={() => router.back()}
        left={
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">Program builder</p>
            <h1 className="mt-1 text-lg font-bold">트레이닝 프로그램 생성</h1>
          </div>
        }
      />

      <form onSubmit={submit}>
        <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold">기본 정보</h2>
                <p className="mt-1 text-sm text-slate-500">프로그램을 구분할 이름과 버전입니다.</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> 활성
              </label>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_100px]">
              <Field label="프로그램 코드">
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                  placeholder="STRONG_LIFTS_5X5"
                  className={`${fieldClass} font-mono`}
                />
              </Field>
              <NumericTextInput label="버전" value={version} onChange={setVersion} />
            </div>
            <Field label="프로그램 이름" className="mt-4">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="스트롱리프트 5x5" className={fieldClass} />
            </Field>
            <Field label="설명" className="mt-4">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={fieldClass} placeholder="프로그램 목적과 수행 방법" />
            </Field>
          </section>

          <section className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
            <p className="text-sm text-slate-300">프로그램 구성</p>
            <p className="mt-1 text-lg font-bold">{weeks.length}주 · {counts.days}회차 · {counts.exercises}종목</p>
          </section>

          {weeks.map((week, weekIndex) => (
            <section key={week.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between bg-sky-50 px-5 py-4">
                <h2 className="text-lg font-bold">{weekIndex + 1}주차</h2>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => toggleWeekCollapsed(week)} className="text-sm font-semibold text-sky-700">
                    {week.days.every((day) => collapsedDayIds.has(day.id)) ? "모두 펼치기" : "모두 접기"}
                  </button>
                  <button type="button" disabled={weeks.length === 1} onClick={() => setWeeks((all) => all.filter((item) => item.id !== week.id))} className="text-sm font-semibold text-slate-500 disabled:opacity-30">주차 삭제</button>
                </div>
              </div>
              <div className="space-y-4 p-4 sm:p-5">
                {week.days.map((day, dayIndex) => {
                  const isCollapsed = collapsedDayIds.has(day.id);

                  return (
                    <article key={day.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{dayIndex + 1}</span>
                        <input value={day.name} onChange={(e) => updateDay(week.id, day.id, (item) => ({ ...item, name: e.target.value }))} className={`${fieldClass} min-w-0 flex-1 font-semibold`} />
                        <button
                          type="button"
                          aria-expanded={!isCollapsed}
                          aria-label={`${day.name || `${dayIndex + 1}회차`} ${isCollapsed ? "펼치기" : "접기"}`}
                          onClick={() => toggleDayCollapsed(day.id)}
                          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-sky-700"
                        >
                          <span>{isCollapsed ? `${day.exercises.length}종목 펼치기` : "접기"}</span>
                          <span aria-hidden="true" className={`text-xs transition-transform ${isCollapsed ? "" : "rotate-180"}`}>▼</span>
                        </button>
                        <button type="button" disabled={week.days.length === 1} onClick={() => setWeeks((all) => all.map((item) => item.id === week.id ? { ...item, days: item.days.filter((candidate) => candidate.id !== day.id) } : item))} className="shrink-0 text-sm font-semibold text-slate-400 disabled:opacity-30">삭제</button>
                      </div>

                      {!isCollapsed && (
                        <>
                          <div className="mt-4 space-y-3">
                            {day.exercises.map((exercise, exerciseIndex) => (
                              <div key={exercise.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-bold">운동 {exerciseIndex + 1}</p>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={exerciseIndex === 0}
                                      aria-label={`운동 ${exerciseIndex + 1} 위로 이동`}
                                      title="위로 이동"
                                      onClick={() => moveExercise(week.id, day.id, exerciseIndex, -1)}
                                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-600 enabled:hover:border-sky-300 enabled:hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      disabled={exerciseIndex === day.exercises.length - 1}
                                      aria-label={`운동 ${exerciseIndex + 1} 아래로 이동`}
                                      title="아래로 이동"
                                      onClick={() => moveExercise(week.id, day.id, exerciseIndex, 1)}
                                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-600 enabled:hover:border-sky-300 enabled:hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                      ↓
                                    </button>
                                    <button type="button" disabled={day.exercises.length === 1} onClick={() => updateDay(week.id, day.id, (item) => ({ ...item, exercises: item.exercises.filter((candidate) => candidate.id !== exercise.id) }))} className="ml-1 text-xs font-semibold text-slate-400 disabled:opacity-30">종목 삭제</button>
                                  </div>
                                </div>
                                <Field label="운동 종목" className="mt-3">
                                  <TrainingCategoryCombobox
                                    value={exercise.categorySeq}
                                    disabled={loadingCategories}
                                    onChange={(category) =>
                                      applyTrainingCategory(
                                        week.id,
                                        day.id,
                                        exercise,
                                        category,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label="기준 1RM 종목 (선택)" className="mt-3">
                                  <TrainingCategoryCombobox
                                    value={exercise.oneRmReferenceCategorySeq}
                                    disabled={loadingCategories}
                                    onChange={(category) =>
                                      patchExercise(week.id, day.id, exercise.id, {
                                        oneRmReferenceCategorySeq: category?.seq ?? 0,
                                      })
                                    }
                                  />
                                  <span className="mt-1 block text-xs font-normal text-slate-500">
                                    보조 운동은 선택한 종목의 1RM에 아래 비율을 적용합니다.
                                  </span>
                                </Field>
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                                  <NumericTextInput label="세트" value={exercise.sets} onChange={(value) => patchExercise(week.id, day.id, exercise.id, { sets: value })} />
                                  <NumericTextInput label="최소 횟수" value={exercise.repsMin} onChange={(value) => patchExercise(week.id, day.id, exercise.id, { repsMin: value })} />
                                  <NumericTextInput label="최대 횟수" value={exercise.repsMax} onChange={(value) => patchExercise(week.id, day.id, exercise.id, { repsMax: value })} />
                                  <NumericTextInput label="휴식(초)" value={exercise.restSeconds} onChange={(value) => patchExercise(week.id, day.id, exercise.id, { restSeconds: value })} />
                                  <NumericTextInput label="1RM(%)" value={exercise.weightRate} decimal onChange={(value) => patchExercise(week.id, day.id, exercise.id, { weightRate: value })} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => updateDay(week.id, day.id, (item) => ({ ...item, exercises: [...item.exercises, makeExercise()] }))} className="mt-3 w-full rounded-lg border border-dashed border-sky-300 bg-sky-50 py-2.5 text-sm font-bold text-sky-700">+ 운동 종목 추가</button>
                        </>
                      )}
                    </article>
                  );
                })}
                <button type="button" onClick={() => addDayToWeek(week)} className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600">+ 이 주차에 회차 추가</button>
              </div>
            </section>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" fullWidth onClick={() => addWeek(false)}>빈 주차 추가</Button>
            <Button type="button" variant="outline" fullWidth className="border-sky-200 bg-sky-50 text-sky-800" onClick={() => addWeek(true)}>이전 주차 복사</Button>
          </div>
        </main>

        <footer className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 pb-3 pt-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl gap-3 px-4 sm:px-6">
            <Button type="button" variant="outline" disabled={saving} onClick={() => router.back()}>취소</Button>
            <Button type="submit" fullWidth disabled={saving || loadingCategories} className="bg-sky-600 font-bold enabled:hover:bg-sky-700">{saving ? "등록 중..." : "프로그램 등록"}</Button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block text-sm font-semibold text-slate-700 ${className}`}>{label}<span className="mt-2 block">{children}</span></label>;
}

function NumericTextInput({ label, value, decimal = false, onChange }: { label: string; value: string; decimal?: boolean; onChange: (value: string) => void }) {
  const inputPattern = decimal ? /^\d*(\.\d{0,2})?$/ : /^\d*$/;

  return <Field label={label}><input type="text" inputMode={decimal ? "decimal" : "numeric"} value={value} onChange={(e) => {
    if (inputPattern.test(e.target.value)) onChange(e.target.value);
  }} className={`${fieldClass} text-right tabular-nums`} /></Field>;
}
