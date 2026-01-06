import { useProfile } from '@/features';
import { getRoleLabel } from '@/shared/model/user-role-permissions';
import { RoleTag } from '@/shared/ui';
import { Skeleton } from '@mui/material';
import { useMemo } from 'react';
import styled from '@emotion/styled';

interface ProfileItem {
  name: string;
  roleLabel: string;
  avatar: string | undefined;
}
const DEFAULT_PROFILE = {
  name: '정현수',
  roleLabel: '상담원',
  department: '공동주택관리지원실',
  avatar: '/images/Profile.png',
};

const GnbProfileContainer = styled.div`
  display: flex;
  align-items: center;
  color: #111;
  font-weight: 600;
  line-height: 18.596px;
  gap: 8px;
`;
const StyledProfileImg = styled.img`
  width: 32px;
  height: 32px;
`;

export const GnbProfile = () => {
  const {
    data: profileData,
    isLoading: isProfileLoading,
    // error: profileError,
  } = useProfile();

  // ✅ useMemo로 계산된 값 사용 (상태 변경 없음)
  const curProfileData = useMemo<ProfileItem>(() => {
    if (isProfileLoading || !profileData) {
      return {
        name: DEFAULT_PROFILE.name,
        roleLabel: DEFAULT_PROFILE.roleLabel,
        avatar: DEFAULT_PROFILE.avatar,
      };
    }

    return {
      name: profileData.name,
      roleLabel: getRoleLabel(profileData.role) ?? DEFAULT_PROFILE.roleLabel,
      avatar: profileData.profileImageUrl ?? DEFAULT_PROFILE.avatar,
    };
  }, [profileData, isProfileLoading]);
  return (
    <GnbProfileContainer>
      <StyledProfileImg src={curProfileData?.avatar} alt='Profile Avatar' />
      <p>
        {isProfileLoading ? (
          <Skeleton
            variant='rounded'
            width={300}
            height={200}
            sx={{ bgcolor: 'grey.300', borderRadius: 2 }}
          />
        ) : (
          <>{curProfileData?.name}</>
        )}
      </p>
      <RoleTag children={curProfileData?.roleLabel} />
    </GnbProfileContainer>
  );
};
