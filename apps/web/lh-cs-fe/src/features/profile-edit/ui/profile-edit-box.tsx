import {
  CircleBgXIcon,
  CountdownText,
  TrashIcon,
  UploadProfileIcon,
} from '@/shared/ui';
// import { PersonIcon } from '@/shared/ui/icons/person-icon';
import styled from '@emotion/styled';
import React, { useEffect, useMemo, useState } from 'react';
import { NewProfileFormData } from './profile-edit-modal';
import {
  AuthUser,
  useSendRegisterCode,
  useVerifyRegisterCode,
} from '@/features/auth';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { useCountdown } from '@/shared/hooks/use-countdown';
import { CommonTextField } from '@/shared/ui/input/input.styles';
import { PHONE_REGEX } from '@/shared/model/validation-const';
import { ProfileImageBox } from './profile-image-box';
import { ApiError } from '@/shared/api/api-error.util';

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
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

/**
 * TODO: error 스타일 추가
 */
const Input = styled.input`
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 4px;
  padding: 8px 40px 8px 12px;
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: 0.15px;

  &:focus {
    outline: none;
    border: 2px solid #90c31f;
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.38);
  }
  &:disabled {
    background-color: #ddd;
  }
`;

const DeleteValueButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
`;
const ChangePhoneButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 6px;
  color: #0066cc;
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

interface ProfileEditBoxProps {
  initData: AuthUser;
  formData: NewProfileFormData;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  imgDeleteState: boolean;
  handleInputChange: (
    field: keyof NewProfileFormData,
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

const CountDownBox = styled.div`
  border-radius: 4px;
  background: rgba(114, 113, 113, 0.05);
  padding: 12px 16px;
`;

export const ProfileEditBox = ({
  initData,
  formData,
  formErrors,
  isSubmitting,
  imgDeleteState,
  handleInputChange,
  handleImageDelete,
  handleFileChange,
  fileInputRef,
  isCompressing,
}: ProfileEditBoxProps) => {
  const toast = useToastMessages();

  const [disabledPhoneNumber, setDisabledPhoneNumber] = useState<boolean>(true);
  const [showVerifyBox, setShowVerifyBox] = useState<boolean>(false);
  const [phoneVelidation, setPhoneVelidation] = useState<
    Record<string, string>
  >({});
  const [certificationCode, setCertificationCode] = useState<string>('');

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
    if (initData.profileImageUrl) return initData.profileImageUrl;
    return undefined;
  }, [imagePreviewUrl, initData.profileImageUrl]);

  /**
   * TODO: 이미지 데이터가 처음부터 null일 경우 default svg 보여주는 처리 필요.
   */
  // ✅ 이미지 표시 여부 메모이제이션
  const shouldShowImage = useMemo(() => {
    if (imgDeleteState) return false;
    if (formData.profileImage instanceof File) return true;
    if (initData.profileImageUrl) return true;
    return false;
  }, [imgDeleteState, formData.profileImage, initData.profileImageUrl]);

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

  /**
   * 전화번호 인증 관련 코드
   */

  // countdown hook
  const countdown = useCountdown({
    initialTime: 180,
    onTimeUp: () => {
      toast.showError(
        '인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.'
      );
      setCertificationCode('');
    },
  });

  const sendCodeMutation = useSendRegisterCode();
  const sendCertificationCode = async () => {
    if (!PHONE_REGEX.test(formData.phoneNumber)) {
      setPhoneVelidation((prev) => ({
        ...prev,
        phoneNumber: '※ 전화번호 형식이 올바르지 않습니다.(11자리)',
      }));
      return;
    }

    try {
      // request 파라미터 전달
      const result = await sendCodeMutation.mutateAsync(formData.phoneNumber);
      setPhoneVelidation((prev) => ({
        ...prev,
        phoneNumber: '',
      }));
      toast.showSuccess('휴대전화로 인증코드를 발송했습니다. 확인해 주세요.');
      countdown.reset();
      countdown.start();
      setCertificationCode('');
      setShowVerifyBox(true);
      console.warn(result.code);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증번호 발송 중 오류가 발생했습니다.';
      toast.showError(message);
    }
  };

  const verifyCodeMutation = useVerifyRegisterCode();
  const checkCertificationCode = async () => {
    if (countdown.timeLeft <= 0) {
      toast.showError(
        '인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.'
      );
      return;
    }

    try {
      // request 파라미터 전달
      const result = await verifyCodeMutation.mutateAsync({
        phoneNumber: formData.phoneNumber,
        verificationCode: certificationCode,
      });

      if (!result) {
        toast.showError('인증번호가 잘못되었습니다. 다시 입력해주세요.');
        setCertificationCode('');
      }

      toast.showSuccess('휴대전화 인증이 완료되었습니다.');
      countdown.pause();
      setDisabledPhoneNumber(true);
      setShowVerifyBox(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증번호 검증 중 오류가 발생했습니다.';

      // ✅ API 응답의 code 추출
      let errorCode: string | undefined;
      if (error instanceof ApiError && error.raw) {
        errorCode = (error.raw as Record<string, unknown>)?.code as string;
      }

      if (errorCode === 'VERIFICATION_ATTEMPT_EXCEEDED') {
        toast.showError(
          '인증번호 입력 제한 횟수를 초과했습니다. 다시 시도해주세요.'
        );
        setShowVerifyBox(false);
        setCertificationCode('');
        return;
      }
      toast.showError(message);
    }
  };

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
              <ImageButton onClick={handleImageUpload}>
                <ButtonIcon>
                  <UploadProfileIcon size={20} />
                </ButtonIcon>
                <ButtonText>등록</ButtonText>
              </ImageButton>
              <ImageButton onClick={handleImageDelete}>
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
        <FieldLabel htmlFor='name'>이름</FieldLabel>
        <InputWrapper>
          <CommonTextField
            id='name'
            placeholder='이름'
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            disabled={isSubmitting}
          />
          {formData.name && (
            <DeleteValueButton
              type='button'
              onClick={() => handleInputChange('name', '')}
              aria-label='이름 삭제'
            >
              <CircleBgXIcon />
            </DeleteValueButton>
          )}
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
            disabled={isSubmitting}
          />
          {formData.department && (
            <DeleteValueButton
              type='button'
              onClick={() => handleInputChange('department', '')}
              aria-label='부서 삭제'
            >
              <CircleBgXIcon />
            </DeleteValueButton>
          )}
        </InputWrapper>
      </FormField>

      <FormField>
        <FieldLabel htmlFor='phoneNumber'>전화번호</FieldLabel>
        <InputWrapper>
          <CommonTextField
            id='phoneNumber'
            value={formData.phoneNumber}
            placeholder={'전화번호'}
            disabled={disabledPhoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            error={!!phoneVelidation.phoneNumber}
            helperText={phoneVelidation.phoneNumber}
          />
          {disabledPhoneNumber ? (
            <ChangePhoneButton
              type='button'
              onClick={() => {
                setDisabledPhoneNumber(false);
                countdown.reset();
              }}
              aria-label='전화번호 변경'
            >
              변경
            </ChangePhoneButton>
          ) : (
            <ChangePhoneButton
              type='button'
              onClick={() => sendCertificationCode()}
              aria-label='인증번호 발송'
            >
              인증번호 발송
            </ChangePhoneButton>
          )}
        </InputWrapper>
      </FormField>

      {showVerifyBox && (
        <CountDownBox>
          {/* 카운트다운 및 상태 표시 */}
          <div className='flex items-center justify-between'>
            <div>인증번호</div>
            {countdown.isActive && countdown.timeLeft > 0 && (
              <CountdownText>
                {countdown.formatTime(countdown.timeLeft)}
              </CountdownText>
            )}
          </div>

          <InputWrapper>
            <Input
              id='certificationCode'
              value={certificationCode}
              onChange={(e) => setCertificationCode(e.target.value)}
              placeholder='인증번호를 입력해 주세요.'
            />
            <ChangePhoneButton
              type='button'
              onClick={() => checkCertificationCode()}
              aria-label='인증번호 확인'
            >
              확인
            </ChangePhoneButton>
          </InputWrapper>
        </CountDownBox>
      )}

      <HiddenFileInput
        ref={fileInputRef}
        type='file'
        accept='.jpg,.jpeg,.png,.webp'
        onChange={handleFileChange}
      />
    </>
  );
};
