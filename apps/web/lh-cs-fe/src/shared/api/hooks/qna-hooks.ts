import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  getQna,
  getQnaById,
  postQna,
  updateQnaById,
} from '@/shared/api/qna-api';
import {
  GetPaginationFilterParams,
  RequestCreateNoticeFaq,
  RequestUpdateNoticeFaq,
} from '../../model/notice-faq-type';
import {
  CreateNoticeFaqResponse,
  GetTotalNoticeFaqResponse,
  GetNoticeFaqResponseById,
} from '@/shared/model/notice-api-type';

/**
 * QnA 목록 조회 Hook (Public API)
 * @note Landing 페이지용 - 인증 불필요
 */
export const usePublicQna = (
  params: GetPaginationFilterParams
): UseQueryResult<GetTotalNoticeFaqResponse, Error> => {
  return useQuery({
    queryKey: ['publicQnas', params],
    queryFn: () => getQna(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    enabled: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * QnA 상세 조회 Hook (Public API)
 * @note 개별 QnA 클릭 시 사용
 */
export const usePublicQnaById = (
  qnaId: string | null
): UseQueryResult<GetNoticeFaqResponseById, Error> => {
  return useQuery({
    queryKey: ['publicQna', qnaId],
    queryFn: () => getQnaById(Number(qnaId)),
    enabled: !!qnaId,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지 (구 cacheTime)
    retry: 1, // Public API는 재시도 최소화
    refetchOnWindowFocus: false, // 포커스 시 재요청 비활성화
  });
};

/**
 * 공지사항 생성 Hook (Mutation)
 * @note 관리자 페이지용 - 인증 필요
 * @example
 * const { mutate, isPending } = useCreateNotice();
 * mutate(noticeData, {
 *   onSuccess: (data) => console.log('생성 성공:', data),
 *   onError: (error) => console.error('생성 실패:', error),
 * });
 */
export const useCreateQna = (): UseMutationResult<
  CreateNoticeFaqResponse,
  Error,
  RequestCreateNoticeFaq,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RequestCreateNoticeFaq) => postQna(request),
    onSuccess: () => {
      // ✅ 1. publicQnas로 시작하는 모든 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['publicQnas'],
      });

      // ✅ 2. 개별 QnA 캐시도 무효화 (상세 페이지 갱신)
      queryClient.invalidateQueries({
        queryKey: ['publicQna'],
      });
    },
    onError: (error) => {
      console.error('QnA 생성 실패:', error);
    },
  });
};

/**
 * qna 수정 Hook (Mutation)
 * @note 관리자 페이지용 - 인증 필요
 * @example
 * const { mutate, isPending } = useUpdateQna();
 * mutate(noticeData, {
 *   onSuccess: (data) => console.log('생성 성공:', data),
 *   onError: (error) => console.error('생성 실패:', error),
 * });
 */
// ✅ 개선안: id를 mutation 실행 시점에 전달
export const useUpdateQna = (): UseMutationResult<
  CreateNoticeFaqResponse,
  Error,
  { id: string; payload: RequestUpdateNoticeFaq }, // ← id와 payload 함께 전달
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateQnaById(id, payload),
    onSuccess: (_data, variables) => {
      // variables.id 사용 가능
      queryClient.invalidateQueries({
        queryKey: ['publicQnas'],
      });

      queryClient.invalidateQueries({
        queryKey: ['publicQna', variables.id], // ← 실제 수정된 id 사용
      });
    },
    onError: (error) => {
      console.error('QnA 수정 실패:', error);
    },
  });
};
