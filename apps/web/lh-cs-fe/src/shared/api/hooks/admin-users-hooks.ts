import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  fetchAdminUsers,
  getAdminUsersApprovalList,
  getIdAdminUserInfo,
  GetUsersApprovalListParams,
  lockAdminUser,
  postAdminUserStatus,
  PutUserIdInfoPayload,
  PutUserIdInfoResponse,
  unlockAdminUser,
  updateAdminUserApproval,
  updateAdminUserStatus,
  updateUserInfo,
  updateUserPassword,
  UserPasswordPayload,
} from '../admin-users-api';
import {
  AdminUserFilters,
  GetAdminUsersResponse,
  UpdateUserApprovalPayload,
  UpdateUserLockPayload,
  UpdateUserStatusPayload,
} from '../../model/admin-users.dto';

export const ADMIN_USERS_QUERY_KEY = ['admin-users'] as const;
export const ADMIN_USERS_DETAIL_QUERY_KEY = [
  ...ADMIN_USERS_QUERY_KEY,
  'detail',
] as const;

export const useAdminUsers = (filters: AdminUserFilters) =>
  useQuery<GetAdminUsersResponse, Error>({
    queryKey: [...ADMIN_USERS_QUERY_KEY, filters] as const,
    queryFn: () => fetchAdminUsers(filters),
    placeholderData: keepPreviousData,
  });

export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserStatusPayload;
    }) => updateAdminUserStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
};

export const usePostAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => postAdminUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
};

/**
 * ✅ 승인 대기 사용자 목록 조회 훅
 * @param params - 페이지, 정렬, 필터 파라미터
 * @returns 승인 대기 사용자 목록 및 페이지네이션 데이터
 */
export const useAdminUsersApprovalList = (
  params: GetUsersApprovalListParams = {}
) => {
  return useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, params],
    queryFn: () => getAdminUsersApprovalList(params),
    staleTime: 5 * 60 * 1000, // 5분
    enabled: true, // 항상 활성화
  });
};

/**
 * ✅ 사용자 상세 정보 조회 훅 (신규)
 * @param id - 사용자 ID
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns 사용자 상세 정보 및 로그인 히스토리
 */
export const useAdminUserDetail = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...ADMIN_USERS_DETAIL_QUERY_KEY, id] as const,
    queryFn: () => getIdAdminUserInfo(id),
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!id && enabled, // ✅ ID가 있을 때만 요청
    refetchOnWindowFocus: false, // ✅ 모달에서 포커스 재요청 방지
  });
};

/**
 * ✅ 사용자 정보 수정 훅 (신규)
 * @description
 * - multipart/form-data로 사용자 정보 및 프로필 이미지 업데이트
 * - 성공 시 useAdminUsers, useAdminUserDetail 캐시 무효화
 * @example
 * const { mutate, isPending } = useUpdateUserInfo();
 * mutate(
 *   { id: 'user-123', payload: { username: 'new-name', ... } },
 *   {
 *     onSuccess: (data) => console.log('수정 완료:', data),
 *     onError: (error) => console.error('수정 실패:', error),
 *   }
 * );
 */
export const useUpdateUserInfo = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PutUserIdInfoResponse,
    Error,
    { id: string; payload: PutUserIdInfoPayload }
  >({
    mutationFn: ({ id, payload }) => updateUserInfo(id, payload),
    onSuccess: (_data, variables) => {
      // ✅ 1. 사용자 목록 쿼리 무효화 (모든 필터 조합)
      queryClient.invalidateQueries({
        queryKey: ADMIN_USERS_QUERY_KEY,
      });

      // ✅ 2. 수정된 사용자의 상세 정보 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_USERS_DETAIL_QUERY_KEY, variables.id],
      });

      // ✅ 3. 승인 대기 목록도 무효화 (승인 상태 변경 시)
      if (
        variables.payload.approvalStatus ||
        variables.payload.status ||
        variables.payload.role
      ) {
        queryClient.invalidateQueries({
          queryKey: [...ADMIN_USERS_QUERY_KEY],
        });
      }
    },
    onError: (error) => {
      console.error('사용자 정보 수정 실패:', error);
    },
  });
};

/**
 * 사용자 비밀번호 초기화
 * (관리자가 직접 초기화 비밀번호 설정)
 */
export const useUpdateAdminUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UserPasswordPayload;
    }) => updateUserPassword(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
};

/**
 * 사용자 승인 상태 수정
 */

export const useUpdateAdminUserApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserApprovalPayload;
    }) => updateAdminUserApproval(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
};

export const useLockAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserLockPayload;
    }) => lockAdminUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
};

export const useUnlockAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unlockAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
};
