import React from 'react';
import styled from '@emotion/styled';
import LnbProfile from './lnb-profile';
import Lnb from './lnb';

interface SidebarProps {
  selectedMenu?: string;
  onMenuSelect?: (menu: string) => void;
  profileData?: {
    name?: string;
    role?: string;
    department?: string;
    departmentTeam?: string;
    avatarUrl?: string;
  };
  onProfileEdit?: () => void;
}

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
`;

const Sidebar: React.FC<SidebarProps> = ({
  selectedMenu = 'consultation',
  onMenuSelect,
  profileData,
  onProfileEdit,
}) => {
  return (
    <SidebarContainer>
      <LnbProfile
        name={profileData?.name}
        role={profileData?.role}
        department={profileData?.department}
        departmentTeam={profileData?.departmentTeam}
        avatarUrl={profileData?.avatarUrl}
        onEditClick={onProfileEdit}
      />
      <Lnb selectedMenu={selectedMenu} onMenuSelect={onMenuSelect} />
    </SidebarContainer>
  );
};

export default Sidebar;
