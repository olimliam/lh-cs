import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  getNotice,
  getNoticeById,
  postNotice,
  updateNoticeById,
  uploadContentImages,
} from '@/shared/api/notice-api';
import {
  GetPaginationFilterParams,
  RequestCreateNoticeFaq,
  RequestUpdateNoticeFaq,
} from '../../model/notice-faq-type';
import {
  ContentImagesResponse,
  CreateNoticeFaqResponse,
  GetTotalNoticeFaqResponse,
  GetNoticeFaqResponseById,
  RequestContentImages,
} from '@/shared/model/notice-api-type';

/**
 * 공지사항 목록 조회 Hook (Public API)
 * @note Landing 페이지용 - 인증 불필요
 */
export const usePublicNotices = (
  params: GetPaginationFilterParams
): UseQueryResult<GetTotalNoticeFaqResponse, Error> => {
  return useQuery({
    queryKey: ['publicNotices', params],
    queryFn: () => getNotice(params),
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지 (구 cacheTime)
    retry: 1, // Public API는 재시도 최소화
    enabled: true, // 항상 활성화
    refetchOnWindowFocus: false, // 포커스 시 재요청 비활성화
  });
};

/**
 * 공지사항 상세 조회 Hook (Public API)
 * @note 개별 공지사항 클릭 시 사용
 */
export const usePublicNoticeById = (
  noticeId: string | null
): UseQueryResult<GetNoticeFaqResponseById, Error> => {
  return useQuery({
    queryKey: ['publicNotice', noticeId],
    queryFn: () => getNoticeById(Number(noticeId)),
    enabled: !!noticeId, // noticeId가 있을 때만 요청
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
export const useCreateNotice = (): UseMutationResult<
  CreateNoticeFaqResponse,
  Error,
  RequestCreateNoticeFaq,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RequestCreateNoticeFaq) => postNotice(request),
    onSuccess: () => {
      // ✅ 1. publicNotices로 시작하는 모든 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['publicNotices'],
      });

      // ✅ 2. 개별 공지사항 캐시도 무효화 (상세 페이지 갱신)
      queryClient.invalidateQueries({
        queryKey: ['publicNotice'],
      });
    },
    onError: (error) => {
      console.error('공지사항 생성 실패:', error);
    },
  });
};

/**
 * 공지사항 수정 Hook (Mutation)
 * @note 관리자 페이지용 - 인증 필요
 * @example
 * const { mutate, isPending } = useUpdateNotice();
 * mutate(noticeData, {
 *   onSuccess: (data) => console.log('생성 성공:', data),
 *   onError: (error) => console.error('생성 실패:', error),
 * });
 */
// ✅ 개선안: id를 mutation 실행 시점에 전달
export const useUpdateNotice = (): UseMutationResult<
  CreateNoticeFaqResponse,
  Error,
  { id: string; payload: RequestUpdateNoticeFaq }, // ← id와 payload 함께 전달
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateNoticeById(id, payload),
    onSuccess: (_data, variables) => {
      // variables.id 사용 가능
      queryClient.invalidateQueries({
        queryKey: ['publicNotices'],
      });

      queryClient.invalidateQueries({
        queryKey: ['publicNotice', variables.id], // ← 실제 수정된 id 사용
      });
    },
    onError: (error) => {
      console.error('공지사항 수정 실패:', error);
    },
  });
};

// 공지사항, 자주 묻는 질문 컨텐츠 이미지 업로드
export const useUploadContentImages = (): UseMutationResult<
  ContentImagesResponse,
  Error,
  { payload: RequestContentImages }, // ← payload 함께 전달
  unknown
> => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }) => uploadContentImages(payload),
    // onSuccess: (_data, variables) => {
    //   // variables.id 사용 가능
    //   queryClient.invalidateQueries({
    //     queryKey: ['publicNotices'],
    //   });

    //   queryClient.invalidateQueries({
    //     queryKey: ['publicNotice', variables.id], // ← 실제 수정된 id 사용
    //   });
    // },
    onError: (error) => {
      console.error('콘텐츠 이미지 업로드 실패:', error);
    },
  });
};
