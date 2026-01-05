import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmModal, DialogPopup } from '@/shared/ui';
import { UserProfileEditBox } from './user-profile-edit-box';
import { useImageCompression } from '@/shared/hooks/use-image-compression';
import {
  ADMIN_USERS_DETAIL_QUERY_KEY,
  ADMIN_USERS_QUERY_KEY,
  useAdminUserDetail,
  useLockAdminUser,
  usePostAdminUserStatus,
  useUnlockAdminUser,
  useUpdateAdminUserPassword,
  useUpdateUserInfo,
} from '@/shared/api/hooks/admin-users-hooks';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { UserStatusEditBox } from './user-status-edit-box';
import {
  UserLoginLockStatusEnum,
  UserStatusEnum,
} from '@/shared/model/user-status.enum';
import { StatusData } from './model/status-data-types';
import { timeStampGenerator } from './utils/time-stamp-generator';
import {
  GetUserIdInfoResponse,
  PutUserIdInfoPayload,
} from '@/shared/api/admin-users-api';
import { UserApprovalStatusEnum } from '@/shared/model/user-approval-status.enum';
import {
  PASSWORD_RULE_REGEX,
  PHONE_REGEX,
  USERNAME_REGEX,
} from '@/shared/model/validation-const';

interface UserModifyModalProps {
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ModalContent = styled.div`
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  width: 100%;
  max-width: 100%;
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

export const TimeStampBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #333;
  line-height: 130%; /* 18.2px */
  & .stamp-title {
    display: inline-block;
    color: #8a8d8f;
    width: 80px;
    margin-right: 24px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
    props.active ? '2px solid #0055A2' : '1px solid #8a8d8f'};

  font-family: 'Pretendard', sans-serif;
  font-weight: ${(props) => (props.active ? '700' : '500')};
  font-size: 16px;
  line-height: 1.5;
  color: ${(props) => (props.active ? '#0055A2' : '#8a8d8f')};

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
`;

const FormContainer = styled.div`
  display: flex;
  position: relative;
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
    props.variant === 'outline' ? '1px solid #0055A2' : 'none'};
  background: ${(props) =>
    props.variant === 'outline' ? 'transparent' : '#0055A2'};
  color: ${(props) => (props.variant === 'outline' ? '#0055A2' : 'white')};

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

export interface DisabledValues {
  username: boolean;
  password: boolean;
  phoneNumber: boolean;
  name: boolean;
  department: boolean;
}

export const UserInfoEditModal: React.FC<UserModifyModalProps> = ({
  targetId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  // 사용자 상세 정보 조회 (모달 열렸을 때만)
  const { data: userDetail, isLoading: isDetailLoading } = useAdminUserDetail(
    targetId,
    isOpen
  );
  // 사용자 정보 수정 mutation
  const { mutate: updateUser, isPending: isSubmitting } = useUpdateUserInfo();
  // 사용자 status, lock 수정 mutations
  const { mutate: updatePassword, isPending: passwordSubmitting } =
    useUpdateAdminUserPassword();
  const postStatusMutation = usePostAdminUserStatus();
  const lockMutation = useLockAdminUser();
  const unlockMutation = useUnlockAdminUser();

  // call hooks
  const toast = useToastMessages();
  const {
    compressImage,
    isCompressing,
    error: compressionError,
    reset,
  } = useImageCompression();

  // 모달 열림/닫힘 처리
  useEffect(() => {
    if (isOpen && targetId) {
      // 캐시 무효화 (강제 새로고침)
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_USERS_DETAIL_QUERY_KEY, targetId],
      });
    }
  }, [isOpen, targetId, queryClient]);

  const [activeTab, setActiveTab] = useState<'info' | 'status'>('info');
  const [imgDeleteState, setImgDeleteState] = useState<boolean>(false);
  const [passwordVal, setPasswordVal] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PutUserIdInfoPayload>(
    {} as PutUserIdInfoPayload
  );
  const [initialStatusData, setInitialStatusData] = useState<StatusData>(
    {} as StatusData
  );
  const [statusData, setStatusData] = useState<StatusData>({} as StatusData);
  const [disabledValues, setDisabledValues] = useState<DisabledValues>({
    username: true,
    password: true,
    phoneNumber: true,
    name: true,
    department: true,
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // ✅ 모달 열릴 때 강제로 최신 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_DETAIL_QUERY_KEY });
    }
  }, [isOpen, queryClient]);

  useEffect(() => {
    //삭제를 알 수 있는 flag가 필요하므로, 초기값 설정에서 profileImage 값을 지정하지 않아 undefined 처리함.
    if (userDetail) {
      setFormData({
        username: userDetail?.username || '',
        name: userDetail?.name || '',
        department: userDetail?.department || '',
        phoneNumber: userDetail?.phoneNumber || '',
        profileImageUrl: userDetail?.profileImageUrl || null,
        role: userDetail?.role,
        status: userDetail?.status || UserStatusEnum.ACTIVE,
        approvalStatus:
          userDetail?.approvalStatus || UserApprovalStatusEnum.PENDING,
        isEditProfileImage: false,
        profileImage: null,
      });

      const initial: StatusData = {
        locked: {
          isEdit: false,
          value:
            userDetail.lockedUntil !== null
              ? UserLoginLockStatusEnum.LOCKED
              : UserLoginLockStatusEnum.UNLOCKED,
        },
        userStatus: {
          isEdit: false,
          value: userDetail.status,
        },
      };

      setStatusData(initial);
      setInitialStatusData(initial);
      //activeTab 초기화
      setActiveTab('info');
    }
  }, [userDetail, isOpen]);

  // handle 함수 ----------------------------------
  const handleDisabledValues = (fieldName: keyof DisabledValues) => {
    setDisabledValues((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleInputChange = (
    field: keyof PutUserIdInfoPayload,
    value: File | UserRoleEnum | string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePasswordChange = (value: string) => {
    setPasswordVal(value);
    setFormErrors((prev) => ({ ...prev, password: '' }));
  };

  const handleStatusChange = (
    field: keyof StatusData,
    value: {
      isEdit: boolean;
      value: string | UserStatusEnum;
    }
  ) => {
    setStatusData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    let hasPasswordError = false;

    // 1. 아이디 검증
    if (!disabledValues.username) {
      errors.username = '※ 수정을 완료해 주세요.';
    } else if (!USERNAME_REGEX.test(formData.username)) {
      errors.username = '※ 아이디는 숫자 6자리여야 합니다.';
    }

    // 2. 비밀번호 검증 (입력된 경우만)
    if (!disabledValues.password) {
      errors.password = '※ 수정을 완료해 주세요.';
    } else if (passwordVal.trim()) {
      if (!PASSWORD_RULE_REGEX.test(passwordVal)) {
        const errorMessage =
          '※영문 대·소문자/숫자/특수기호를 모두 조합한 8~16자로 입력해 주세요.';
        setPasswordError(errorMessage);
        hasPasswordError = true;
      } else {
        setPasswordError(undefined); // ✅ 에러 초기화
      }
    } else {
      setPasswordError(undefined); // ✅ 빈 문자열일 때도 초기화
    }

    // 4. 이름 검증
    if (!disabledValues.name) {
      errors.name = '※ 수정을 완료해 주세요.';
    } else if (formData.name.trim() === '') {
      errors.name = '※ 이름을 입력해 주세요.';
    }

    // 5. 전화번호 검증
    if (!disabledValues.phoneNumber) {
      errors.phoneNumber = '※ 수정을 완료해 주세요.';
    } else if (!PHONE_REGEX.test(formData.phoneNumber)) {
      errors.phoneNumber = '※ 전화번호 형식이 올바르지 않습니다.(11자리)';
    }

    // 6. 부서 검증
    if (!disabledValues.department) {
      errors.department = '※ 수정을 완료해 주세요.';
    } else if (formData.department.trim() === '') {
      errors.department = '※ 부서를 입력해 주세요.';
    }

    setFormErrors(errors);

    // ✅ passwordError도 검증 결과에 포함
    return Object.keys(errors).length === 0 && !hasPasswordError;
  };

  /**
   * 회원 정보 변경 후 refetch
   */
  const refetchUsers = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
  };

  // handleSubmit
  const handleSubmit = async () => {
    // 유효성 검증
    if (!validateForm()) {
      return; // 검증 실패 시 즉시 종료
    }

    try {
      // 비밀번호 변경 (입력된 경우만)
      if (passwordVal.trim()) {
        console.log('🔐 Updating password...');
        await new Promise<void>((resolve, reject) => {
          updatePassword(
            {
              id: targetId,
              payload: { newPassword: passwordVal },
            },
            {
              onSuccess: (data) => {
                console.log('✅ 비밀번호 변경 완료:', data);
                resolve();
              },
              onError: (error) => {
                console.error('❌ 비밀번호 변경 실패:', error);
                reject(error);
              },
            }
          );
        });
      }

      // 사용자 정보 수정 (항상 실행)
      console.log('👤 Updating user info...');
      await new Promise<void>((resolve, reject) => {
        //password 변경이 진행됐다면 status 를 PASSWORD_CHANGE_REQUIRED로 변경 / 아니면 원래 status로 보내기.
        updateUser(
          {
            id: targetId,
            payload: {
              username: formData.username,
              name: formData.name,
              department: formData.department,
              phoneNumber: formData.phoneNumber,
              profileImageUrl: formData.profileImageUrl,
              role: formData.role,
              status:
                passwordVal !== ''
                  ? UserStatusEnum.PASSWORD_CHANGE_REQUIRED
                  : formData.status,
              approvalStatus: formData.approvalStatus,
              isEditProfileImage: formData.isEditProfileImage,
              profileImage: formData.profileImage,
            },
          },
          {
            onSuccess: (data) => {
              console.log('✅ 사용자 정보 수정 완료:', data);
              resolve();
            },
            onError: (error) => {
              console.error('❌ 사용자 정보 수정 실패:', error);
              reject(error);
            },
          }
        );
      });

      // 성공 처리
      const successMessage = passwordVal.trim()
        ? '사용자 정보 및 비밀번호가 수정되었습니다.'
        : '사용자 정보가 수정되었습니다.';

      toast.showSuccess(successMessage);

      // 폼 초기화
      setPasswordVal('');
      setFormErrors({});

      // 사용자 목록 새로고침
      refetchUsers();

      // 모달 닫기
      onClose();
    } catch (error) {
      // 에러 처리
      const message =
        error instanceof Error
          ? error.message
          : '사용자 정보 수정에 실패했습니다.';

      toast.showError(message);
      console.error('❌ handleSubmit 실패:', error);
    }
  };

  const handleApplyStatus = async () => {
    const mutations: Promise<unknown>[] = [];

    // ✅ 1. 잠금 상태 변경 감지
    if (statusData.locked.value !== initialStatusData.locked.value) {
      if (statusData.locked.value === UserLoginLockStatusEnum.LOCKED) {
        mutations.push(
          lockMutation.mutateAsync({
            id: targetId,
            payload: { durationMinutes: 30 },
          })
        );
      } else {
        mutations.push(unlockMutation.mutateAsync(targetId));
      }
    }

    // ✅ 2. 계정 상태 변경 감지
    if (
      statusData.userStatus?.value &&
      statusData.userStatus.value !== initialStatusData.userStatus?.value
    ) {
      mutations.push(postStatusMutation.mutateAsync({ id: targetId }));
    }

    // ✅ 3. 변경사항이 없으면 경고
    if (mutations.length === 0) {
      toast.showError('변경된 내용이 없습니다.');
      return;
    }

    // ✅ 4. 병렬 실행
    try {
      await Promise.all(mutations);
      toast.showSuccess('사용자 상태가 변경되었습니다.');
      refetchUsers();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '상태 변경에 실패했습니다.';
      toast.showError(message);
    }
  };

  if (!isOpen) return null;
  return (
    <>
      <DialogPopup
        isOpen={isOpen}
        onClose={onClose}
        container={() => document.getElementById('root')}
        modalSize={{ width: 600, height: 760 }}
        paperClassName='bg-neutral-100'
      >
        <ModalContent>
          <Header>
            <Title>회원 정보</Title>
            <TimeStampBox>
              <div className='itmes-center flex'>
                <span className='stamp-title'>최근 로그인</span>
                <span className='flex items-center'>
                  {timeStampGenerator(userDetail?.lastLoginAt)}
                </span>
              </div>
              <div className='itmes-center flex'>
                <span className='stamp-title'>가입 신청 날짜</span>
                <span className='flex items-center'>
                  {timeStampGenerator(userDetail?.signedAt)}
                </span>
              </div>
              <div className='itmes-center flex'>
                <span className='stamp-title'>가입 승인 날짜</span>
                <span className='flex items-center'>
                  {timeStampGenerator(userDetail?.approvedAt)}
                </span>
              </div>
            </TimeStampBox>
          </Header>
          <MainContent>
            <ContentArea>
              <TabContainer>
                <Tab
                  active={activeTab === 'info'}
                  onClick={() => setActiveTab('info')}
                >
                  회원 정보 수정
                </Tab>
                <Tab
                  active={activeTab === 'status'}
                  onClick={() => setActiveTab('status')}
                >
                  계정 상태 설정
                </Tab>
              </TabContainer>
              <FormContainer>
                {activeTab === 'info' && (
                  <UserProfileEditBox
                    isDetailLoading={isDetailLoading}
                    initData={userDetail as GetUserIdInfoResponse}
                    formData={formData}
                    passwordVal={passwordVal}
                    handlePasswordChange={handlePasswordChange}
                    passwordSubmitting={passwordSubmitting}
                    formErrors={formErrors}
                    passwordError={passwordError}
                    isSubmitting={isSubmitting}
                    imgDeleteState={imgDeleteState}
                    handleInputChange={handleInputChange}
                    handleImageDelete={handleImageDelete}
                    handleFileChange={handleFileChange}
                    disabledValues={disabledValues}
                    handleDisabledValues={handleDisabledValues}
                    fileInputRef={fileInputRef} // ref 전달
                    isCompressing={isCompressing}
                  />
                )}
                {activeTab === 'status' && (
                  <UserStatusEditBox
                    onConfirm={handleApplyStatus}
                    initialStatusData={initialStatusData}
                    statusData={statusData}
                    handleStatusChange={handleStatusChange}
                    lockAt={userDetail?.lockAt || null}
                    inactiveAt={userDetail?.inactiveAt || null}
                    isSubmitting={isSubmitting}
                  />
                )}
              </FormContainer>
            </ContentArea>
            <ActionsContainer>
              <ActionButton
                variant='outline'
                onClick={onClose}
                disabled={isSubmitting || passwordSubmitting}
              >
                취소
              </ActionButton>
              <ActionButton
                variant='filled'
                // onClick={(e) => handleSave(e)}
                onClick={() => {
                  if (activeTab === 'info') {
                    handleSubmit();
                  } else {
                    if (
                      statusData.userStatus.value === UserStatusEnum.INACTIVE
                    ) {
                      setIsConfirmModalOpen(true);
                    } else {
                      handleApplyStatus();
                    }
                  }
                }}
                disabled={
                  isSubmitting ||
                  passwordSubmitting ||
                  formData.status === UserStatusEnum.INACTIVE
                }
              >
                적용
              </ActionButton>
            </ActionsContainer>
          </MainContent>
        </ModalContent>
      </DialogPopup>
      <ConfirmModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleApplyStatus}
        title='계정 사용 중지 설정 확인'
        subTitle='사용 중지를 설정하시겠습니까?'
        noticeTextNode={
          <>※사용 중지 설정 시, 회원 정보(이름, 전화번호)가 삭제됩니다.</>
        }
      />
    </>
  );
};
