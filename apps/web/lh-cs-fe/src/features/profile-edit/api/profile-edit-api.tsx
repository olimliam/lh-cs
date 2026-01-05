import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ProfileEditRequest,
  ProfileEditResponse,
} from '../model/types';
import { api } from '@/shared/api/api-client';

export async function putProfileEdit(
  request: ProfileEditRequest
): Promise<ProfileEditResponse> {
  const formData = new FormData();
  formData.append('name', request.name);
  formData.append('department', request.department);
  formData.append('phoneNumber', request.phoneNumber);
  if (request.profileImage && request.profileImage instanceof File) {
    formData.append('profileImage', request.profileImage);
  }
  formData.append('isEditProfileImage', String(request.isEditProfileImage));

  const { data: response } = await api.put<ProfileEditResponse>(
    '/users/profile',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response;
}

export async function postChangePassword({
  currentPassword,
  newPassword,
  confirmPassword,
}: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const { data: response } = await api.post<ChangePasswordResponse>(
    '/users/change-password',
    {
      currentPassword,
      newPassword,
      confirmPassword,
    }
  );
  // API 명세서에 따르면 성공/실패 모두 동일한 구조로 응답
  return response;
}
