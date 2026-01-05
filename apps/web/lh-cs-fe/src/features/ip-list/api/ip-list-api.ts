import { CommonResponse } from '@/shared/types/common-response.types';
import {
  GetIpListResponse,
  GetTotalIpListResponse,
  PostIpItemPayload,
} from '../model/ip-list-type';
import { api } from '@/shared/api/api-client';

export async function getIpList(params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: string;
  isPublic?: boolean;
}): Promise<GetTotalIpListResponse> {
  const { page, limit, orderBy, orderDirection, isPublic } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (orderBy) queryParams.append('orderBy', orderBy);
  if (orderDirection) queryParams.append('orderDirection', orderDirection);
  if (isPublic !== undefined) queryParams.append('isPublic', String(isPublic));
  const response = await api.get<CommonResponse<GetTotalIpListResponse>>(
    `/admin/login-allowed-ips?${queryParams.toString()}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'IP 목록을 불러오지 못했습니다.');
  }
  return response.data.data;
}

export async function postIpList({
  ipAddress,
  description,
}: PostIpItemPayload): Promise<GetIpListResponse> {
  const response = await api.post<CommonResponse<GetIpListResponse>>(
    `/admin/login-allowed-ips`,
    {
      ipAddress,
      description,
    }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'IP 생성에 실패했습니다.');
  }
  return response.data.data;
}

export async function deleteIpById(id: string): Promise<void> {
  const response = await api.delete<CommonResponse<null>>(
    `/admin/login-allowed-ips/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'IP 삭제에 실패했습니다.');
  }
}
