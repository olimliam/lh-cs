import { useCallback } from 'react';
import { useStatisticsLogger } from '@/shared/api/hooks/statistics-hooks';
import {
  ConsultationLogActionTypeEnum,
  CreateConsultationLogRequest,
} from '@/shared/api/statistics-types';

/**
 * 상담실 활동 통계 로깅을 위한 전용 hooks
 */
export const useConsultationStatistics = () => {
  const { logConsultationAction, isLoading } = useStatisticsLogger();

  const logAdminEnter = useCallback(
    (consultationId: string, adminId: string) => {
      const logData: CreateConsultationLogRequest = {
        actionType: ConsultationLogActionTypeEnum.ADMIN_ENTER,
        consultationId,
        counselorId: adminId,
      };

      return logConsultationAction(logData);
    },
    [logConsultationAction]
  );

  const logPopupToggle = useCallback(
    (
      consultationId: string,
      counselorId: string,
      markerId: string | undefined,
      _facilityId?: string | undefined
    ) => {
      const logData: CreateConsultationLogRequest = {
        actionType: !markerId
          ? ConsultationLogActionTypeEnum.POP_CLOSE
          : ConsultationLogActionTypeEnum.POP_OPEN,
        consultationId,
        counselorId,
        actionValue: markerId,
      };

      return logConsultationAction(logData);
    },
    [logConsultationAction]
  );

  const logDrawingModeToggle = useCallback(
    (
      consultationId: string,
      counselorId: string,
      sceneId: string,
      isStart: boolean,
      facilityId?: string
    ) => {
      const logData: CreateConsultationLogRequest = {
        actionType: isStart
          ? ConsultationLogActionTypeEnum.DRAWING_MODE_START
          : ConsultationLogActionTypeEnum.DRAWING_MODE_END,
        consultationId,
        counselorId,
        actionValue: sceneId,
        facilityId,
      };

      return logConsultationAction(logData);
    },
    [logConsultationAction]
  );

  return {
    logAdminEnter,
    logPopupToggle,
    logDrawingModeToggle,
    isLoading,
  };
};
