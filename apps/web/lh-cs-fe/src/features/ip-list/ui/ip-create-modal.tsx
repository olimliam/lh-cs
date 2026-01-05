import React, { useState } from 'react';
import styled from '@emotion/styled';
import { DialogPopup } from '@/shared/ui';
import {
  CommonTextField,
  FieldLabel,
  FormField,
} from '@/shared/ui/input/input.styles';
import { PostIpItemPayload } from '../model/ip-list-type';
import { useQueryClient } from '@tanstack/react-query';
import { usePostIp } from '../hooks/ip-list-hooks';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { IP_REGEX } from '@/shared/model/validation-const';

interface IpCreateModalProps {
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

const PasswordNotice = styled.div`
  background: rgba(114, 113, 113, 0.05);
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PasswordNoticeText = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #444444;

  p {
    margin: 0;
    line-height: 1.5;
  }

  p:first-of-type {
    line-height: 1.5;
  }

  p:last-of-type {
    line-height: 1.3;
  }
`;

export interface DisabledValues {
  username: boolean;
  password: boolean;
  phoneNumber: boolean;
  name: boolean;
  department: boolean;
}

export const IpCreateModal: React.FC<IpCreateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  // 사용자 정보 수정 mutation
  const { mutate: createIp, isPending: isSubmitting } = usePostIp();
  const toast = useToastMessages();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PostIpItemPayload>({
    ipAddress: '',
    description: '',
    isAllowed: true,
  });

  // handle 함수 ----------------------------------
  const handleInputChange = (
    field: keyof PostIpItemPayload,
    value: string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // 1. ip 검증
    if (IP_REGEX.test(formData.ipAddress) === false) {
      errors.ipAddress = '※ 유효한 IP 주소를 입력해 주세요.';
    }

    // 6. 명칭 검증
    if (formData.description.trim() === '') {
      errors.description = '※ 명칭을 입력해 주세요.';
    }

    setFormErrors(errors);

    // ✅ passwordError도 검증 결과에 포함
    return Object.keys(errors).length === 0;
  };

  /**
   * 정보 변경 후 refetch
   */
  const refetchUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['ipList'] });
  };

  // handleSubmit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    // Mutation 실행
    createIp(formData, {
      onSuccess: () => {
        toast.showSuccess('IP가 정상적으로 등록되었습니다.');

        // 폼 초기화
        setFormData({
          ipAddress: '',
          description: '',
          isAllowed: true,
        });
        refetchUsers();
        onClose();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'IP 등록에 실패했습니다.';
        toast.showError(message);
      },
    });
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
            <Title>IP 등록</Title>
          </Header>
          <MainContent>
            <ContentArea>
              <FormField>
                <FieldLabel>IP</FieldLabel>
                <CommonTextField
                  id='ipAddress'
                  placeholder='등록할 IP를 입력해 주세요.'
                  value={formData.ipAddress}
                  onChange={(e) =>
                    handleInputChange('ipAddress', e.target.value)
                  }
                  error={!!formErrors.ipAddress}
                  helperText={formErrors.ipAddress}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField>
                <FieldLabel>명칭</FieldLabel>
                <CommonTextField
                  id='description'
                  placeholder='등록할 명칭을 입력해 주세요.(20자 이내)'
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  disabled={isSubmitting}
                />
              </FormField>
            </ContentArea>

            <PasswordNotice>
              <PasswordNoticeText>
                <p>
                  ※ IP는 숫자 최대 3자리 (0~255)로 구성된 4개의 점-구분식
                  표기법으로 입력해 주세요.
                </p>
                <p>{`ex) 255.255.10.1`}</p>
              </PasswordNoticeText>
            </PasswordNotice>

            <ActionsContainer>
              <ActionButton
                variant='outline'
                onClick={onClose}
                disabled={isSubmitting}
              >
                취소
              </ActionButton>
              <ActionButton
                variant='filled'
                onClick={() => {
                  handleSubmit();
                }}
                disabled={isSubmitting}
              >
                적용
              </ActionButton>
            </ActionsContainer>
          </MainContent>
        </ModalContent>
      </DialogPopup>
    </>
  );
};
