import { useCallback } from 'react';
import { useStatisticsLogger } from '@/shared/api/hooks/statistics-hooks';
import {
  AdminLogActionTypeEnum,
  CreateAdminLogRequest,
} from '@/shared/api/statistics-types';

/**
 * 관리자 활동 통계 로깅을 위한 전용 hooks
 */
export const useAdminStatistics = () => {
  const { logAdminAction, isLoading } = useStatisticsLogger();

  const logAccountCreation = useCallback(
    (counselorId: string, userName?: string) => {
      const logData: CreateAdminLogRequest = {
        actionType: AdminLogActionTypeEnum.CREATE_ACCOUNT,
        actionValue: userName,
        counselorId,
      };

      return logAdminAction(logData);
    },
    [logAdminAction]
  );

  const logNameChange = useCallback(
    (counselorId: string, newName: string) => {
      const logData: CreateAdminLogRequest = {
        actionType: AdminLogActionTypeEnum.CHANGE_NAME,
        actionValue: newName,
        counselorId,
      };

      return logAdminAction(logData);
    },
    [logAdminAction]
  );

  const logDepartmentChange = useCallback(
    (counselorId: string, newDepartment: string) => {
      const logData: CreateAdminLogRequest = {
        actionType: AdminLogActionTypeEnum.CHANGE_DEPARTMENT,
        actionValue: newDepartment,
        counselorId,
      };

      return logAdminAction(logData);
    },
    [logAdminAction]
  );

  const logPhotoChange = useCallback(
    (counselorId: string, photoUrl?: string) => {
      const logData: CreateAdminLogRequest = {
        actionType: AdminLogActionTypeEnum.CHANGE_PHOTO,
        actionValue: photoUrl,
        counselorId,
      };

      return logAdminAction(logData);
    },
    [logAdminAction]
  );

  const logRoleChange = useCallback(
    (counselorId: string, newRole: string) => {
      const logData: CreateAdminLogRequest = {
        actionType: AdminLogActionTypeEnum.CHANGE_ROLE,
        actionValue: newRole,
        counselorId,
      };

      return logAdminAction(logData);
    },
    [logAdminAction]
  );

  const logPasswordChange = useCallback(
    (counselorId: string) => {
      const logData: CreateAdminLogRequest = {
        actionType: AdminLogActionTypeEnum.CHANGE_PASSWORD,
        counselorId,
      };

      return logAdminAction(logData);
    },
    [logAdminAction]
  );

  const logStatusChange = useCallback(
    (counselorId: string, newStatus: string) => {
      const logData: CreateAdminLogRequest = {
        actionType: AdminLogActionTypeEnum.CHANGE_STATUS,
        actionValue: newStatus,
        counselorId,
      };

      return logAdminAction(logData);
    },
    [logAdminAction]
  );

  return {
    logAccountCreation,
    logNameChange,
    logDepartmentChange,
    logPhotoChange,
    logRoleChange,
    logPasswordChange,
    logStatusChange,
    isLoading,
  };
};
