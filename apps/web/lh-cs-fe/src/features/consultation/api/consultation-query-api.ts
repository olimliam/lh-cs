import { api } from '@/shared/api/api-client';
import {
  ConsultationFullInfoResponse,
  CreateConsultationResponse,
} from '../model/consultation.types';
import { CommonResponse } from '@/shared/types/common-response.types';

export async function getAllConsultations(): Promise<
  CreateConsultationResponse[]
> {
  const { data: response } = await api.get<
    CommonResponse<CreateConsultationResponse[]>
  >(`/consultations/active`);

  if (response.data) {
    return response.data;
  }

  throw new Error('Failed to get consultation');
}

export async function getConsultationDetail(
  consultationId: string
): Promise<CreateConsultationResponse> {
  const { data: response } = await api.get<
    CommonResponse<CreateConsultationResponse>
  >(`/consultations/${consultationId}`);

  if (response.data) {
    return response.data;
  }

  throw new Error('Failed to get consultation detail');
}

export async function getFullConsultationDetailById(
  consultationId: string
): Promise<ConsultationFullInfoResponse> {
  const { data: response } = await api.get<
    CommonResponse<ConsultationFullInfoResponse>
  >(`/consultations/${consultationId}/full`);

  if (response.data) {
    return response.data;
  }

  throw new Error('Failed to get consultation detail');
}
