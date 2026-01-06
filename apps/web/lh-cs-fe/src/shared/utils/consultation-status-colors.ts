import { ConsultationStatusEnum } from '@/shared/model/consultation.enum';

/**
 * 상담 상태에 따른 색상을 반환하는 유틸리티 함수
 * @param status - 상담 상태
 * @returns 해당 상태의 색상 코드
 */
export const getConsultationStatusColor = (
  status: ConsultationStatusEnum
): string => {
  switch (status) {
    case ConsultationStatusEnum.CONSULTING:
      return '#0055a2';
    case ConsultationStatusEnum.READY:
      return '#90c31f';
    case ConsultationStatusEnum.END:
      return '#ce2e36';
    default:
      return '#90c31f';
  }
};

/**
 * 상담 상태에 따른 배경색 투명도가 적용된 색상을 반환하는 유틸리티 함수
 * @param status - 상담 상태
 * @returns 해당 상태의 배경색 (투명도 적용)
 */
export const getConsultationStatusBackgroundColor = (
  status: ConsultationStatusEnum
): string => {
  switch (status) {
    case ConsultationStatusEnum.CONSULTING:
      return 'rgba(0, 85, 162, 0.1)';
    case ConsultationStatusEnum.READY:
      return 'rgba(144, 195, 31, 0.1)';
    case ConsultationStatusEnum.END:
      return 'rgba(211, 47, 47, 0.1)';
    default:
      return 'rgba(144, 195, 31, 0.1)';
  }
};

/**
 * 상담 상태에 따른 텍스트 색상을 반환하는 유틸리티 함수
 * @param status - 상담 상태
 * @returns 해당 상태의 텍스트 색상
 */
export const getConsultationStatusTextColor = (
  status: ConsultationStatusEnum
): string => {
  switch (status) {
    case ConsultationStatusEnum.CONSULTING:
      return '#0055a2';
    case ConsultationStatusEnum.READY:
      return '#5b771e';
    case ConsultationStatusEnum.END:
      return '#d32f2f';
    default:
      return '#5b771e';
  }
};
