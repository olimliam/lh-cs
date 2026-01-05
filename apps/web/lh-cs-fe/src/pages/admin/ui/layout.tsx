import { useLogout, useProfile } from '@/features/auth';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { MainLayoutContainer } from '@/shared/styles/layout.styles';
import { LogoutModal } from '@/shared/ui';
import { GNBWidget } from '@/widgets/gnb';
import { LNBWidget } from '@/widgets/lnb';
import ManageLnbWidget from '@/widgets/lnb/ui/manage-lnb-widget';
import TabletLnbWidget from '@/widgets/lnb/ui/tablet-lnb-widget';
import { Box } from '@mui/material';
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: logout } = useLogout();
  const { data: profileData } = useProfile();
  const { isTablet } = useDeviceDetector();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isTabletLnbOpen, setIsTabletLnbOpen] = useState<boolean>(false);

  const handleTabletLnbToggle = () => {
    setIsTabletLnbOpen((prev) => !prev);
  };

  // WebRTC Host 페이지인지 확인
  const isWebRTCHostPage = location.pathname.includes('/admin/host/');
  const isManagementPage = location.pathname.includes('/admin/management');

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

  const notifications = [
    {
      id: '1',
      title: '새로운 상담 요청',
      message: `${displayName}님의 상담 요청이 접수되었습니다.`,
      type: 'info' as const,
      isRead: false,
      createdAt: new Date(),
    },
  ];

  const handleMenuToggle = () => {
    console.log('Menu toggle');
  };

  const handleLogoutToggleClick = () => {
    setIsLogoutModalOpen((prev) => !prev);
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

  // WebRTC Host 페이지인 경우 전체화면으로 표시
  if (isWebRTCHostPage) {
    return (
      <Box sx={{ width: '100vw', height: '100vh' }}>
        <Outlet />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* GNB - 상단 네비게이션 */}
        <GNBWidget
          user={currentUser}
          notifications={notifications}
          onMenuToggle={handleMenuToggle}
          onUserMenuClick={handleUserMenuClick}
          onNotificationClick={handleNotificationClick}
          handleTabletLnbToggle={handleTabletLnbToggle}
          toggleLogoutModal={handleLogoutToggleClick}
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

          <>
            {!isManagementPage ? (
              <>
                {!isTablet ? (
                  <Box sx={{ padding: '24px 0 24px 24px', width: '310px' }}>
                    <LNBWidget />
                  </Box>
                ) : (
                  <TabletLnbWidget
                    isTabletLnbOpen={isTabletLnbOpen}
                    handleTabletLnbToggle={handleTabletLnbToggle}
                    handleLogoutToggleClick={handleLogoutToggleClick}
                  />
                )}
              </>
            ) : (
              <>
                <Box sx={{ padding: '24px 0 24px 24px', width: '310px' }}>
                  <ManageLnbWidget />
                </Box>
              </>
            )}
          </>

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
      <LogoutModal
        open={isLogoutModalOpen}
        onClose={handleLogoutToggleClick}
        onConfirm={() => handleUserMenuClick('logout')}
      />
    </>
  );
};

export default AdminLayout;
