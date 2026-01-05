import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postChangePassword, putProfileEdit } from './profile-edit-api';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ProfileEditRequest,
  ProfileEditResponse,
} from '../model/types';
import { AUTH_QUERY_KEYS } from '@/features/auth';

export const useProfileEdit = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfileEditResponse, Error, ProfileEditRequest>({
    mutationFn: putProfileEdit,
    onSuccess: () => {
      // 프로필 쿼리 무효화 - 자동 업데이트
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.profile,
      });
    },
    onError: (error) => {
      console.error('프로필 수정 실패:', error.message);
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
    mutationFn: postChangePassword,
    onSuccess: () => {
      // 프로필 쿼리 무효화 - 자동 업데이트
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.profile,
      });
    },
    retry: false,
    onError: (error) => {
      console.error('비밀번호 변경 실패:', error.message);
    },
  });
};
