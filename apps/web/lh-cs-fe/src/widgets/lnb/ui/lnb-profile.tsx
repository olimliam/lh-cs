import React from 'react';
import styled from '@emotion/styled';
import { BASE_FONT_FAMILY, PencilIcon, RoleTag } from '@/shared/ui';
import { Skeleton } from '@mui/material';
import { media } from '@/shared/utils';

interface LnbProfileProps {
  name?: string;
  role?: string;
  department?: string;
  departmentTeam?: string;
  avatarUrl?: string;
  onEditClick?: () => void;
}

// Styled Components based on Figma design
const ProfileContainer = styled.div`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  width: 286px;

  ${media.tablet`
    background-color: none;
    box-shadow: none;
    padding: 0 16px;
    border-bottom: 1px solid #eee;
  `}
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProfileHeader = styled.div`
  display: flex;
  position: relative;
  gap: 12px;
  align-items: flex-start;
  ${media.tablet`
    display: block;
    padding-bottom: 16px;
  `};
`;

const ProfileImage = styled.div`
  width: 106px;
  height: 106px;
  border-radius: 6px;
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${media.tablet`
    width: 60px;
    height: 60px;
  `};
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
  ${media.tablet`
    padding-top: 12px;
  `};
`;

const NameSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NameRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Name = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 700;
  font-size: 18px;
  line-height: 1.3;
  color: #111111;
`;

const DepartmentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DepartmentText = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EditButtonText = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  color: #ffffff;
`;

const EditButton = styled.button`
  background-color: #90c31f;
  border: none;
  border-radius: 4px;
  padding: 6px 10px 6px 6px;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;

  &:hover {
    background-color: #7ba619;
  }

  @media screen and (max-width: 1024px) {
    position: absolute;
    top: 0;
    right: 0;
    width: auto;
    padding: 6px;
    ${EditButtonText} {
      display: none;
    }
  }
`;

const LnbProfile: React.FC<LnbProfileProps> = ({
  name = '',
  role = '',
  department = '',
  avatarUrl = '/images/Profile.png',
  onEditClick,
}) => {
  return (
    <ProfileContainer>
      <ProfileContent>
        <ProfileHeader>
          <ProfileImage>
            <img src={avatarUrl} alt='' />
          </ProfileImage>
          <ProfileInfo>
            <NameSection>
              <NameRow>
                {!name ? (
                  <Skeleton
                    variant='rounded'
                    width={300}
                    height={200}
                    sx={{ bgcolor: 'grey.300', borderRadius: 2 }}
                  />
                ) : (
                  <Name>{name}</Name>
                )}

                <RoleTag children={role} />
              </NameRow>
              <DepartmentSection>
                {!department ? (
                  <Skeleton
                    variant='rounded'
                    width={300}
                    height={200}
                    sx={{ bgcolor: 'grey.300', borderRadius: 2 }}
                  />
                ) : (
                  <>
                    <DepartmentText>{'-'}</DepartmentText>
                    <DepartmentText>{department}</DepartmentText>
                  </>
                )}
              </DepartmentSection>
            </NameSection>
            <EditButton onClick={onEditClick}>
              <PencilIcon />
              <EditButtonText>내 정보 수정</EditButtonText>
            </EditButton>
          </ProfileInfo>
        </ProfileHeader>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default LnbProfile;
