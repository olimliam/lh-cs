import styled from '@emotion/styled';
import {
  UserLoginLockStatusEnum,
  UserStatusEnum,
} from '@/shared/model/user-status.enum';
import {
  LOCK_STATUS_OPTIONS,
  USER_STATUS_OPTIONS,
} from './model/radio-options';
import { StatusData } from './model/status-data-types';
import { timeStampGenerator } from './utils/time-stamp-generator';
import { TimeStampBox } from './user-info-edit-modal';
import { RadioInput } from '@/shared/ui';

const FormField = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

export const DisabledDim = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
`;

interface UserStatusEditBoxProps {
  onConfirm: () => Promise<void>;
  statusData: StatusData;
  initialStatusData: StatusData;
  lockAt: string | null;
  inactiveAt: string | null;
  handleStatusChange: (
    field: keyof StatusData,
    value: {
      isEdit: boolean;
      value: UserStatusEnum | UserLoginLockStatusEnum;
    }
  ) => void;
  isSubmitting?: boolean;
}

export interface Options {
  value: string | UserStatusEnum | UserLoginLockStatusEnum;
  label: string;
}

export const UserStatusEditBox: React.FC<UserStatusEditBoxProps> = ({
  statusData,
  initialStatusData,
  handleStatusChange,
  lockAt,
  inactiveAt,
  isSubmitting = false,
}) => {
  const handleRadioChange = (
    fieldName: string,
    value: UserStatusEnum | UserLoginLockStatusEnum
  ) => {
    const field = fieldName as keyof StatusData;

    handleStatusChange(field, {
      isEdit: true,
      value: value,
    });
  };

  return (
    <>
      <TimeStampBox className='rounded-1 bg-[#f5f5f5] p-[12px_16px]'>
        <div className='flex items-center'>
          <span className='stamp-title'>로그인 차단일</span>
          <>{timeStampGenerator(lockAt)}</>
        </div>
        <div className='flex items-center'>
          <span className='stamp-title'>사용 중지일</span>
          <>{timeStampGenerator(inactiveAt)}</>
        </div>
      </TimeStampBox>
      {/* ✅ 잠금 상태 라디오 버튼 */}
      <div className='relative mt-4 flex flex-col gap-4'>
        <FormField>
          <FieldLabel id='lock-status-label'>로그인 차단</FieldLabel>
          <RadioInput<UserLoginLockStatusEnum>
            fieldName='locked'
            value={statusData.locked.value}
            options={LOCK_STATUS_OPTIONS}
            onChange={handleRadioChange}
            disabled={
              isSubmitting ||
              initialStatusData.userStatus?.value === UserStatusEnum.INACTIVE
            }
            ariaLabelledBy='lock-status-label'
          />
        </FormField>

        {/* ✅ 사용자 상태 라디오 버튼 */}
        <FormField>
          <FieldLabel id='user-status-label'>계정 상태</FieldLabel>
          <RadioInput<UserStatusEnum>
            fieldName='userStatus'
            value={statusData.userStatus?.value || UserStatusEnum.ACTIVE}
            options={USER_STATUS_OPTIONS}
            onChange={handleRadioChange}
            disabled={
              isSubmitting ||
              initialStatusData.userStatus?.value === UserStatusEnum.INACTIVE
            }
            ariaLabelledBy='user-status-label'
          />
        </FormField>
        {initialStatusData.userStatus?.value === UserStatusEnum.INACTIVE && (
          <DisabledDim />
        )}
      </div>
    </>
  );
};
