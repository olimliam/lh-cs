export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface ProfileEditRequest {
  name: string;
  department: string;
  phoneNumber: string;
  profileImage?: File | null;
  isEditProfileImage: boolean;
}

export interface ProfileEditResponse extends SuccessResponse {
  data: {
    id: string;
    username: string;
    name: string;
    phoneNumber: string;
    profileImageUrl: string;
    department: string;
    updatedAt: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 성공 응답
export interface ChangePasswordSuccessResponse {
  success: true;
  message: 'Password changed successfully';
}

// 실패 응답
export interface ChangePasswordErrorResponse {
  success: false;
  message: string;
  errorCode: 'INVALID_CURRENT_PASSWORD' | 'PASSWORD_MISMATCH';
}

// 통합 응답 타입
export type ChangePasswordResponse =
  | ChangePasswordSuccessResponse
  | ChangePasswordErrorResponse;

// 타입 가드
export const isPasswordChangeSuccess = (
  response: ChangePasswordResponse
): response is ChangePasswordSuccessResponse => {
  return response.success === true;
};

export const isPasswordChangeError = (
  response: ChangePasswordResponse
): response is ChangePasswordErrorResponse => {
  return response.success === false;
};
