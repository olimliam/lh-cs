import { useLogout, useProfile } from '@/features/auth';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { MainLayoutContainer } from '@/shared/styles/layout.styles';
import { GNBWidget } from '@/widgets/gnb';
import ManageLnbWidget from '@/widgets/lnb/ui/manage-lnb-widget';
import { Box } from '@mui/material';
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const ManagementLayout: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogout();
  const { data: profileData } = useProfile();
  const { isTablet } = useDeviceDetector();
  const [isTabletLnbOpen, setIsTabletLnbOpen] = useState<boolean>(false);
  console.log(isTabletLnbOpen);

  const handleTabletLnbToggle = () => {
    setIsTabletLnbOpen((prev) => !prev);
  };

  // WebRTC Host 페이지인지 확인

  const displayName = profileData?.name ?? '정현수';
  const displayUsername = profileData?.username ?? displayName;
  const displayAvatar = profileData?.profileImageUrl;
  const displayRole = profileData?.role ?? UserRoleEnum.ADMIN;

  const currentUser = React.useMemo(
    () => ({
      id: profileData ? Number(profileData.id) || -1 : -1,
      name: displayName,
      username: displayUsername,
      role: displayRole,
      avatar: displayAvatar,
    }),
    [displayAvatar, displayName, displayRole, displayUsername, profileData]
  );

  const handleMenuToggle = () => {
    console.log('Menu toggle');
  };

  const handleUserMenuClick = async (action: string) => {
    if (action === 'logout') {
      await logout();
      await navigate('/login', { replace: true });
    } else {
      console.log('User action:', action);
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    console.log('Notification clicked:', notificationId);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* GNB - 상단 네비게이션 */}
        <GNBWidget
          user={currentUser}
          onMenuToggle={handleMenuToggle}
          onUserMenuClick={handleUserMenuClick}
          onNotificationClick={handleNotificationClick}
          handleTabletLnbToggle={handleTabletLnbToggle}
        />

        {/* 메인 컨텐츠 영역 */}
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            gap: '24px',
            backgroundColor: '#f8f9fa',
          }}
        >
          {/* LNB - 좌측 네비게이션 */}

          <Box sx={{ padding: '24px 0 24px 24px', width: '220px' }}>
            <ManageLnbWidget />
          </Box>

          {/* 메인 컨텐츠 */}
          <Box
            component='main'
            sx={{
              flex: 1,
              padding: !isTablet ? '24px 24px 24px 0' : '12px 16px',
              width: '100%',
              height: '100%',
            }}
          >
            <MainLayoutContainer>
              <Outlet />
            </MainLayoutContainer>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ManagementLayout;
