import { api } from './api-client';
import { publicApi } from './public-api-client';
import {
  CreateAdminLogRequest,
  // CreateLoginLogRequest,
  CreateConsultationLogRequest,
  CreateFreeTourLogRequest,
  CreateLogResponse,
} from './statistics-types';

export const statisticsApi = {
  /**
   * 관리자 활동 로그 생성
   */
  createAdminLog: async (
    request: CreateAdminLogRequest
  ): Promise<CreateLogResponse> => {
    const response = await api.post('/statistics/user-logs', request);
    return response.data;
  },

  /**
   * 로그인 활동 로그 생성
   */
  // createLoginLog: async (
  //   request: CreateLoginLogRequest
  // ): Promise<CreateLogResponse> => {
  //   const response = await api.post('/admin/statistics/login-logs', request);
  //   return response.data;
  // },

  /**
   * 상담실 활동 로그 생성
   */
  createConsultationLog: async (
    request: CreateConsultationLogRequest
  ): Promise<CreateLogResponse> => {
    const response = await api.post('/statistics/consultation-logs', request);
    return response.data;
  },

  /**
   * 자가점검(프리투어) 로그 생성
   */
  createFreeTourLog: async (
    request: CreateFreeTourLogRequest
  ): Promise<CreateLogResponse> => {
    const response = await publicApi.post(
      '/statistics/free-tour-logs',
      request
    );
    return response.data;
  },
};
