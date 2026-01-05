import { useCallback } from 'react';
import { useStatisticsLogger } from '@/shared/api/hooks/statistics-hooks';
import {
  FreeTourLogActionTypeEnum,
  CreateFreeTourLogRequest,
} from '@/shared/api/statistics-types';
import { useClientMetadata } from '@/shared/hooks/use-client-metadata';

/**
 * 자가점검(프리투어) 활동 통계 로깅을 위한 전용 hooks
 */
export const useFreeTourStatistics = () => {
  const { logFreeTourAction, isLoading } = useStatisticsLogger();
  const { device, ipAddress } = useClientMetadata();

  const appendClientMetadata = useCallback(
    (payload: CreateFreeTourLogRequest): CreateFreeTourLogRequest => ({
      ...payload,
      device,
      ipAddress,
    }),
    [device, ipAddress]
  );

  const logVisitorEnter = useCallback(
    (sessionId: string, tourId?: string, facilityId?: string) => {
      const logData: CreateFreeTourLogRequest = appendClientMetadata({
        actionType: FreeTourLogActionTypeEnum.VISITOR_ENTER,
        sessionId,
        tourId,
        facilityId,
      });

      return logFreeTourAction(logData);
    },
    [appendClientMetadata, logFreeTourAction]
  );

  const logVisitorExit = useCallback(
    (sessionId: string, tourId?: string, facilityId?: string) => {
      const logData: CreateFreeTourLogRequest = appendClientMetadata({
        actionType: FreeTourLogActionTypeEnum.VISITOR_EXIT,
        sessionId,
        tourId,
        facilityId,
      });

      return logFreeTourAction(logData);
    },
    [appendClientMetadata, logFreeTourAction]
  );

  const logSceneMove = useCallback(
    (sessionId: string, sceneId: string, tourId?: string) => {
      const logData: CreateFreeTourLogRequest = appendClientMetadata({
        actionType: FreeTourLogActionTypeEnum.MOVE,
        actionValue: sceneId,
        sessionId,
        tourId,
      });

      return logFreeTourAction(logData);
    },
    [appendClientMetadata, logFreeTourAction]
  );

  const logPopupOpen = useCallback(
    (
      sessionId: string,
      markerId: string,
      facilityId?: string,
      tourId?: string
    ) => {
      const logData: CreateFreeTourLogRequest = appendClientMetadata({
        actionType: FreeTourLogActionTypeEnum.POP_OPEN,
        actionValue: markerId,
        sessionId,
        facilityId,
        tourId,
      });

      return logFreeTourAction(logData);
    },
    [appendClientMetadata, logFreeTourAction]
  );

  const logPopupClose = useCallback(
    (
      sessionId: string,
      markerId: string,
      facilityId?: string,
      tourId?: string
    ) => {
      const logData: CreateFreeTourLogRequest = appendClientMetadata({
        actionType: FreeTourLogActionTypeEnum.POP_CLOSE,
        actionValue: markerId,
        sessionId,
        facilityId,
        tourId,
      });

      return logFreeTourAction(logData);
    },
    [appendClientMetadata, logFreeTourAction]
  );

  return {
    logVisitorEnter,
    logVisitorExit,
    logSceneMove,
    logPopupOpen,
    logPopupClose,
    isLoading,
  };
};
