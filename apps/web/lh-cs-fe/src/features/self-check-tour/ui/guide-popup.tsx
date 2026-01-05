import { Dialog } from '@mui/material';
import { useState } from 'react';
import styled from '@emotion/styled';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { media } from '@/shared/utils/device-util';
import { DialogPopupHeader } from '@/shared/ui';
import { ButtonVariant } from '@/shared/model/button-variants.type';

/**
 * TODO: 모달 내부 css style 공통화 (랜딩/자가점검 페이지)
 */
const ModalContent = styled.div`
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0; /* flex 컨테이너에서 중요 */

  ${media.tablet`
    padding: 20px;
    gap: 16px;
  `}
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  min-height: 0;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* 스크롤바 스타일링 (웹킷 기반 브라우저) */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  width: 100%;
  flex-shrink: 0; /* 하단 버튼 영역은 항상 고정 크기 유지 */
`;

const ActionButton = styled.button<{ $variant: ButtonVariant }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 4px;
  border: ${(props) =>
    props.$variant === 'primary' ? '1px solid #0055A2' : '1px solid #90C31F'};
  background-color: none;
  color: ${(props) => (props.$variant === 'primary' ? '#0055A2' : '#90C31F')};

  font-size: 16px;
  line-height: 1.3;

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          &:hover {
            background-color: rgba(0, 85, 162, 0.05);
          }
        `;
      case 'secondary':
        return `
          &:hover {
            background-color: rgba(144, 195, 31, 0.05);
          }
        `;
      default:
        return '';
    }
  }}

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const GuideContentsBox = styled.div`
  display: flex;
  padding: 24px;
  justify-content: center;
  align-items: flex-start;
  gap: 36px;
  border-radius: 4px;
  border: 1px solid #d4e8f8;

  background: #f8fcff;

  ${media.tablet`
    padding: 16px 8px;
    gap: 24px;
  `};
`;
const GuideContentItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 33.33%;
  height: 100%;

  & img {
    width: 44px;
    margin: 0 auto;
  }
  & span {
    color: rgba(0, 85, 162, 0.8);
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    line-height: 130%; /* 20.8px */
  }

  ${media.tablet`
    gap: 12px;
    & span {
      font-size: 14px;
    }
  `}
`;
const GuideImgTitleText = styled.span`
  display: none;
  color: #0055a2;
  font-weight: 700;
  line-height: 130%; /* 20.8px */

  ${media.tablet`
    display: block;
  `}
`;

export const GuidePopup = () => {
  const { isTablet } = useDeviceDetector();
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const onClose = () => {
    setIsPopupOpen(false);
  };
  return (
    <Dialog
      open={isPopupOpen}
      onClose={onClose}
      container={() => document.getElementById('root')}
      PaperProps={{
        sx: {
          margin: 'auto', // 화면 중앙에 배치
          width: '100%',
          maxHeight: 'calc(100vh - 32px)', // 뷰포트 높이에서 여백을 뺀 최대 높이
          maxWidth: `${isTablet ? 344 : 513}px`,
          minHeight: `${isTablet ? 376 : 411}px`, // 최소 높이 설정
          borderRadius: '8px',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
        },
        className: 'bg-neutral-100',
      }}
      BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.5)' } }}
      scroll='paper' // 다이얼로그 내부 스크롤 설정
    >
      <ModalContent>
        <DialogPopupHeader
          titleComponent={<>자가점검 이용가이드</>}
          subTitleComponent={<>{!isTablet ? (<>3D 가상현실 기반 셀프 자가점검 진행</>) : (<>3D 가상현실 기반 셀프 자가점검</>)}</>}
          onClose={onClose}
        />

        <MainContent>
          <ContentArea>
            <GuideContentsBox>
              <GuideContentItem>
                <GuideImgTitleText>이동</GuideImgTitleText>
                <img
                  src={
                    isTablet
                      ? `/images/guide-tablet-icon-01.png`
                      : `/images/guide-pc-icon-01.png`
                  }
                />
                <span>
                  {isTablet ? (
                    <>
                      이동포인트
                      <br />
                      터치
                    </>
                  ) : (
                    <>
                      이동포인트 또는
                      <br />
                      영역을 클릭하세요
                    </>
                  )}
                </span>
              </GuideContentItem>
              <GuideContentItem>
                <GuideImgTitleText>둘러보기</GuideImgTitleText>
                <img
                  src={
                    isTablet
                      ? `/images/guide-tablet-icon-02.png`
                      : `/images/guide-pc-icon-02.png`
                  }
                />
                <span>
                  {isTablet ? (
                    <>
                      터치 후
                      <br />
                      드래그
                    </>
                  ) : (
                    <>
                      클릭 앤 드래그
                      <br />
                      기능을 활용하세요
                    </>
                  )}
                </span>
              </GuideContentItem>
              <GuideContentItem>
                <GuideImgTitleText>확대</GuideImgTitleText>
                <img
                  src={
                    isTablet
                      ? `/images/guide-tablet-icon-03.png`
                      : `/images/guide-pc-icon-03.png`
                  }
                />
                <span>
                  {isTablet ? (
                    <>
                      손가락으로
                      <br />
                      늘리기
                    </>
                  ) : (
                    <>
                      휠을 사용해서
                      <br />
                      확대/축소하세요
                    </>
                  )}
                </span>
              </GuideContentItem>
            </GuideContentsBox>
          </ContentArea>

          <ActionsContainer>
            <ActionButton $variant={'primary'} onClick={onClose}>
              닫기
            </ActionButton>
          </ActionsContainer>
        </MainContent>
      </ModalContent>
    </Dialog>
  );
};
