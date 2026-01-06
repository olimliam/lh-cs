import { useToast } from '@/shared/contexts/toast-context';

export const useToastMessages = () => {
  const { showToast } = useToast();

  return {
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showInfo: (message: string) => showToast(message, 'info'),

    // LNB 메타버스 상담 내역 메뉴 클릭
    showDevelopmentInProgress: () =>
      showToast('현재 개발 진행 중입니다.', 'info'),

    // 상담실 개설 관련
    showSelectHouseType: () => showToast('평형을 선택해 주세요.', 'info'),

    showSelectFacility: () =>
      showToast('유지보수 설비 항목을 선택해 주세요.', 'info'),

    showIsCurrentLocation: () =>
      showToast(`선택된 위치와 현재 위치가 일치합니다.`, 'info'),

    showRoomEndInitiated: () =>
      showToast(
        '상담 종료 요청이 접수되었습니다. 5분 후에 완전히 종료됩니다.',
        'info'
      ),

    // 상담실 입장 관련
    showAlreadyEnteredRoom: () =>
      showToast('이미 입장되어 있는 상담실입니다.', 'error'),

    showMaxRoomExceeded: () =>
      showToast('더 이상 상담실을 개설할 수 없습니다.', 'error'),

    // 성공 메시지
    showRoomCreated: () => showToast('상담실이 만들어졌습니다.', 'success'),

    showInfoCopied: () => showToast('입장 정보가 복사되었습니다.', 'success'),

    showCameraAngleSaved: () =>
      showToast('카메라 각도 수정이 완료되었습니다.', 'success'),

    // 입력 검증 메시지
    showOnlyEnglishOrNumberAllowed: () =>
      showToast('영 대/소문자 또는 숫자를 입력해주세요.', 'error'),

    // 상담실 생성 검증 메시지
    showConsultationCodeRequired: () =>
      showToast('상담 코드를 입력해 주세요.', 'error'),

    showSelectHouseTypeRequired: () =>
      showToast('평형을 선택해 주세요.', 'error'),

    showSelectFacilityRequired: () =>
      showToast('유지보수 설비를 선택해 주세요.', 'error'),

    showConsultationCreateFailed: () =>
      showToast('상담실 개설에 실패했습니다. 다시 시도해 주세요.', 'error'),

    showConsultationCreateError: () =>
      showToast('상담실 개설 중 오류가 발생했습니다.', 'error'),

    showConsultationEndError: () =>
      showToast('상담실 종료 중 오류가 발생했습니다.', 'error'),

    // 상담실 입장 불가 관련
    showCannotEnterRoom: (message?: string) =>
      showToast(
        `상담실 입장이 불가합니다.\n${message || '이미 다른 관리자가 상담중입니다.'}`,
        'error'
      ),

    // 인증 실패 관련
    showAuthFailed: (message?: string) =>
      showToast(message || '인증에 실패했습니다. 다시 시도해 주세요.', 'error'),

    showCameraAngleSaveFailed: () =>
      showToast('카메라 각도 수정에 실패했습니다.', 'error'),

    // 화면 공유 관련
    showScreenShareFailed: (errorMessage?: string) =>
      showToast(
        `화면 공유 실패: ${errorMessage || '알 수 없는 오류가 발생했습니다.'}`,
        'error'
      ),
  };
};
