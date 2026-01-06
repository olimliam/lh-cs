import React, { useMemo, useState } from 'react';
import LnbProfile from './lnb-profile';
import StatisticsIcon from '../../../shared/ui/icons/statistics-icon';
import { ArrowRightIcon, SettingIcon } from '../../../shared/ui';
import { useProfile } from '@/features/auth';
import ProfileEditModal from '@/features/profile-edit/ui/profile-edit-modal';
import { getRoleLabel } from '@/shared/model/user-role-permissions';
import { menuItems } from '../model/menu-item.const';
import { MenuCategoryEnum } from '../model';
import { Container, LnbContainer, MoveToButton } from '../style/lnb-style';
import { useMenuSection } from '../hooks/use-menu-section';
// import { useNavigate } from 'react-router-dom';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import MoveToAiReviewButton from './move-to-ai-review-button';

const DEFAULT_PROFILE = {
  name: '정현수',
  roleLabel: '상담원',
  department: '공동주택관리지원실',
  avatar: '/images/Profile.png',
};

interface ProfileItem {
  name: string;
  roleLabel: string;
  department: string;
  avatar: string | undefined;
}

const LnbWidget: React.FC = () => {
  // const navigate = useNavigate();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile();
  // ✅ 메뉴 섹션 훅 사용 (비전 AI 핸들러 포함)
  const { renderMenuSection } = useMenuSection({
    developmentMenuIds: ['consultation-history'], // 개발 중인 메뉴 ID들
  });

  // ✅ 에러 발생 시 폴백 UI
  if (profileError) {
    console.error('❌ Profile Load Error:', profileError);
    // 에러 시에만 DEFAULT_PROFILE 사용 (의도적)
  }

  // ✅ 사용자 역할 추출
  const userRole = profileData?.role;

  // ✅ 역할에 따라 필터링된 메뉴 아이템
  const filteredMenuItems = useMemo(() => {
    if (!userRole) return [];

    return menuItems.filter((item) => item.allowedRoles.includes(userRole));
  }, [userRole]);

  // ✅ 카테고리별로 분류
  const operationItems = useMemo(
    () =>
      filteredMenuItems.filter(
        (item) => item.category === MenuCategoryEnum.OPERATE
      ),
    [filteredMenuItems]
  );

  const statisticsItems = useMemo(
    () =>
      filteredMenuItems.filter(
        (item) => item.category === MenuCategoryEnum.STATISTICS
      ),
    [filteredMenuItems]
  );

  // ✅ useMemo로 계산된 값 사용 (상태 변경 없음)
  const curProfileData = useMemo<ProfileItem>(() => {
    if (isProfileLoading || !profileData) {
      return {
        name: DEFAULT_PROFILE.name,
        roleLabel: DEFAULT_PROFILE.roleLabel,
        department: DEFAULT_PROFILE.department,
        avatar: DEFAULT_PROFILE.avatar,
      };
    }

    return {
      name: profileData.name,
      roleLabel: getRoleLabel(profileData.role) ?? DEFAULT_PROFILE.roleLabel,
      department: profileData.department ?? DEFAULT_PROFILE.department,
      avatar: profileData.profileImageUrl ?? DEFAULT_PROFILE.avatar,
    };
  }, [profileData, isProfileLoading]);

  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  const openProfilePopup = () => {
    // 프로필 수정 로직
    setIsProfileEditOpen(true);
  };

  return (
    <Container>
      <LnbProfile
        name={curProfileData.name}
        role={curProfileData.roleLabel}
        department={curProfileData.department}
        avatarUrl={curProfileData.avatar}
        onEditClick={openProfilePopup}
      />
      <LnbContainer>
        <div className='lnb-box'>
          {renderMenuSection('운영', operationItems, <SettingIcon />)}
          {renderMenuSection('통계', statisticsItems, <StatisticsIcon />)}
        </div>

        <div>
          <MoveToAiReviewButton />
          {userRole !== UserRoleEnum.CONSULTANT && (
            <MoveToButton onClick={() => window.open('/management', '_blank')}>
              <span>서비스 관리</span>
              <ArrowRightIcon fill={'#999'} width={18} height={18} />
            </MoveToButton>
          )}
        </div>
      </LnbContainer>

      {isProfileEditOpen && (
        <ProfileEditModal
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
        />
      )}
    </Container>
  );
};

export default LnbWidget;
