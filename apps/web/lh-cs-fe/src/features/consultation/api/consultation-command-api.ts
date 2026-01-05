import { api } from '@/shared/api/api-client';
import {
  CreateConsultationRequest,
  CreateConsultationResponse,
} from '../model/consultation.types';

export async function createConsultation(
  request: CreateConsultationRequest
): Promise<CreateConsultationResponse> {
  // API 호출 및 응답 처리 로직 추가
  const { data: response } = await api.post<CreateConsultationResponse>(
    '/consultations',
    request
  );

  if (response) {
    return response;
  }

  throw new Error('Failed to create consultation');
}

export async function startConsultation(
  consultationId: string,
  visitorId: string
): Promise<void> {
  await api.put(`/consultations/${consultationId}/start`, { visitorId });
}

// TODO: Implement redirection logic
// 방 폭파 로직 설계 상담원이 상담 종료를 누르면 5분간 카운팅을 한다.
// 상담사나 고객은 5분간 머물 수 있으며, 상담사는 고객의 상태를 실시간으로 확인할 수 있다.
// - 나갔는지 안나갔는지 확인할 수 있다.
// 종료할 경우 사용자를 강제로 내보내야한다.
// 사용자가 자유롭게 투어할 수 있는 페이지로 리디렉트 시켜주어야 한다.

export async function endConsultation(consultationId: string): Promise<void> {
  await api.put(`/consultations/${consultationId}/end`);
}

export async function restartConsultation(consultationId: string): Promise<void> {
  await api.put(`/consultations/${consultationId}/restart`);
}
