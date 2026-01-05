import { visitorApi } from '@/shared/api/visitor-api-client';
import {
  ConsultationVisitorInfo,
  VisitorAuthRequest,
  VisitorAuthResponse,
  VisitorIdCheckRequest,
  VisitorIdCheckResponse,
} from '../model/visitor-auth-types';

export const visitorAuthApi = {
  authenticate: async (
    request: VisitorAuthRequest
  ): Promise<VisitorAuthResponse> => {
    const response = await visitorApi.post('/visitor/auth', request);
    return response.data;
  },

  checkVisitorId: async (
    visitorId: string,
    request?: VisitorIdCheckRequest
  ): Promise<VisitorIdCheckResponse> => {
    const response = await visitorApi.post(
      `/visitor/${visitorId}/check`,
      request || {}
    );
    return response.data;
  },

  getConsultationVisitorInfo: async (
    consultationId: string
  ): Promise<ConsultationVisitorInfo> => {
    const response = await visitorApi.post(
      `/consultations/${consultationId}/visitor-info`
    );
    return response.data.data;
  },
};
