import { AIAnalysisIcon, PdfIcon } from '@/shared/ui';
import styled from '@emotion/styled';
import React from 'react';
import {
  ContentArea,
  IconContainer,
  MainContent,
  MainTitle,
  StyledModalContentHeader,
  SubTitle,
  TextSection,
} from '../style/common';
import { media } from '@/shared/utils';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import useFileDownload from '@/shared/hooks/use-file-download';

const AIAnalysisContainer = styled.div`
  background-color: #fdfffa;
  border: 1px solid #e2f8d4;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
`;

// 카카오톡 채널 섹션
const KakaoSection = styled.div`
  background-color: rgba(144, 195, 31, 0.1);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(144, 195, 31, 0.15);
  }

  ${media.tablet`
    padding: 8px 12px;
  `}
`;

// 카카오톡 텍스트 영역
const KakaoTextSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  line-height: 1.3;
`;

// 카카오톡 채널 타이틀
const KakaoTitle = styled.p`
  font-weight: 700;
  font-size: 16px;
  color: #333;
  margin: 0;
  ${media.tablet`
    font-size: 14px;
  `}
`;

// 카카오톡 URL
const KakaoUrl = styled.p`
  font-size: 14px;
  color: #666666;
  margin: 0;
`;

// 카카오톡 아이콘
const KakaoIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  position: relative;
`;

const WarningText = styled.p`
  ${media.tablet`
    font-size: 14px;
    line-height: 130%;
  `}
`;

const UseStepList = styled.ul`
  width: 100%;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  & li {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    color: #333;
    font-size: 14px;
    font-weight: 500;
    line-height: 130%;

    & span {
      width: calc(100% - 20px);
    }
  }
  & i {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #90c31f;
    font-style: normal;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    border: 1px solid #90c31f;
  }

  ${media.tablet`
    & i {
      /* width: auto; */
      height: auto;
      border-radius: 0;
      border: none;
    }

  `}
  ${media.fold`
    padding: 8px 0;
  `}
`;

const DownloadBtn = styled.button`
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  width: 100%;
  color: #333;
  font-size: 16px;
  font-weight: 700;
  line-height: 130%;

  border-radius: 4px;
  border: 1px solid rgba(144, 195, 31, 0.5);
  background: rgba(144, 195, 31, 0.1);
  transition: all 0.3s;
  &:hover {
    border-radius: 4px;
    border: 1px solid #90c31f;
    background: rgba(144, 195, 31, 0.3);
  }
`;
const AIPdfUrl = import.meta.env.VITE_AI_PDF_URL;

export const LandingAIContent: React.FC = () => {
  const { isTablet } = useDeviceDetector();
  const { handleDownload } = useFileDownload();
  const handleKakaoClick = () => {
    window.open('https://pf.kakao.com/_qavxoV', '_blank');
  };

  // const

  return (
    <MainContent>
      <ContentArea>
        <AIAnalysisContainer>
          {/* 상단 헤더 섹션 */}
          <StyledModalContentHeader>
            <TextSection>
              <MainTitle color={'#90c31f'}>
                AI 유지보수 유형 판단 요청
              </MainTitle>
              <SubTitle>
                {!isTablet ? (
                  <>
                    <b>LH 카카오톡 채널</b>을 통해 서비스를 신청
                  </>
                ) : (
                  <>
                    <b>카카오톡 채널</b>을 통해 서비스를 신청
                  </>
                )}
              </SubTitle>
            </TextSection>
            <IconContainer
              bgColor={'rgba(144, 195, 31, 0.10)'}
              data-name='Container'
            >
              <AIAnalysisIcon stroke={'#90C31F'} />
            </IconContainer>
          </StyledModalContentHeader>

          <KakaoSection className='flex-col !items-start'>
            <MainTitle fontSize={16} color={'#90c31f'}>
              상세 이용 방법
            </MainTitle>
            <UseStepList>
              {!isTablet ? (
                <>
                  <li>
                    <i>1</i>
                    <span>
                      채널 추가 후 <b>「임대주택 A/S 접수(바로처리센터)」</b>{' '}
                      버튼 클릭
                    </span>
                  </li>
                  <li>
                    <i>2</i>
                    <span>
                      후속 메세지에서 <b>「AI 유지보수 유형 판단 요청」</b> 버튼
                      클릭
                    </span>
                  </li>
                  <li>
                    <i>3</i>
                    <span>
                      웹 페이지에서 전화번호, 사진, 보수요청{' '}
                      <b>내용 입력 후 작성 완료</b> 버튼 클릭
                    </span>
                  </li>
                  <li>
                    <i>4</i>
                    <span>
                      채팅방에서 <b>「상담사 연결」, 「신규 하자 접수」</b> 버튼
                      차례대로 클릭
                    </span>
                  </li>
                  <li>
                    <i>5</i>
                    <span>
                      웹 페이지에서 <b>상담 요청자 정보 (이름, 주소 등)</b> 입력
                      후 <b>「확인」</b> 버튼 클릭
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <i>1.</i>
                    <span>
                      채널 추가 후 <b>「임대주택 A/S 접수」</b> 클릭
                    </span>
                  </li>
                  <li>
                    <i>2.</i>
                    <span>
                      메세지에서 <b>「AI 유지보수 유형 판단 요청」</b> 클릭
                    </span>
                  </li>
                  <li>
                    <i>3.</i>
                    <span>
                      웹에서 <b>내용 입력 후 작성 완료</b> 클릭
                    </span>
                  </li>
                  <li>
                    <i>4.</i>
                    <span>
                      <b>「상담사 연결」, 「신규 하자 접수」</b> 차례대로 클릭
                    </span>
                  </li>
                  <li>
                    <i>5.</i>
                    <span>
                      웹에서 <b>정보</b> 입력 후 <b>「확인」</b> 클릭
                    </span>
                  </li>
                </>
              )}
            </UseStepList>
            <DownloadBtn
              onClick={() =>
                handleDownload(AIPdfUrl, 'AI 유지보수 유형 판단요청 설명서.pdf')
              }
            >
              <PdfIcon />
              {!isTablet ? (
                <span>AI 유지보수 유형 판단요청 설명서</span>
              ) : (
                <span>AI 유지보수 유형 판단요청 설명서</span>
              )}
            </DownloadBtn>
          </KakaoSection>

          {/* 카카오톡 채널 섹션 */}
          <KakaoSection onClick={handleKakaoClick}>
            <KakaoTextSection>
              <KakaoTitle>카카오톡 채널로 신청</KakaoTitle>
              <KakaoUrl>(pf.kakao.com/_qavxoV)</KakaoUrl>
            </KakaoTextSection>
            <KakaoIconWrapper>
              <img alt='카카오톡 채널' src={'/images/img-kakao-qr.png'} />
            </KakaoIconWrapper>
          </KakaoSection>

          <WarningText>
            ※ 카카오톡 채팅방에서 <b>「AI 유지보수 유형 판단 요청」</b> 버튼
            클릭
          </WarningText>
        </AIAnalysisContainer>
      </ContentArea>
    </MainContent>
  );
};

export default LandingAIContent;
