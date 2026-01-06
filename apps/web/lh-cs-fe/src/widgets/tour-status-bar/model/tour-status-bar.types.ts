import { ConsultationStatusEnum } from '@/shared/model/consultation.enum';

export interface TourStatusBarProps {
  // 접속 상태
  connectionStatus?: 'ON' | 'OFF';
  onConnectionToggle?: () => void;

  // 상담 상태
  consultationStatus?: ConsultationStatusEnum;

  // 방문자 연결 상태 표시용
  visitorConnection?: 'connected' | 'disconnected' | 'connecting';
  visitorMessage?: string;

  // UI props
  className?: string;
}

// 상담 상태 enum을 한국어로 변환하는 유틸 함수
export const getConsultationStatusText = (
  status: ConsultationStatusEnum | string
): string => {
  switch (status) {
    case ConsultationStatusEnum.READY:
      return '상담 대기중';
    case ConsultationStatusEnum.CONSULTING:
      return '상담 진행중';
    case ConsultationStatusEnum.END:
      return '상담 종료';
    default:
      return status as string; // 이미 한국어 문자열인 경우 그대로 반환
  }
};
