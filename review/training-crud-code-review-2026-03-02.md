# 트레이닝 기록 CRUD 코드리뷰 (2026-03-02)

## 1) 결론 요약
- 현재 구현은 **조회(Read) + 화면 내 임시 편집(Create/Update/Delete 일부)** 까지 완료된 상태입니다.
- **서버 영속화 기준 CRUD는 미완성**입니다. 트레이닝 기록의 생성/수정/삭제 API 호출이 없습니다.
- 따라서 사용자는 화면에서 기록을 작성/수정/삭제해도, 페이지 이탈 시 데이터가 저장되지 않습니다.

## 2) 심각도별 주요 발견사항

### [High] 저장(완료) 동작이 실제 저장이 아니라 단순 뒤로가기
- 근거: `src/app/trainingMain/free/page.tsx:681`
- 내용: `finish` 버튼 클릭 시 `router.back()`만 수행합니다.
- 영향: 사용자가 입력한 당일 기록이 서버에 저장되지 않고 유실됩니다.
- 대응 요청 : finish 버튼에 api 호출 연동은 백엔드 파트 개발 후 연동 예정. 백단 설정 후 진행

### [High] 트레이닝 취소 버튼이 UI만 있고 동작이 연결되지 않음
- 근거: `src/app/trainingMain/free/page.tsx:750`
- 내용: `금일 트레이닝 취소` 버튼에 `onClick`이 없습니다.
- 영향: 취소 기능이 요구사항상 존재하는 것처럼 보이지만 실제로는 동작하지 않습니다.
- 대응 요청 : 금일 트레이닝 취소 >> confirm 알람 표시 >> 유저가 ture 입력 >> router.back() 형식으로 대응 

### [High] 트레이닝 서비스에 C/U/D API 래퍼 자체가 없음
- 근거: `src/services/trainingMain.service.ts:4`, `src/services/trainingMain.service.ts:12`
- 내용: `getLatestHistory`, `getAutoComplete` 두 개의 `GET`만 존재합니다.
- 영향: 화면 로직에서 작성/수정/삭제를 구현해도 서버 반영 루트가 없습니다.
- 예정: 아직 트레이닝 기록을 저장하는 api를 백단에 만들지 않았음. 1번과 마찬가지로 백단 개발 후 연동 예정

### [Medium] Set 단위 삭제 기능 부재로 D(Delete) 범위가 불완전
- 근거: `src/app/trainingMain/free/(components)/TrainingExerciseCard/TrainingExerciseCard.tsx:12`
- 근거: `src/app/trainingMain/free/(components)/TrainingExerciseCard/TrainingExerciseCard.tsx:73`
- 근거: `src/app/trainingMain/free/(components)/SetTable/SetTable.tsx:8`
- 내용: 종목 삭제는 가능하지만 Set은 추가/수정/완료 토글만 있고 개별 삭제가 없습니다.
- 영향: 입력 실수 정정 UX가 제한되고, CRUD 중 Delete가 Set 레벨에서 빠져 있습니다.
- 문의: 세트 단위로 삭제는 필요 할 수 있겠다. 이거는 좀 더 이야기 해보자. 

### [Medium] `seq` 파싱 검증 부재 (`NaN` 가능)
- 근거: `src/app/trainingMain/free/page.tsx:303`, `src/app/trainingMain/free/page.tsx:305`
- 근거: `src/app/trainingMain/page.tsx:37`, `src/app/trainingMain/page.tsx:44`
- 내용: `localStorage`의 `seq`를 `Number()`로 변환만 하고 유효성 검사를 하지 않습니다.
- 영향: 저장값이 비정상일 때 `getLatestHistory(NaN)` 호출 가능성이 있습니다.
- 확인 요청 : seq의 경우 로그인 유저 id를 넣어둔것. 실제로 백단과 통신할 때 해당 유저가 실제 존재 하는지, 이 유저의 리프레시 토큰이 redis에 남아 있는지, accessToken이 아직 유효한지 등을 보려 하는 목적 

### [Medium] 반복수(reps) 입력 검증이 약해 도메인상 비정상값 허용 가능
- 근거: `src/app/trainingMain/free/page.tsx:576`
- 내용: `changeReps`는 숫자 변환만 수행하여 음수/소수 등 비정상 반복수 입력을 막지 않습니다.
- 영향: 기록 정합성이 깨질 수 있습니다.
- 확인 요청 : `src\app\trainingMain\free\(components)\SetTable\SetTable.tsx`의 99번째 라인 확인해 보면, 실제로 input 탭은 numeric만 입력 가능하게 되어있음. 이 numeric 값을 단지 String으로 해서 상위 컴포넌트에 던저주고 있기 때문에 영향은 없을것으로 보임 

## 3) CRUD 완성도 점검

### Create
- 상태: **부분 완료(로컬 상태 한정)**
- 근거: `src/app/trainingMain/free/page.tsx:320`, `src/app/trainingMain/free/page.tsx:346`
- 설명: 종목 추가, Set 추가는 가능하지만 서버 저장 호출이 없습니다.
- 예정: 백단 개발 후 연동 예정. 

### Read
- 상태: **완료(최신 기록 조회)**
- 근거: `src/services/trainingMain.service.ts:4`
- 근거: `src/app/trainingMain/page.tsx:45`
- 근거: `src/app/trainingMain/free/page.tsx:306`
- 설명: 최신 기록 조회 후 화면 표시/이전 기록 참조는 동작합니다.
- 예정: 백단 개발 후 연동 예정. 

### Update
- 상태: **부분 완료(로컬 상태 한정)**
- 근거: `src/app/trainingMain/free/page.tsx:545`
- 근거: `src/app/trainingMain/free/page.tsx:564`
- 근거: `src/app/trainingMain/free/page.tsx:576`
- 설명: 무게/단위/횟수/완료 상태 수정은 되지만 서버 반영이 없습니다.
- 예정: 백단 개발 후 연동 예정. 

### Delete
- 상태: **부분 완료**
- 근거: `src/app/trainingMain/free/page.tsx:410`
- 설명: 종목 삭제는 가능하나, Set 삭제 및 서버 삭제는 없습니다.
- 예정: 백단 개발 후 연동 예정. 

## 4) 로직 관점 추가 코멘트
- 현재 구조는 "운동 중 편집 UI"는 잘 갖춰져 있지만, 기록 저장 트랜잭션이 비어 있어 실제 서비스 기능으로는 완결되지 않았습니다.
- `trainingMain/page.tsx`는 최신 기록을 요약 표시하는 Read 화면 성격으로 보이며(`src/app/trainingMain/page.tsx:58`), CRUD의 C/U/D는 사실상 `free/page.tsx`에 집중되어 있습니다.

## 5) 검증 메모
- 정적 검증 시도: `npm run lint`
- 결과: 실행 실패 (`Invalid project directory ...\\lint`)
- 비고: 본 리뷰는 코드 정적 읽기 기준이며, 린트/테스트 파이프라인 정상화 후 재검증이 필요합니다.
