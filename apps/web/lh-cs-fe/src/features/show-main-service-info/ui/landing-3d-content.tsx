import { VirtualSpaceIcon } from '@/shared/ui';
import { media } from '@/shared/utils';
import styled from '@emotion/styled';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContentArea,
  IconContainer,
  MainContent,
  MainTitle,
  StyledModalContentHeader,
  SubTitle,
  TextSection,
} from '../style/common';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';

const CustomHeader = styled(StyledModalContentHeader)`
  ${media.tablet`
    flex-direction: row-reverse;
    justify-content: space-between;
  `}
`;

const LinkBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid;
  transition: all 0.3s ease;
  width: 100%;
  background-color: #f8fcff;
  border-color: #0055a2;

  & stroke {
    transition: all 0.3s ease;
    fill: currentColor;
  }
  ${media.tablet`
    gap: 12px;
    padding: 12px;
  `}
`;

const LinkBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #0055a2;
  width: 100%;
  padding: 10px;
  transition: all 0.3s ease;
  text-align: left;
  color: #ffffff;
  font-weight: 500;

  &:hover {
    background-color: rgba(0, 85, 162, 0.8);
  }

  &:disabled {
    opacity: 0.2;
  }
`;

const DividerBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  color: #666;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%;

  &::before,
  &::after {
    content: '';
    display: inline-block;
    width: calc(50% - 38px);
    height: 1px;
    background-color: #e2e2e2;
  }
`;

// 1:1 상담 신청 방법 관련 styled components
const CounselMethodContainer = styled.div`
  border: 1px solid #cccccc;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  background-color: #ffffff;
  ${media.tablet`
    padding: 16px;
    gap: 12px;
  `}
`;

const CounselMethodTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0055a2;
  line-height: 1.3;
  margin: 0;

  ${media.tablet`
    font-size: 16px;
  `}
`;

const CounselMethodList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const CounselMethodItem = styled.div`
  width: 100%;
`;

const CounselMethodLeft = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
`;

const CounselMethodType = styled.h4`
  font-weight: 700;
  color: #333;
  line-height: 1.3;
  margin: 0;
  ${media.tablet`
    font-size: 14px;
  `}
`;

const CounselMethodDescription = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  line-height: 1.3;
  margin: 0;
  ${media.tablet`
    font-size: 12px;
  `}
`;

const CounselMethodRight = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #d4e8f8;
  background: #f8fcff;
  border-radius: 4px;
  padding: 8px 12px;
`;

const CounselCenterName = styled.p`
  font-weight: 500;
  color: #333;
  line-height: 1.3;
  margin: 0;

  ${media.tablet`
    font-size: 14px;
  `}
`;

const CounselPhoneNumber = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: #0055a2;
  line-height: 1.3;
  margin: 0;

  ${media.tablet`
    font-size: 16px;
  `}
`;

const KakaoTalkInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const KakaoTalkChannel = styled.p`
  font-weight: 700;
  color: #0055a2;
  line-height: 1.3;
  margin: 0;
  ${media.tablet`
    font-size: 14px;
  `}
`;

const KakaoTalkUrl = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  line-height: 1.3;
  margin: 0;
`;

const KakaoTalkIcon = styled.div`
  width: 48px;
  height: 48px;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// 1:1 상담 신청 방법 컴포넌트
const CounselMethodBox: React.FC = () => {
  const handleKakaoTalkClick = () => {
    window.open('https://pf.kakao.com/_qavxoV', '_blank');
  };

  return (
    <CounselMethodContainer>
      <CounselMethodTitle>1:1 실시간 상담 신청 방법</CounselMethodTitle>

      <CounselMethodList>
        {/* 전화 상담 */}
        <CounselMethodItem>
          <CounselMethodLeft>
            <CounselMethodType>전화로 신청</CounselMethodType>
            <CounselMethodDescription>
              3D 가상현실 1:1 상담 요청
            </CounselMethodDescription>
          </CounselMethodLeft>
          <CounselMethodRight>
            <CounselCenterName>LH 바로 처리센터</CounselCenterName>
            <CounselPhoneNumber>1670-8572</CounselPhoneNumber>
          </CounselMethodRight>
        </CounselMethodItem>

        {/* 카카오톡 채널 상담 */}
        <CounselMethodItem
          onClick={handleKakaoTalkClick}
          style={{ cursor: 'pointer' }}
        >
          <CounselMethodLeft>
            <CounselMethodType>카카오톡으로 신청</CounselMethodType>
            <CounselMethodDescription>
              3D 가상현실 1:1 상담 요청
            </CounselMethodDescription>
          </CounselMethodLeft>
          <CounselMethodRight>
            <KakaoTalkInfo>
              <KakaoTalkChannel>카카오톡 채널: LH</KakaoTalkChannel>
              <KakaoTalkUrl>(pf.kakao.com/_qavxoV)</KakaoTalkUrl>
            </KakaoTalkInfo>
            <KakaoTalkIcon>
              <img src={'/images/img-kakao-qr.png'} alt='카카오톡 채널' />
            </KakaoTalkIcon>
          </CounselMethodRight>
        </CounselMethodItem>
      </CounselMethodList>
    </CounselMethodContainer>
  );
};

export const Landing3DContent: React.FC = () => {
  const { isTablet } = useDeviceDetector();
  const navigate = useNavigate();
  const handle3DSpaceClick = () => {
    navigate('/self-check');
  };

  return (
    <MainContent>
      <ContentArea>
        <LinkBox>
          <CustomHeader>
            <IconContainer
              bgColor={'rgba(0, 85, 162, 0.10)'}
              className='button-icon'
            >
              <VirtualSpaceIcon stroke='#0055A2' />
            </IconContainer>
            <TextSection>
              <MainTitle color={'#0055A2'}>
                3D 가상현실 기반 셀프 자가점검 진행
              </MainTitle>
              <SubTitle>
                {!isTablet ? (
                  <>
                    <b>3D 가상현실 공간에 구현된</b> LH 임대주택의 다양한 <br />
                    세대 내 공간·시설물을 체험하세요.
                  </>
                ) : (
                  <>
                    <b>LH 임대주택 공간</b>의 세대 내 공간·시설물을 체험하세요.
                  </>
                )}
              </SubTitle>
            </TextSection>
          </CustomHeader>

          <LinkBtn onClick={handle3DSpaceClick}>이동하기</LinkBtn>
        </LinkBox>

        <DividerBox>
          <span>또는</span>
        </DividerBox>

        <div id='privateCounselBox'>
          <CounselMethodBox />
        </div>
      </ContentArea>
    </MainContent>
  );
};

export default Landing3DContent;
