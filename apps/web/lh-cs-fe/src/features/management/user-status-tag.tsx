import {
  UserLoginLockStatusEnum,
  UserStatusEnum,
} from '@/shared/model/user-status.enum';
import { BASE_FONT_FAMILY } from '@/shared/ui';
import styled from '@emotion/styled';

const TagBox = styled.div<{
  variant: UserStatusEnum | UserLoginLockStatusEnum;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: ${BASE_FONT_FAMILY};
  & .title {
    font-size: 16px;
    font-weight: 600;
    line-height: 130%; /* 20.8px */
  }
  & .time-stamp {
    font-size: 12px;
    font-weight: 500;
    line-height: 130%; /* 20.8px */
  }
  ${({ variant }) =>
    variant === 'LOCKED'
      ? `
    background-color: rgba(206, 46, 54, 0.10);
    color: #CE2E36;
  `
      : variant === 'INACTIVE'
        ? `
    background-color: rgba(0, 85, 162, 0.10);
    color: #0055A2;
  `
        : ''}
`;

interface UserStatusTagProps {
  badgeData: {
    status: UserStatusEnum | UserLoginLockStatusEnum;
    date: string | null;
  } | null;
  variant?: UserStatusEnum | UserLoginLockStatusEnum | null;
  timeStamp?: string | null | undefined;
}

const dateGenerate = (timeStamp: string | null | undefined): string | null => {
  if (!timeStamp) return null;

  const newDate = timeStamp.split('T')[0].replace(/-/g, '.');
  return newDate;
};

export const UserStatusTag = ({ badgeData }: UserStatusTagProps) => {
  if (badgeData === null) return null;

  return (
    <TagBox variant={badgeData.status}>
      <span className='title'>
        {badgeData.status === 'LOCKED'
          ? '차단'
          : badgeData.status === 'INACTIVE'
            ? '중지'
            : ''}
      </span>
      <span className='time-stamp'>{dateGenerate(badgeData.date)}</span>
    </TagBox>
  );
};
