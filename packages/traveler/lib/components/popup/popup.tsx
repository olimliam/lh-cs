import { useMemo, useState } from 'react';

import styled from '@emotion/styled';
import '../../index.css'; // 아이콘 폰트 로드

import { TourMarkerType } from '../../types/tour';

import { useViewer } from '../../contexts';
import { CloseIcon } from '../icons/close-icon';
import { LhBrandLogo } from '../icons/lh-brand-logo';
import ImageContent from './image-content';
import PDFContent from './pdf-content';
import ShopContent from './shop-content';
import VideoContent from './video-content';

const Root = styled.div<{ isReadyClose?: boolean; isTablet?: boolean }>`
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  width: calc(100% - 60px);
  height: calc(100vh - 160px);
  position: fixed;
  top: 80px;
  left: 30px;
  z-index: 50;

  @media (max-width: 768px) {
    left: 20px;
    width: calc(100% - 40px);
    border-radius: 6px;
  }
`;

const MarkerTitle = styled.div`
  width: 100%;
  padding: 12px 40px;
  position: relative;
  font-size: 16px;
  color: #f9fafb;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
    display: flex;
    gap: 12px;
    align-items: center;
  }
`;

const Button = styled.button<{ size?: 'sm' | 'md'; variant?: string }>`
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  ${(props) =>
    props.size === 'sm' &&
    `
    padding: 4px;
  `}

  ${(props) =>
    props.size === 'md' &&
    `
    padding: 8px;
  `}
`;

const HideBox = styled.div`
  display: flex;
  padding: 8px 12px;
  align-items: center;
  gap: 8px;
  position: absolute;
  bottom: 22px;
  left: 36px;
  border-radius: 120px;
  border: 1px solid #eee;
  background: #fff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);

  color: #666;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 130%; /* 18.2px */

  & .service-badge {
    color: #90c31f;

    font-family: Pretendard;
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: 130%; /* 13px */

    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid #90c31f;
    background: rgba(144, 195, 31, 0.05);
  }
`;

// 임시 IframeContent 컴포넌트
const IframeContent = (props: any) => (
  <div style={{ width: '100%', height: '100%' }}>
    <iframe
      src={props.option.url}
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  </div>
);

function PopUp() {
  const [isReadyClose, setIsReadyClose] = useState<boolean>(false);
  const [isPDFListOpen, setIsPDFListOpen] = useState<boolean>(false);

  const { state, setMarkerContent, handleTogglePopup } = useViewer();
  const isTablet = false;

  const fixedMarkerId = state.markerContent.markerId || '';
  const isPDFMarker = state.markerContent.type === TourMarkerType.pdf;

  const components: Record<string, any> = {
    [TourMarkerType.image]: ImageContent,
    [TourMarkerType.video]: VideoContent,
    [TourMarkerType.iframe]: IframeContent,
    [TourMarkerType.pdf]: PDFContent,
    [TourMarkerType.shop]: ShopContent,
    [TourMarkerType.link]: IframeContent,
    [TourMarkerType.chat]: IframeContent,
    [TourMarkerType.videochat]: IframeContent,
    [TourMarkerType.inquiry]: IframeContent,
    [TourMarkerType.icon]: IframeContent,
    [TourMarkerType.portal]: IframeContent,
    [TourMarkerType.tts]: IframeContent,
    [TourMarkerType.none]: IframeContent,
  };

  const MarkerComponent =
    components[state.markerContent.type!] || IframeContent;

  const PDFMarkerProps = isPDFMarker
    ? {
        isListOpen: isPDFListOpen,
        onCloseList: () => setIsPDFListOpen(false),
      }
    : {};

  const currentMarkerTitle = useMemo(() => {
    return (
      state.tour.markers.find((marker) => marker.id === fixedMarkerId)?.title ||
      ''
    );
  }, [fixedMarkerId]);

  const onAnimationend = () => {
    if (isReadyClose) {
      setMarkerContent({
        markerId: null,
        type: null,
        option: null,
      });
    }
  };

  const handleClose = () => {
    setMarkerContent({
      markerId: null,
      type: null,
      option: null,
    });

    setIsReadyClose(true);
    handleTogglePopup(false);
  };

  return (
    <>
      <Root
        isReadyClose={isReadyClose}
        isTablet={isTablet}
        onAnimationEnd={() => onAnimationend()}
      >
        <MarkerTitle>
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexGrow: 1,
              textAlign: 'center',
            }}
          >
            {currentMarkerTitle}
          </div>
          {isTablet && isPDFMarker && (
            <Button size='sm' onClick={() => setIsPDFListOpen(true)}>
              {/* <i 
                className='ic-list' 
                style={{ 
                  fontSize: '16px',
                  fontFamily: 'XrooIcon !important',
                  fontWeight: 'normal',
                  fontStyle: 'normal'
                }} 
              /> */}
              <CloseIcon width={16} height={16} />
            </Button>
          )}
          <Button
            size={isTablet ? 'sm' : 'md'}
            style={
              !isTablet
                ? { position: 'absolute', top: '8px', right: '8px' }
                : {}
            }
            onClick={handleClose}
          >
            <CloseIcon width={16} height={16} />
          </Button>
        </MarkerTitle>
        {state.markerContent.option && (
          <MarkerComponent
            markerId={state.markerContent.markerId}
            option={state.markerContent.option}
            {...PDFMarkerProps}
          />
        )}

        <HideBox>
          <LhBrandLogo width={30} height={20} />
          <span>LH집속속</span>
          <span className='service-badge'>Service</span>
        </HideBox>
      </Root>
    </>
  );
}

export default PopUp;
