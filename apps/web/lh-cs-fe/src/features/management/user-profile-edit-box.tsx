import { RadioInput, TrashIcon, UploadProfileIcon } from '@/shared/ui';
import styled from '@emotion/styled';
import React, { useEffect, useMemo } from 'react';
import { CommonTextField } from '@/shared/ui/input/input.styles';
import { ProfileImageBox } from '../profile-edit/ui/profile-image-box';
import { Box, CircularProgress } from '@mui/material';
// import { RadioInput } from '../../shared/ui/radio/radio-input';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { USER_ROLE_OPTIONS } from './model/radio-options';
import {
  GetUserIdInfoResponse,
  PutUserIdInfoPayload,
} from '@/shared/api/admin-users-api';
import { DisabledValues } from './user-info-edit-modal';
import { UserStatusEnum } from '@/shared/model/user-status.enum';
import { DisabledDim } from './user-status-edit-box';

const FormField = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const ProfileImageSection = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const FieldLabel = styled.label`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  color: #111111;
  width: 96px;
  flex-shrink: 0;
`;

const ProfileImageContent = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
`;

const ImageActionsContainer = styled.div`
  flex: 1;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ImageNotice = styled.div`
  background: #f5f5f5;
  border-radius: 4px;
  padding: 8px 12px;
`;

const NoticeText = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  color: #444444;
  margin: 0;
`;

const ImageButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
`;

const ImageButton = styled.button`
  flex: 1;
  background: rgba(114, 113, 113, 0.1);
  border: 1px solid rgba(114, 113, 113, 0.5);
  border-radius: 4px;
  padding: 8px 16px 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition:
    background 0.2s,
    border-color 0.2s;

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  &:hover {
    background: rgba(114, 113, 113, 0.15);
    border: 1px solid #727171;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  position: relative;
`;

const ButtonIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #727171;
  text-transform: uppercase;
  letter-spacing: 0.46px;
  line-height: normal;
`;

const ModifyButton = styled.button`
  height: 40px;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #0055a2;
  background: #0055a2;
  color: #fff;

  &.disabled {
    border: 1px solid rgba(114, 113, 113, 0.5);
    background: rgba(114, 113, 113, 0.1);
    color: #727171;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

interface UserProfileEditBoxProps {
  isDetailLoading: boolean;
  initData: GetUserIdInfoResponse;
  formData: PutUserIdInfoPayload;
  formErrors: Record<string, string>;
  passwordVal: string;
  passwordError?: string;
  handlePasswordChange: (value: string) => void;
  passwordSubmitting: boolean;
  isSubmitting: boolean;
  imgDeleteState: boolean;
  disabledValues: DisabledValues;
  handleDisabledValues: (fieldName: keyof DisabledValues) => void;
  handleInputChange: (
    field: keyof PutUserIdInfoPayload,
    value: File | string | null
  ) => void;
  handleImageDelete: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>; // ref 추가
  isCompressing: boolean;
}

const HiddenFileInput = styled.input`
  display: none;
`;

export const UserProfileEditBox = ({
  isDetailLoading,
  initData,
  formData,
  formErrors,
  passwordVal,
  passwordError,
  handlePasswordChange,
  passwordSubmitting,
  isSubmitting,
  imgDeleteState,
  disabledValues,
  handleDisabledValues,
  handleInputChange,
  handleImageDelete,
  handleFileChange,
  fileInputRef,
  isCompressing,
}: UserProfileEditBoxProps) => {
  // const [disabledValues, setDisabledValues] = useState<DisabledValues>({
  //   username: true,
  //   password: true,
  //   phoneNumber: true,
  //   name: true,
  //   department: true,
  // });

  // const handleDisabledValues = (fieldName: keyof DisabledValues) => {
  //   setDisabledValues((prev) => ({
  //     ...prev,
  //     [fieldName]: !prev[fieldName],
  //   }));
  // };
  /**
   * 프로필 이미지 변경 관련 코드
   */
  // ✅ 이미지 URL 메모이제이션
  const imagePreviewUrl = useMemo(() => {
    if (formData.profileImage instanceof File) {
      return URL.createObjectURL(formData.profileImage);
    }
    return null;
  }, [formData.profileImage]);

  // ✅ 이미지 소스 안정화
  const stableImageSrc = useMemo(() => {
    if (imagePreviewUrl) {
      return imagePreviewUrl;
    }
    if (initData?.profileImageUrl) return initData.profileImageUrl;
    return undefined;
  }, [imagePreviewUrl, initData?.profileImageUrl]);

  /**
   * TODO: 이미지 데이터가 처음부터 null일 경우 default svg 보여주는 처리 필요.
   */
  // ✅ 이미지 표시 여부 메모이제이션
  const shouldShowImage = useMemo(() => {
    if (imgDeleteState) return false;
    if (formData.profileImage instanceof File) return true;
    if (initData?.profileImageUrl) return true;
    return false;
  }, [imgDeleteState, formData.profileImage, initData?.profileImageUrl]);

  const handleImageUpload = () => {
    if (isCompressing || isSubmitting) return;
    fileInputRef.current?.click();
  };

  // 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // ✅ 1. AdminProfileFormData용 onChange 어댑터
  const handleRadioChange = (fieldName: string, value: UserRoleEnum) => {
    // AdminProfileFormData의 필드명으로 변환
    const field = fieldName as keyof PutUserIdInfoPayload;
    handleInputChange(field, value);
  };

  // ✅ 로딩 상태 체크
  if (isDetailLoading) {
    return (
      <Box display='flex' justifyContent='center' p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // ✅ 데이터 없음 체크
  if (!initData) {
    return (
      <Box p={2} textAlign='center' color='#999'>
        사용자 정보를 불러올 수 없습니다.
      </Box>
    );
  }

  return (
    <>
      <ProfileImageSection>
        <FieldLabel>프로필 사진</FieldLabel>
        <ProfileImageContent>
          <ProfileImageBox
            shouldShow={shouldShowImage}
            imageSrc={stableImageSrc}
          />

          <ImageActionsContainer>
            <ImageNotice>
              <NoticeText>※ 이미지 권장 비율: 1:1</NoticeText>
            </ImageNotice>
            <ImageButtonGroup>
              <ImageButton
                onClick={handleImageUpload}
                disabled={
                  isSubmitting ||
                  isCompressing ||
                  formData.status === UserStatusEnum.INACTIVE
                }
              >
                <ButtonIcon>
                  <UploadProfileIcon size={20} />
                </ButtonIcon>
                <ButtonText>등록</ButtonText>
              </ImageButton>
              <ImageButton
                onClick={handleImageDelete}
                disabled={
                  isSubmitting ||
                  isCompressing ||
                  formData.status === UserStatusEnum.INACTIVE
                }
              >
                <ButtonIcon>
                  <TrashIcon width={20} height={20} fill='#727171' />
                </ButtonIcon>
                <ButtonText>삭제</ButtonText>
              </ImageButton>
            </ImageButtonGroup>
          </ImageActionsContainer>
        </ProfileImageContent>
      </ProfileImageSection>

      <FormField>
        <FieldLabel htmlFor='role'>회원 유형</FieldLabel>
        <RadioInput<UserRoleEnum>
          fieldName='role'
          value={formData.role}
          options={USER_ROLE_OPTIONS}
          onChange={handleRadioChange}
          disabled={isSubmitting || formData.status === UserStatusEnum.INACTIVE}
        />
      </FormField>

      <FormField>
        <FieldLabel htmlFor='username'>아이디</FieldLabel>
        <InputWrapper>
          <CommonTextField
            id='username'
            placeholder='아이디'
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            error={!!formErrors.username}
            helperText={formErrors.username}
            disabled={disabledValues.username || isSubmitting}
            padding={'8px 12px'}
          />
          <ModifyButton
            type='button'
            className={disabledValues.username ? 'disabled' : ''}
            onClick={() => {
              handleDisabledValues('username');
              // setDisabledUsername(!disabledUsername);
            }}
            disabled={
              isSubmitting || formData.status === UserStatusEnum.INACTIVE
            }
            aria-label='아이디 변경'
          >
            {disabledValues.username ? '수정' : '완료'}
          </ModifyButton>
        </InputWrapper>
      </FormField>

      <FormField>
        <FieldLabel htmlFor='password'>비밀번호</FieldLabel>
        <InputWrapper>
          <CommonTextField
            id='password'
            placeholder='‘수정’ 버튼을 클릭해 비밀번호를 재설정해 주세요.'
            value={passwordVal}
            onChange={(e) => handlePasswordChange(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            disabled={disabledValues.password || passwordSubmitting}
            padding={'8px 12px'}
          />
          <ModifyButton
            type='button'
            className={disabledValues.password ? 'disabled' : ''}
            onClick={() => {
              handleDisabledValues('password');
            }}
            disabled={
              passwordSubmitting ||
              isSubmitting ||
              formData.status === UserStatusEnum.INACTIVE
            }
            aria-label='비밀번호 재설정'
          >
            {disabledValues.password ? '수정' : '완료'}
          </ModifyButton>
        </InputWrapper>
      </FormField>

      <FormField>
        <FieldLabel htmlFor='name'>이름</FieldLabel>
        <InputWrapper>
          <CommonTextField
            id='name'
            placeholder='이름'
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            disabled={disabledValues.name || isSubmitting}
            padding={'8px 12px'}
          />
          <ModifyButton
            type='button'
            className={disabledValues.name ? 'disabled' : ''}
            onClick={() => {
              handleDisabledValues('name');
            }}
            aria-label='이름 변경'
            disabled={
              isSubmitting || formData.status === UserStatusEnum.INACTIVE
            }
          >
            {disabledValues.name ? '수정' : '완료'}
          </ModifyButton>
        </InputWrapper>
      </FormField>

      <FormField>
        <FieldLabel htmlFor='phoneNumber'>전화번호</FieldLabel>
        <InputWrapper>
          <CommonTextField
            id='phoneNumber'
            value={formData.phoneNumber}
            placeholder={'전화번호'}
            disabled={disabledValues.phoneNumber || isSubmitting}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
            padding={'8px 12px'}
          />
          <ModifyButton
            type='button'
            className={disabledValues.phoneNumber ? 'disabled' : ''}
            onClick={() => {
              handleDisabledValues('phoneNumber');
            }}
            aria-label='전화번호 변경'
            disabled={
              isSubmitting || formData.status === UserStatusEnum.INACTIVE
            }
          >
            {disabledValues.phoneNumber ? '수정' : '완료'}
          </ModifyButton>
        </InputWrapper>
      </FormField>

      <FormField>
        <FieldLabel htmlFor='department'>부서</FieldLabel>
        <InputWrapper>
          <CommonTextField
            id='department'
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            placeholder='부서'
            error={!!formErrors.department}
            helperText={formErrors.department}
            disabled={disabledValues.department || isSubmitting}
            padding={'8px 12px'}
          />
          <ModifyButton
            type='button'
            className={disabledValues.department ? 'disabled' : ''}
            onClick={() => {
              handleDisabledValues('department');
            }}
            aria-label='부서 변경'
            disabled={
              isSubmitting || formData.status === UserStatusEnum.INACTIVE
            }
          >
            {disabledValues.department ? '수정' : '완료'}
          </ModifyButton>
        </InputWrapper>
      </FormField>

      <HiddenFileInput
        ref={fileInputRef}
        type='file'
        accept='.jpg,.jpeg,.png,.webp'
        onChange={handleFileChange}
      />

      {formData.status === UserStatusEnum.INACTIVE && <DisabledDim />}
    </>
  );
};
