import React, { useMemo } from 'react';
import { PencilIcon, SettingIcon } from '../../../shared/ui';
import { useProfile } from '@/features/auth';
import { managementMenuItems } from '../model/menu-item.const';
import { MenuCategoryEnum } from '../model';
import { Container, LnbContainer } from '../style/lnb-style';
import { PersonIcon } from '@/shared/ui/icons/person-icon';
import { useMenuSection } from '../hooks/use-menu-section';

const ManageLnbWidget: React.FC = () => {
  const { data: profileData, error: profileError } = useProfile();

  // ✅ 메뉴 섹션 훅 사용
  const { renderMenuSection } = useMenuSection({
    // developmentMenuIds: ['qna'], // 개발 중인 메뉴 ID들
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

    return managementMenuItems.filter((item) =>
      item.allowedRoles.includes(userRole)
    );
  }, [userRole]);

  // ✅ 카테고리별로 분류
  const userManageItems = useMemo(
    () =>
      filteredMenuItems.filter(
        (item) => item.category === MenuCategoryEnum.USER_MANAGE
      ),
    [filteredMenuItems]
  );

  const boardManageItems = useMemo(
    () =>
      filteredMenuItems.filter(
        (item) => item.category === MenuCategoryEnum.BOARD_MANAGE
      ),
    [filteredMenuItems]
  );
  const serviceAdminItems = useMemo(
    () =>
      filteredMenuItems.filter(
        (item) => item.category === MenuCategoryEnum.SERVICE_MANAGE
      ),
    [filteredMenuItems]
  );

  return (
    <Container>
      <LnbContainer>
        <div className='lnb-box'>
          {userManageItems.length > 0 &&
            renderMenuSection('회원 관리', userManageItems, <PersonIcon />)}
          {boardManageItems.length > 0 &&
            renderMenuSection(
              '게시판 관리',
              boardManageItems,
              <PencilIcon fill={'#000'} />
            )}
          {serviceAdminItems.length > 0 &&
            renderMenuSection(
              '서비스 설정',
              serviceAdminItems,
              <SettingIcon />
            )}
        </div>
      </LnbContainer>
    </Container>
  );
};

export default ManageLnbWidget;
