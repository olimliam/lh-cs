import { GNBMainTitle, GNBSubTitle, OpenPageIcon } from '@/shared/ui';
import { media } from '@/shared/utils';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

interface LandingHeaderProps {
  className?: string;
}

// Styled Components based on Figma design
const HeaderContainer = styled.header`
  position: fixed;
  width: 100%;
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  z-index: 1200;
  padding: 0 24px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${media.tablet`
    padding: 0 16px;
    min-height: 60px;
  `}
`;

const HeaderLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderLogoImage = styled.img`
  width: 60px;
  height: 40px;
  object-fit: contain;

  ${media.tablet`
    width: 54px;
  `}
`;

const HeaderTextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HeaderRightSection = styled.div`
  margin-left: auto;
`;

const CounselLinkButton = styled.button`
  border: 1px solid transparent;
  /* background: rgba(114, 113, 113, 0.1); */
  border-radius: 4px;
  padding: 8px 10px;
  display: flex;
  gap: 4px;
  align-items: center;
  transition: all 0.3s ease;
  color: #727171;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    border-radius: 4px;
    border: 1px solid rgba(114, 113, 113, 0.50);
    background: rgba(114, 113, 113, 0.10);
  }
`;

const LogoutIconWrapper = styled.div`
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LandingHeader = ({ className }: LandingHeaderProps) => {
  const navigate = useNavigate();

  return (
    <HeaderContainer className={className}>
      <HeaderLeftSection>
        <HeaderLogoImage src='/logo/lh-brand-logo.svg' alt='LH Logo' />
        <HeaderTextSection>
          <GNBMainTitle>LH집속속</GNBMainTitle>
          <GNBSubTitle>한국토지주택공사</GNBSubTitle>
        </HeaderTextSection>
      </HeaderLeftSection>

      <HeaderRightSection>
        <CounselLinkButton
          onClick={() => {
            navigate('/admin/consultation');
          }}
        >
          <LogoutIconWrapper>
            <OpenPageIcon fill={'#727171'} />
          </LogoutIconWrapper>
          상담원 전용
        </CounselLinkButton>
      </HeaderRightSection>
    </HeaderContainer>
  );
};
