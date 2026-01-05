import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { getIpList, postIpList, deleteIpById } from '../api/ip-list-api';
import {
  GetIpListResponse,
  GetTotalIpListResponse,
  PostIpItemPayload,
} from '../model/ip-list-type';
import { GetPaginationFilterParams } from '@/shared/model/notice-faq-type';

export const useGetIp = (
  params: GetPaginationFilterParams
): UseQueryResult<GetTotalIpListResponse, Error> => {
  return useQuery({
    queryKey: ['ipList', params],
    queryFn: () => getIpList(params),
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지 (구 cacheTime)
    retry: 1, // 재시도 최소화
    enabled: true, // 항상 활성화
    refetchOnWindowFocus: false, // 포커스 시 재요청 비활성화
  });
};

export const usePostIp = () => {
  const queryClient = useQueryClient();

  return useMutation<GetIpListResponse, Error, PostIpItemPayload>({
    mutationFn: postIpList,
    onSuccess: () => {
      // 프로필 쿼리 무효화 - 자동 업데이트
      queryClient.invalidateQueries({
        queryKey: ['ipList'],
      });
    },
    retry: false,
    onError: (error) => {
      console.error('IP 생성 실패:', error.message);
    },
  });
};

export const useDeleteIp = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteIpById,
    onSuccess: () => {
      // IP 목록 쿼리 무효화 - 자동 업데이트
      queryClient.invalidateQueries({
        queryKey: ['ipList'],
      });
    },
    retry: false,
    onError: (error) => {
      console.error('IP 삭제 실패:', error.message);
    },
  });
};
