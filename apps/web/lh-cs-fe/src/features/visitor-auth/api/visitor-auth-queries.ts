import { useMutation, useQuery } from '@tanstack/react-query';
import { visitorAuthApi } from './visitor-auth-api';
import {
  ConsultationVisitorInfo,
  VisitorAuthRequest,
  VisitorAuthResponse,
  VisitorIdCheckRequest,
  VisitorIdCheckResponse,
} from '../model/visitor-auth-types';

export const useVisitorAuth = () => {
  return useMutation<VisitorAuthResponse, Error, VisitorAuthRequest>({
    mutationFn: visitorAuthApi.authenticate,
    onError: (error) => {
      console.error('Visitor authentication failed:', error);
    },
  });
};

export const useVisitorIdCheck = (
  visitorId: string | undefined,
  request?: VisitorIdCheckRequest,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<VisitorIdCheckResponse, Error>({
    queryKey: ['visitorIdCheck', visitorId, request?.consultationId],
    queryFn: () => {
      if (!visitorId) throw new Error('VisitorId is required');
      return visitorAuthApi.checkVisitorId(visitorId, request);
    },
    enabled: !!visitorId && options?.enabled !== false,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// consultationId로 기존 visitorId를 조회하는 새로운 훅
export const useConsultationVisitorInfo = (
  consultationId: string | undefined,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<ConsultationVisitorInfo, Error>({
    queryKey: ['consultationVisitorInfo', consultationId],
    queryFn: async () => {
      if (!consultationId) throw new Error('ConsultationId is required');

      // visitorAuthApi를 사용해 상담방의 방문자 정보를 조회합니다.
      return visitorAuthApi.getConsultationVisitorInfo(consultationId);
    },
    enabled: !!consultationId && options?.enabled !== false,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
