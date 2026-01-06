import styled from '@emotion/styled';
import { GNBMainTitle, GNBSubTitle } from '@/shared/ui';
import {
  GNBContainer,
  GNBLeftSection,
  GNBLogoImage,
  GNBRightSection,
  GNBTextSection,
} from '@/widgets/gnb/ui/gnb-figma';
import { Box } from '@mui/material';
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelfCheckStore } from '../model/self-check.store';

const CustomGNBContainer = styled(GNBContainer)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
`;
const SquareMeterTextBox = styled.p`
  display: flex;
  padding: 8px 10px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  border: 1px solid rgba(114, 113, 113, 0.2);
  background: rgba(114, 113, 113, 0.05);

  color: #666;
  line-height: 130%; /* 20.8px */
  letter-spacing: 0.46px;

  & span {
    color: #333;
    font-weight: 700;
  }
`;

const SelfCheckLayout: React.FC = () => {
  const { squareMeter } = useSelfCheckStore();
  const location = useLocation();

  // pathname 변경 시 자동으로 컴포넌트가 리렌더링됨
  const path = location.pathname;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* GNB - 상단 네비게이션 */}
      <CustomGNBContainer>
        <GNBLeftSection>
          <a href='/'>
            <GNBLogoImage src='/logo/lh-brand-logo.svg' alt='LH Logo' />
          </a>
          <GNBTextSection>
            <GNBMainTitle>LH집속속</GNBMainTitle>
            <GNBSubTitle>한국토지주택공사</GNBSubTitle>
          </GNBTextSection>
        </GNBLeftSection>

        {/* ✅ pathname 변경 시 실시간으로 반영됨 */}
        {squareMeter !== undefined && path.includes('/self-check/tour') && (
          <GNBRightSection>
            <SquareMeterTextBox>
              평형: <span>{squareMeter}m²</span>
            </SquareMeterTextBox>
          </GNBRightSection>
        )}
      </CustomGNBContainer>

      {/* 메인 컨텐츠 영역 */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
        }}
      >
        {/* 메인 컨텐츠 */}
        <Box
          component='main'
          sx={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0, // 필요한 경우 스크롤 가능하도록
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SelfCheckLayout;
