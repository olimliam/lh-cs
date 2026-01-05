import { PersonIcon } from '@/shared/ui/icons/person-icon';
import styled from '@emotion/styled';
import React from 'react';

const ProfileImageWrapper = styled.div`
  width: 90px;
  height: 90px;
  border: 1px solid rgba(114, 113, 113, 0.3);
  border-radius: 4px;
  position: relative;
  flex-shrink: 0;
`;

const ProfileImagePreview = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #f5f5f5;
`;

const DefaultProfileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;

  svg {
    width: 100%;
    height: 100%;
    color: #727171;
    opacity: 0.2;
  }
`;

export const ProfileImageBox = React.memo<{
  shouldShow: boolean;
  imageSrc?: string;
}>(({ shouldShow, imageSrc }) => {
  return (
    <ProfileImageWrapper>
      <ProfileImagePreview>
        {shouldShow && imageSrc ? (
          <img
            src={imageSrc}
            alt='프로필 사진'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        ) : (
          <DefaultProfileIcon>
            <PersonIcon width={58} height={58} />
          </DefaultProfileIcon>
        )}
      </ProfileImagePreview>
    </ProfileImageWrapper>
  );
});
