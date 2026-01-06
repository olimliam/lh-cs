import React, { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import LnbProfile from './lnb-profile';
import StatisticsIcon from '../../../shared/ui/icons/statistics-icon';
import { menuItems } from '../model/menu-item.const';
import { LogoutButton, SettingIcon, ArrowRightIcon } from '../../../shared/ui';
import { useProfile } from '@/features/auth';
import ProfileEditModal from '@/features/profile-edit/ui/profile-edit-modal';
import { getRoleLabel } from '@/shared/model/user-role-permissions';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { useMenuSection } from '../hooks/use-menu-section';
import { MenuCategoryEnum } from '../model';
import MoveToAiReviewButton from './move-to-ai-review-button';
import { MoveToButton } from '../style/lnb-style';

const DEFAULT_PROFILE = {
  name: '정현수',
  roleLabel: '상담원',
  department: '공동주택관리지원실',
  avatar: '/images/Profile.png',
};

// Styled Components based on Figma design
const Dim = styled.div<{ isTabletLnbOpen: boolean }>`
  display: none;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1300;
  ${({ isTabletLnbOpen }) =>
    isTabletLnbOpen &&
    `
    display: block;
  `}
`;
const Container = styled.div<{ isTabletLnbOpen: boolean }>`
  position: absolute;
  right: -250px;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${({ isTabletLnbOpen }) =>
    isTabletLnbOpen &&
    `
    right: 0;
    transition: right 0.3s ease;
  `}
  height: 100%;
  width: 240px;
  background: #ffffff;
  padding: 16px 0;
  z-index: 1;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.3);
`;

const LnbContainer = styled.div`
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

interface ProfileItem {
  name: string;
  roleLabel: string;
  department: string;
  avatar: string | undefined;
}
interface TabletLnbWidgetProps {
  isTabletLnbOpen: boolean;
  handleTabletLnbToggle: () => void;
  handleLogoutToggleClick: () => void;
}
const TabletLnbWidget: React.FC<TabletLnbWidgetProps> = ({
  isTabletLnbOpen,
  handleTabletLnbToggle,
  handleLogoutToggleClick,
}) => {
  // ✅ 메뉴 섹션 훅 사용 (비전 AI 핸들러 포함)
  const { renderMenuSection } = useMenuSection({
    developmentMenuIds: ['consultation-history'], // 개발 중인 메뉴 ID들
  });
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile();

  const lnbContainerRef = React.useRef<HTMLDivElement>(null);

  // ✅ LNB 외부 클릭 시 닫기 기능
  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      // LNB가 열려있지 않으면 처리하지 않음
      if (!isTabletLnbOpen) {
        return;
      }

      // 클릭된 요소가 LNB 컨테이너 내부인지 확인
      if (
        lnbContainerRef.current &&
        !lnbContainerRef.current.contains(event.target as Node)
      ) {
        // LNB 외부 클릭 시 닫기
        handleTabletLnbToggle();
      }
    },
    [isTabletLnbOpen, handleTabletLnbToggle]
  );
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
    <Dim
      isTabletLnbOpen={isTabletLnbOpen}
      onClick={(e: any) => handleOutsideClick(e)}
    >
      <Container isTabletLnbOpen={isTabletLnbOpen} ref={lnbContainerRef}>
        <LnbProfile
          name={curProfileData.name}
          role={curProfileData.roleLabel}
          department={curProfileData.department}
          avatarUrl={curProfileData.avatar}
          onEditClick={openProfilePopup}
        />

        <LnbContainer>
          {renderMenuSection('운영', operationItems, <SettingIcon />)}
          {renderMenuSection('통계', statisticsItems, <StatisticsIcon />)}
        </LnbContainer>

        <LnbContainer style={{ marginTop: 'auto' }}>
          <div>
            <MoveToAiReviewButton />
            {userRole !== UserRoleEnum.CONSULTANT && (
              <MoveToButton
                onClick={() => window.open('/management', '_blank')}
              >
                <span>서비스 관리</span>
                <ArrowRightIcon fill={'#999'} width={18} height={18} />
              </MoveToButton>
            )}
          </div>
          <LogoutButton onClick={handleLogoutToggleClick} />
        </LnbContainer>
      </Container>

      {isProfileEditOpen && (
        <ProfileEditModal
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
        />
      )}
    </Dim>
  );
};

export default TabletLnbWidget;
