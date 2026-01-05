# Statistics Feature

통계 수집 API를 위한 React Query hooks 모음입니다.

## 🚨 중요: 백엔드 자동 로깅 vs 프론트엔드 수동 로깅

### 백엔드에서 자동 수집되는 로그 (프론트엔드 호출 불필요)
- ✅ **로그인 로그**: 로그인 시도/성공/실패 자동 수집
- ✅ **상담실 생성**: 상담실 POST API 호출 시 자동 수집
- ✅ **상담사/고객 입장**: WebSocket 연결 시 자동 수집
- ✅ **상담사/고객 퇴장**: WebSocket 연결 해제 시 자동 수집
- ✅ **그리기 모드 변경**: WebSocket 이벤트 수신 시 자동 수집
- ✅ **상담실 종료**: 배치 작업에서 자동 수집

### 프론트엔드에서 수동 호출이 필요한 로그
- 🎯 **관리자 활동**: 사용자 계정 관리 등
- 🎯 **팝업 열기/닫기**: 클라이언트 UI 이벤트
- 🎯 **프리투어 활동**: 씬 이동, 팝업 등
- 🎯 **기타 클라이언트 전용 이벤트**

## 구조

```
features/statistics/
├── api/
│   ├── admin-statistics-hooks.ts      # 관리자 활동 로그
│   ├── consultation-statistics-hooks.ts # 상담실 활동 로그
│   ├── free-tour-statistics-hooks.ts  # 프리투어 활동 로그
│   └── index.ts
├── index.ts
└── README.md
```

## 사용법

### 1. 관리자 활동 로깅

```tsx
import { useAdminStatistics } from '@/features/statistics';

function AdminPanel() {
  const adminStats = useAdminStatistics();

  const handleCreateAccount = async (userData) => {
    // 계정 생성 로직
    const newUser = await createUserAPI(userData);

    // 통계 로그
    adminStats.logAccountCreation(newUser.id, newUser.name);
  };

  const handleRoleChange = async (userId, newRole) => {
    // 역할 변경 로직
    await updateUserRoleAPI(userId, newRole);

    // 통계 로그
    adminStats.logRoleChange(userId, newRole);
  };

  return (
    // UI 컴포넌트
  );
}
```

### 2. 상담실 활동 로깅 (클라이언트 전용 이벤트만)

```tsx
import { useConsultationStatistics } from '@/features/statistics';

function ConsultationRoom() {
  const consultationStats = useConsultationStatistics();

  // ❌ 이런 로그들은 백엔드에서 자동 수집되므로 호출하지 마세요
  // consultationStats.logCounselorEnter() - WebSocket 연결 시 자동
  // consultationStats.logDrawingModeStart() - WebSocket 이벤트 수신 시 자동

  // ✅ 이런 로그들만 프론트엔드에서 직접 호출하세요
  const handleOpenPopup = (consultationId, counselorId, markerId, facilityId) => {
    // 팝업 열기 로그 (클라이언트 UI 이벤트)
    consultationStats.logPopupOpen(consultationId, counselorId, markerId, facilityId);
  };

  const handleClosePopup = (consultationId, counselorId, markerId, facilityId) => {
    // 팝업 닫기 로그 (클라이언트 UI 이벤트)
    consultationStats.logPopupClose(consultationId, counselorId, markerId, facilityId);
  };

  return (
    // UI 컴포넌트
  );
}
```

### 3. 프리투어 활동 로깅

```tsx
import { useFreeTourStatistics } from '@/features/statistics';

function FreeTourViewer() {
  const freeTourStats = useFreeTourStatistics();

  const handleEnterTour = (sessionId, tourId) => {
    // 프리투어 입장 로그
    freeTourStats.logVisitorEnter(sessionId, tourId);
  };

  const handleSceneChange = (sessionId, sceneId, tourId) => {
    // 씬 이동 로그
    freeTourStats.logSceneMove(sessionId, sceneId, tourId);
  };

  return (
    // UI 컴포넌트
  );
}
```

### 4. 통합 사용 (여러 로그 타입을 한 번에 사용)

```tsx
import { useStatisticsLogger } from '@/shared/api/statistics-hooks';
import { AdminLogActionTypeEnum } from '@/shared/api/statistics-types';

function MultiActionComponent() {
  const { logAdminAction, logConsultationAction, isLoading } = useStatisticsLogger();

  const handleComplexAction = async () => {
    // 관리자 액션
    logAdminAction({
      actionType: AdminLogActionTypeEnum.CREATE_ACCOUNT,
      counselorId: 'admin123',
      actionValue: 'newUser@example.com',
    });

    // 상담실 액션
    logConsultationAction({
      actionType: ConsultationLogActionTypeEnum.CONSULTATION_CREATE,
      consultationId: 'room123',
      counselorId: 'counselor456',
    });
  };

  return (
    <button onClick={handleComplexAction} disabled={isLoading}>
      {isLoading ? '처리 중...' : '복합 액션 실행'}
    </button>
  );
}
```

## 주요 특징

### 1. 자동 디바이스 정보 수집
- `device` 필드는 자동으로 `navigator.userAgent` 값으로 설정됩니다.
- IP 주소는 백엔드에서 `req.ip`로 자동 수집됩니다.

### 2. 에러 처리
- 통계 로깅 실패는 사용자 경험을 방해하지 않도록 콘솔 에러만 출력됩니다.
- 메인 비즈니스 로직에 영향을 주지 않습니다.

### 3. TypeScript 지원
- 모든 enum과 interface가 타입 안전하게 정의되어 있습니다.
- IDE에서 자동완성과 타입 검사를 지원합니다.

## API 엔드포인트

모든 통계 로그는 다음 엔드포인트로 전송됩니다:

- `POST /admin/statistics/user-logs` - 관리자 활동 로그
- `POST /admin/statistics/login-logs` - 로그인 활동 로그
- `POST /admin/statistics/consultation-logs` - 상담실 활동 로그
- `POST /admin/statistics/free-tour-logs` - 프리투어 활동 로그

## 로그 레벨

- 성공 로그: `console.log`
- 에러 로그: `console.error`
- 사용자에게는 에러를 노출하지 않음 (UX 보호)