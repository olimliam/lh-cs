import React, { useState } from 'react';
import styled from '@emotion/styled';
import { media } from '@/shared/utils';
import { AIAnalysisIcon, VirtualSpaceIcon } from '@/shared/ui';
import { LandingHeader } from './landing-header';
import { LandingFooter } from './landing-footer';
import { LandingModal, MainButton } from '@/features/show-main-service-info';
import { ListBox } from '@/features/notice-faq-list/ui/list-box';

const StyledLayoutWrapper = styled.main`
  width: 100%;
  max-width: 1640px;
  margin: 0 auto;
  padding: 164px 20px 100px;

  ${media.tablet`
    max-width: 568px;
  `}
  ${media.fold`
    max-width: initial;
    padding: 120px 16px 100px;
  `}
`;
const StyledSectionWrapper = styled.section`
  width: 100%;
  padding-bottom: 48px;
  ${media.fold`
    padding-bottom: 24px;
  `}
`;
const StyledMainContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.fold`
    flex-direction: column;
    gap: 16px;
  `}
`;
const StyledMainLogo = styled.img`
  width: 132px;
  ${media.fold`
    width: 108px;
  `}
`;
const StyledMainTitle = styled.h1`
  color: #58686c;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 130%;
  text-align: right;
  & i.point-color {
    all: unset;
    color: #0055a2;
  }
  ${media.fold`
    font-size: 20px;
    text-align: center;
  `}
`;
const MainButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 36px;

  ${media.tablet`
    gap: 16px;
  `}
  ${media.fold`
    flex-direction: column;
  `}
`;

export const LandingPage: React.FC = () => {
  const [isLandingPopupOpen, setIsLandingPopupOpen] = useState(false);
  const [contentType, setContentType] = useState<'3d' | 'ai' | null>(null);
  const [contentHeaderData, setContentHeaderData] = useState<{
    title: string[];
    subtitle: string[];
  }>({ title: [], subtitle: [] });

  const handleVirtualSpaceClick = () => {
    setIsLandingPopupOpen(true);
    setContentType('3d');
    setContentHeaderData({
      title: ['3D 가상현실 자가점검 및 상담', '3D 가상현실 자가점검 및 상담'],
      subtitle: [
        '3D 가상현실 기반 셀프 자가점검 진행 및 1:1 실시간 상담 신청',
        '셀프 자가점검 및 1:1 실시간 상담 신청',
      ],
    });
  };

  const handleMaintenanceAnalysisClick = () => {
    setIsLandingPopupOpen(true);
    setContentType('ai');
    setContentHeaderData({
      title: ['유지보수 유형 판단·분류', '유지보수 유형 판단·분류'],
      subtitle: [
        'AI 유지보수 유형 판단 요청 안내',
        'AI 유지보수 유형 판단 요청 안내',
      ],
    });
  };

  return (
    <>
      <div className='flex min-h-screen flex-col bg-gray-50'>
        <LandingHeader />

        <StyledLayoutWrapper>
          {/* 히어로 섹션 */}
          <StyledSectionWrapper>
            <StyledMainContentHeader>
              <StyledMainLogo
                src='/logo/lh-brand-logo.svg'
                alt='LH집속속 로고'
              />
              <StyledMainTitle>
                <i className='point-color'>미래기술을 활용한</i> LH 임대주택
                유지보수 <br />
                서비스를 경험해 보세요.
              </StyledMainTitle>
            </StyledMainContentHeader>
          </StyledSectionWrapper>

          <StyledSectionWrapper>
            <MainButtonWrapper>
              <MainButton
                id='virtualSpaceBtn'
                variant='primary'
                icon={<VirtualSpaceIcon stroke={'#0055A2'} />}
                onClick={handleVirtualSpaceClick}
              >
                <p className='point-text'>3D 가상현실 자가점검 및 상담</p>
                <p>
                  <b>3D 가상현실 공간에 구현된</b> LH 임대주택의
                  <br />
                  다양한 세대 내 공간·시설물을 체험하세요.
                </p>
              </MainButton>
              <MainButton
                id='AIBtn'
                variant='secondary'
                icon={<AIAnalysisIcon stroke={'#90C31F'} />}
                onClick={handleMaintenanceAnalysisClick}
              >
                <p className='point-text'>AI 유지보수 유형 판단·분류</p>
                <p>
                  <>
                    보수가 필요한 곳의 사진을 등록하면 <br />
                    <b>비전 AI가 유지보수 유형 판단·분류합니다.</b>
                  </>
                </p>
              </MainButton>
            </MainButtonWrapper>
          </StyledSectionWrapper>

          {/* 공지사항 & QNA 섹션 */}
          <StyledSectionWrapper>
            <ListBox />
          </StyledSectionWrapper>
        </StyledLayoutWrapper>

        <LandingFooter />
      </div>

      {isLandingPopupOpen && (
        <LandingModal
          isOpen={isLandingPopupOpen}
          contentType={contentType}
          contentHeaderData={contentHeaderData}
          variant={contentType === '3d' ? 'primary' : 'secondary'}
          onClose={() => {
            setIsLandingPopupOpen(false);
          }}
        />
      )}
    </>
  );
};
