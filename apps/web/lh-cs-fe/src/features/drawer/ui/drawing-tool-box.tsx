import styled from '@emotion/styled';
import { useState, useRef, useEffect } from 'react';

import { Divider } from '@mui/material';
// import UnRedoBtns from './UndoBtns';
import ColorChipBtns from './color-chip-btns';
import DeleteBtns from './delete-btns';
import DrawingTypeBtns from './drawing-type-btns';
import StrokeTypeBtns from './stroke-type-btns';
import UnRedoBtns from './un-redo-btns';
import { ArrowBackStepIcon } from '@/shared/ui/icons/arrow-back-step-icon';
import { media } from '@/shared/utils';

const StyledToolBoxWrap = styled.div<{ visible: boolean; isHidden?: boolean }>`
  display: flex;
  align-items: center;
  position: fixed;
  bottom: 58px;
  left: 50%;
  height: 60px;
  transform: translateX(-50%)
    translateY(
      ${({ visible, isHidden }) => {
        if (!visible) return '100px';
        return isHidden ? '60px' : '0';
      }}
    );
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  border: 1px solid #eee;
  // padding: 10px 16px;
  z-index: 200;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
  opacity: ${({ visible, isHidden }) => {
    if (!visible) return 0;
    return isHidden ? 0 : 1;
  }};

  ${media.tablet`
    width: 100%;
    max-width: 360px;
  `}
`;

const StepBackButton = styled.button`
  display: flex;
  padding: 8px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex: 1 0 0;
  align-self: stretch;

  color: #333;

  border-radius: 12px;
  border: 1px solid #eee;

  background: #fff;
  width: 44px;
  height: 44px;

  svg {
    width: 16px;
    height: 16px;
    aspect-ratio: 1/1;
  }
`;

const TotalDrawingBtnWrapper = styled.div<{ isDragging?: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  border-bottom-right-radius: 16px;
  border-top-right-radius: 16px;
  background-color: white;
  padding: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};

  /* 스크롤바 숨기기 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  ${media.tablet`
    max-width: calc(100% - 60px);
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  `}

  @media (max-width: 1024px) {
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }
`;

interface DrawingToolBoxProps {
  isToolboxVisible: boolean;
  onStepBack: () => void;
  isHidden?: boolean;
}

const DrawingToolBox = (props: DrawingToolBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth > 1024) return;

    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || window.innerWidth > 1024) return;

    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // 드래그 속도 조절
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 터치 이벤트 (모바일)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth > 1024) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || window.innerWidth > 1024) return;

    const x = e.touches[0].pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || window.innerWidth > 1024) return;

      e.preventDefault();
      const x = e.pageX - (containerRef.current?.offsetLeft || 0);
      const walk = (x - startX) * 2;
      if (containerRef.current) {
        containerRef.current.scrollLeft = scrollLeft - walk;
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

  return (
    <StyledToolBoxWrap
      visible={props.isToolboxVisible}
      isHidden={props.isHidden}
    >
      <div className='max-tablet:w-[60px] p-[8px]'>
        <StepBackButton onClick={props.onStepBack}>
          <ArrowBackStepIcon width={16} height={14} />
        </StepBackButton>
      </div>

      <TotalDrawingBtnWrapper
        ref={containerRef}
        isDragging={isDragging}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className='flex items-center gap-1'>
          <UnRedoBtns />

          <Divider
            orientation='vertical'
            className='my-[2px]'
            variant='fullWidth'
            flexItem
          />

          <DeleteBtns />

          <Divider
            orientation='vertical'
            className='my-[2px]'
            variant='fullWidth'
            flexItem
          />

          <DrawingTypeBtns />

          <ColorChipBtns />
          <StrokeTypeBtns />
        </div>
      </TotalDrawingBtnWrapper>
    </StyledToolBoxWrap>
  );
};

export default DrawingToolBox;
