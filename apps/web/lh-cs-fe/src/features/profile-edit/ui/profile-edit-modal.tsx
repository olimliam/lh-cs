import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { ProfileEditBox } from './profile-edit-box';
import { ProfilePasswordBox } from './profile-password-box';
import { AuthUser, useProfile } from '@/features/auth';
import { useChangePassword, useProfileEdit } from '../api/profile-edit-hooks';
import { isPasswordChangeSuccess } from '../model/types';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEYS } from '@/features/auth/api/auth-hooks';
import { DialogPopup } from '@/shared/ui';
import Spinner from '@/shared/ui/spinner';
import { PASSWORD_RULE_REGEX } from '@/shared/model/validation-const';
import { useImageCompression } from '@/shared/hooks/use-image-compression';

export interface NewProfileFormData {
  name: string;
  department: string;
  phoneNumber: string;
  profileImage?: File | null;
  isEditProfileImage: boolean;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ModalContent = styled.div`
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled.h2`
  font-family: 'Pretendard', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 1.3;
  color: #111111;
  margin: 0;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 36px;
  width: 100%;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  width: 100%;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: ${(props) =>
    props.active ? '2px solid #90c31f' : '1px solid #8a8d8f'};

  font-family: 'Pretendard', sans-serif;
  font-weight: ${(props) => (props.active ? '700' : '500')};
  font-size: 16px;
  line-height: 1.5;
  color: ${(props) => (props.active ? '#90c31f' : '#8a8d8f')};

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  width: 100%;
`;

const ActionButton = styled.button<{ variant: 'outline' | 'filled' }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 4px;
  border: ${(props) =>
    props.variant === 'outline' ? '1px solid #90c31f' : 'none'};
  background: ${(props) =>
    props.variant === 'outline' ? 'transparent' : '#90c31f'};
  color: ${(props) => (props.variant === 'outline' ? '#90c31f' : 'white')};

  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { data: profileData } = useProfile();
  const toast = useToastMessages();
  const {
    compressImage,
    isCompressing,
    error: compressionError,
    reset,
  } = useImageCompression();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [imgDeleteState, setImgDeleteState] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<NewProfileFormData>(
    {} as NewProfileFormData
  );

  // ✅ 모달 열릴 때 강제로 최신 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
    }
  }, [isOpen, queryClient]);

  useEffect(() => {
    //삭제를 알 수 있는 flag가 필요하므로, 초기값 설정에서 profileImage 값을 지정하지 않아 undefined 처리함.
    if (profileData) {
      setFormData({
        name: profileData.name,
        department: profileData.department || '',
        phoneNumber: profileData.phoneNumber || '',
        isEditProfileImage: false,
      });
    }
  }, [profileData]);

  const handleInputChange = (
    field: keyof NewProfileFormData,
    value: File | string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageDelete = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
      isEditProfileImage: true,
    }));

    setImgDeleteState(true);

    // input value 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file && !file.type.startsWith('image/')) {
      toast.showError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      // 이미지 압축 실행
      const compressedFile = await compressImage(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        useWebWorker: true,
        quality: 0.85,
      });

      if (compressedFile) {
        setFormData((prev) => ({
          ...prev,
          profileImage: compressedFile,
          isEditProfileImage: true,
        }));

        setImgDeleteState(false);
      }
    } catch (error) {
      console.error('파일 처리 실패:', error);
      toast.showError(
        compressionError ||
          '이미지 파일 처리에 실패했습니다. 다시 시도해주세요.'
      );
      reset();
    } finally {
      // input 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      reset();
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = '※ 이름을 입력해주세요.';
    }

    if (!formData.department.trim()) {
      errors.department = '※ 부서를 입력해주세요.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const profileEditMutation = useProfileEdit();
  const isSubmitting = useMemo(
    () => profileEditMutation.isPending,
    [profileEditMutation.isPending]
  );
  const handleSaveProfile = async () => {
    let formDataToSubmit = { ...formData };

    if (!validateForm()) {
      return;
    }

    // profileImage 가 undefined === 이미지 등록/삭제를 한 적이 없음, 이미지를 수정하지 않음.
    if (formDataToSubmit.profileImage === undefined) {
      formDataToSubmit = { ...formDataToSubmit, isEditProfileImage: false };
    }

    // return;
    try {
      const result = await profileEditMutation.mutateAsync(formDataToSubmit);

      // 성공 처리
      toast.showSuccess('프로필이 성공적으로 수정되었습니다.');
      console.warn(result);
      // onSave?.(result);
      onClose();

      // 폼 초기화
      setFormData({} as NewProfileFormData);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '프로필 수정 요청 중 오류가 발생했습니다.';
      alert(message);
      toast.showError(message);
    }
  };

  /**
   * 비밀번호 변경 로직
   */
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );

  const handlePasswordChange = (
    field: keyof PasswordFormData,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const changePasswordMutation = useChangePassword();

  const isPasswordSubmitting = useMemo(
    () => changePasswordMutation.isPending,
    [changePasswordMutation.isPending]
  );
  const passwordValidateForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = '※ 현재 비밀번호를 입력해주세요.';
    } else {
      if (!PASSWORD_RULE_REGEX.test(passwordData.currentPassword)) {
        errors.currentPassword = '※ 영문, 숫자, 특수기호 조합, 8~16자 이내.';
      }
    }

    if (!passwordData.newPassword.trim()) {
      errors.newPassword = '※ 새 비밀번호를 입력해주세요.';
    } else {
      if (!PASSWORD_RULE_REGEX.test(passwordData.newPassword)) {
        errors.newPassword = '※ 영문, 숫자, 특수기호 조합, 8~16자 이내.';
      }
    }

    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = '※ 새 비밀번호 확인을 입력해주세요.';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = '※ 새 비밀번호가 일치하지 않습니다.';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePassword = async () => {
    if (!passwordValidateForm()) {
      return;
    }
    // 에러 초기화
    setPasswordErrors({});
    try {
      const result = await changePasswordMutation.mutateAsync(passwordData);

      if (isPasswordChangeSuccess(result)) {
        // 성공 처리
        toast.showSuccess('비밀번호가 변경되었습니다.');
        // 폼 초기화
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        onClose();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '수정 요청 중 오류가 발생했습니다.';
      toast.showError(message);
    }
  };

  const handleSave = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (activeTab === 'info') {
      handleSaveProfile();
    } else {
      // 비밀번호 변경 로직
      handleSavePassword();
    }
  };

  if (!isOpen) return null;

  return (
    <DialogPopup
      isOpen={isOpen}
      onClose={onClose}
      container={() => document.getElementById('root')}
      modalSize={{ width: 480, height: 648 }}
      paperClassName='bg-neutral-100'
    >
      <ModalContent>
        <Header>
          <Title>내 정보 수정</Title>
          <div className='flex items-center gap-2 rounded-[4px] bg-[rgba(114,113,113,0.1)] p-[4px_8px]'>
            <span className='text-[14px] font-medium text-[#999]'>아이디</span>
            <span className='text-base font-semibold text-[#333]'>
              {profileData?.username}
            </span>
          </div>
          {/* <CloseButton onClick={onClose} aria-label='모달 닫기'>
            <CloseIcon width={36} height={36} />
          </CloseButton> */}
        </Header>

        <MainContent>
          <ContentArea>
            <TabContainer>
              <Tab
                active={activeTab === 'info'}
                onClick={() => setActiveTab('info')}
              >
                개인정보 변경
              </Tab>
              <Tab
                active={activeTab === 'password'}
                onClick={() => setActiveTab('password')}
              >
                비밀번호 변경
              </Tab>
            </TabContainer>

            <FormContainer>
              {activeTab === 'info' && (
                <ProfileEditBox
                  initData={profileData as AuthUser}
                  formData={formData}
                  formErrors={formErrors}
                  isSubmitting={isSubmitting}
                  imgDeleteState={imgDeleteState}
                  handleInputChange={handleInputChange}
                  handleImageDelete={handleImageDelete}
                  handleFileChange={handleFileChange}
                  fileInputRef={fileInputRef} // ref 전달
                  isCompressing={isCompressing}
                />
              )}

              {activeTab === 'password' && (
                <ProfilePasswordBox
                  showPasswords={showPasswords}
                  passwordErrors={passwordErrors}
                  passwordData={passwordData}
                  isSubmitting={isPasswordSubmitting}
                  handlePasswordChange={handlePasswordChange}
                  togglePasswordVisibility={togglePasswordVisibility}
                />
              )}
            </FormContainer>
          </ContentArea>

          <ActionsContainer>
            <ActionButton
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting || isPasswordSubmitting}
            >
              취소
            </ActionButton>
            <ActionButton
              variant='filled'
              onClick={(e) => handleSave(e)}
              disabled={isSubmitting || isPasswordSubmitting}
            >
              {isSubmitting || isPasswordSubmitting ? (
                <Spinner size={16} />
              ) : (
                '수정'
              )}
            </ActionButton>
          </ActionsContainer>
        </MainContent>
      </ModalContent>
    </DialogPopup>
  );
};

export default ProfileEditModal;
