import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createConsultation } from './consultation-command-api';
import {
  getAllConsultations,
  getConsultationDetail,
  getFullConsultationDetailById,
} from './consultation-query-api';

export const CONSULTATION_QUERY_KEYS = {
  create: ['consultations', 'create'],
  get: (id: string) => ['consultations', id] as const,
  getAll: () => ['consultations'] as const,
};

export const useCreateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConsultation,
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: CONSULTATION_QUERY_KEYS.getAll(),
      });
      return data;
    },
    retry: false,
    onError(error) {
      console.error('Error creating consultation:', error);
    },
  });
};

export const useGetAllConsultationRooms = () => {
  return useQuery({
    queryKey: CONSULTATION_QUERY_KEYS.getAll(),
    queryFn: () => getAllConsultations(),
  });
};

export const useConsultationDetail = (consultationId: string) => {
  return useQuery({
    queryKey: CONSULTATION_QUERY_KEYS.get(consultationId),
    queryFn: () => getConsultationDetail(consultationId),
    enabled: !!consultationId, // consultationId가 있을 때만 실행
  });
};

export const useConsultationFullDetailById = (consultationId: string) => {
  return useQuery({
    queryKey: CONSULTATION_QUERY_KEYS.get(consultationId),
    queryFn: () => getFullConsultationDetailById(consultationId),
    enabled: !!consultationId, // consultationId가 있을 때만 실행
  });
};
