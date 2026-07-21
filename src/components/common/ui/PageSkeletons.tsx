import Skeleton from "./Skeleton";

function LoadingRegion({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-label={label} aria-busy="true" className={className}>
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function RoutePageSkeleton() {
  return (
    <LoadingRegion label="페이지를 불러오는 중" className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <main className="mx-auto max-w-3xl space-y-5 px-5 py-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-44 w-full" rounded="lg" />
        <Skeleton className="h-28 w-full" rounded="lg" />
        <Skeleton className="h-12 w-full" rounded="lg" />
      </main>
    </LoadingRegion>
  );
}

export function DashboardSkeleton() {
  return (
    <LoadingRegion label="대시보드를 불러오는 중" className="flex min-h-screen flex-col items-center bg-gray-50 py-8">
      <div className="mb-6 flex w-[90%] items-center justify-between">
        <Skeleton className="h-12 w-12" rounded="full" />
        <div className="flex gap-2.5">
          <Skeleton className="h-12 w-20" rounded="lg" />
          <Skeleton className="h-12 w-20" rounded="lg" />
        </div>
      </div>
      <section className="mb-6 w-[90%] rounded-lg border-2 border-gray-200 bg-white p-4">
        <Skeleton className="h-6 w-32" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 rounded-md bg-gray-100 p-3">
              <Skeleton className="h-14 w-14 shrink-0" rounded="lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48 max-w-full" />
                <Skeleton className="h-3 w-40 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-6 w-[90%]">
        <Skeleton className="mb-4 ml-2 h-6 w-44" />
        <Skeleton className="h-[430px] w-full" rounded="lg" />
      </section>
      <div className="mt-6 grid w-[90%] grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}
      </div>
    </LoadingRegion>
  );
}

export function TrainingMainSkeleton() {
  return (
    <LoadingRegion label="트레이닝 프로그램을 불러오는 중" className="min-h-screen bg-gray-100">
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-7 p-5">
        <section>
          <Skeleton className="mb-4 h-6 w-52" />
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="mt-3 h-4 w-1/2" />
            <Skeleton className="mt-5 h-24 w-full" rounded="lg" />
            <Skeleton className="mt-5 h-12 w-full" rounded="lg" />
          </div>
        </section>
        {Array.from({ length: 2 }).map((_, index) => (
          <section key={index} className="rounded-2xl bg-white p-5 shadow-sm">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-4 h-12 w-full" rounded="lg" />
          </section>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function FreeTrainingSkeleton() {
  return (
    <LoadingRegion label="운동 기록을 불러오는 중" className="min-h-screen bg-slate-100">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" rounded="full" />
          <Skeleton className="h-10 w-28" rounded="lg" />
        </div>
        <Skeleton className="h-9 w-20" rounded="lg" />
      </div>
      <main className="mx-auto w-full max-w-[560px] px-5 pb-28 pt-5">
        <Skeleton className="mb-5 h-6 w-40" />
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="mb-5 rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-8 w-8" rounded="full" />
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((__, cell) => <Skeleton key={cell} className="h-9 w-full" />)}
            </div>
          </div>
        ))}
        <Skeleton className="h-20 w-full" rounded="lg" />
      </main>
    </LoadingRegion>
  );
}

export function ProgramBuilderSkeleton() {
  return (
    <LoadingRegion label="프로그램 생성 화면을 불러오는 중" className="min-h-screen bg-slate-50 pb-28">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Skeleton className="h-10 w-16" />
          <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-5 w-48" /></div>
        </div>
      </div>
      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6">
        <Skeleton className="h-64 w-full" rounded="lg" />
        <Skeleton className="h-20 w-full" rounded="lg" />
        <Skeleton className="h-72 w-full" rounded="lg" />
      </main>
    </LoadingRegion>
  );
}

export function AuthCardSkeleton({ label = "인증 정보를 처리하는 중" }: { label?: string }) {
  return (
    <LoadingRegion label={label} className="mx-auto my-16 max-w-[400px] rounded-lg border border-gray-200 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-6 h-11 w-full" />
      <Skeleton className="mt-3 h-11 w-full" />
    </LoadingRegion>
  );
}
