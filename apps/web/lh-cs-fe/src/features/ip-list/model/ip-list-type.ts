import { Pagination } from '@/shared/types/common.types';

export interface GetTotalIpListResponse extends Pagination {
  data: GetIpListResponse[];
}

export interface GetIpListResponse {
  id: string;
  ipAddress: string;
  description: string;
  isAllowed: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostIpItemPayload {
  ipAddress: string;
  description: string;
  isAllowed: boolean;
}
