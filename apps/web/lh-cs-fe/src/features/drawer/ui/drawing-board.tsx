import styled from '@emotion/styled';
import { useCallback, useEffect, useRef } from 'react';
import DrawingCanvas from './drawing-canvas.tsx';
// import ImageUploader from './ImageUploader.tsx';
// import UploadImgBtn from '../molecule/UploadImgBtn.tsx';
// import SlideItem from '../molecule/SlideItem.tsx';

import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { PublishMessage } from '../model/whiteboard.types.ts';
import DrawingToolBox from './drawing-tool-box.tsx';

import {
  backgroundImageCanvasId,
  drawingCanvasId,
} from '../model/whiteboard.constants.ts';
import useSlideStore from '../model/use-slide-store.ts';

interface AspectRatioConfig {
  width: number;
  height: number;
}

interface DrawingBoardProps {
  isDrawingMode: boolean;
  userMode?: UserRoleEnum;
  publish: (message: PublishMessage) => void;
  drawingMessage?: string | null;
  isConnected?: boolean;
  onMessageProcessed?: () => void;
  onStepBack?: (isDrawingMode: boolean) => void;
  children?: React.ReactNode; // 외부에서 전달받을 컴포넌트
  isHidden: boolean;
  aspectRatio?: AspectRatioConfig; // 선택적 비율 설정
  fillScreen?: boolean; // 전체 화면 모드 명시적 제어 (기본값: true)
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
`;

const ContentsWrapper = styled.div<{ $isFullScreen: boolean }>`
  position: relative;
  width: ${(props) => (props.$isFullScreen ? '100%' : '100%')};
  height: ${(props) => (props.$isFullScreen ? '100%' : '100%')};
  transform: ${(props) => (props.$isFullScreen ? 'none' : 'scale(1)')};
  transform-origin: center center; /* scale 기준점을 설정 */
  background: url('/bg-whiteboarddot.png') no-repeat center center;
  background-size: cover;
`;

export default function DrawingBoard({
  publish,
  drawingMessage,
  isConnected = false,
  isDrawingMode,
  userMode,
  onMessageProcessed,
  onStepBack,
  isHidden,
  aspectRatio,
  fillScreen = false,
}: DrawingBoardProps) {
  const { clear } = useSlideStore();

  const rootWrapRef = useRef<HTMLDivElement | null>(null);
  const contentsRef = useRef<HTMLDivElement | null>(null);

  /**
   * @return {function()} 현재 화면의 크기대로 frame을 조정하는 함수
   * @useCallback 컴포넌트 재렌더링 시 매번 새롭게 생성되는 함수 및 함수가 props로 전달된 자식 컴포넌트들의 불필요한 재렌더링 방지
   *              의존성이 변경되지 않는 한 함수 참조가 유지되도록 보장한다.
   */
  const changeScaleWhenResizing = useCallback(() => {
    if (!rootWrapRef.current || !contentsRef.current) return;

    const rootWidth = rootWrapRef.current.clientWidth;
    const rootHeight = rootWrapRef.current.clientHeight;

    // 전체 화면 모드이거나 aspectRatio가 없는 경우
    if (fillScreen || !aspectRatio) {
      contentsRef.current.style.width = '100%';
      contentsRef.current.style.height = '100%';
      contentsRef.current.style.transform = 'none';

      const backgroundCanvas = document.getElementById(backgroundImageCanvasId);
      const drawingCanvas = document.getElementById(drawingCanvasId);

      if (backgroundCanvas instanceof HTMLCanvasElement) {
        backgroundCanvas.width = rootWidth;
        backgroundCanvas.height = rootHeight;
      }
      if (drawingCanvas instanceof HTMLCanvasElement) {
        drawingCanvas.width = rootWidth;
        drawingCanvas.height = rootHeight;
      }
      return;
    }

    // 커스텀 비율 모드
    const standardWidth = aspectRatio.width;
    const standardHeight = aspectRatio.height;

    // 화면의 가로/세로 비율
    const screenRatio = rootWidth / rootHeight;
    const standardRatio = standardWidth / standardHeight;

    let contentsWidth: number, contentsHeight: number;

    // 화면 비율과 기준 비율을 비교하여 크기 결정
    if (screenRatio > standardRatio) {
      // 화면이 더 넓은 경우: 높이를 기준으로 설정
      contentsHeight = rootHeight;
      contentsWidth = rootHeight * standardRatio;
    } else {
      // 화면이 더 높은 경우: 너비를 기준으로 설정
      contentsWidth = rootWidth;
      contentsHeight = rootWidth / standardRatio;
    }

    // 설정한 크기를 contentsRef에 적용
    contentsRef.current.style.width = `${contentsWidth}px`;
    contentsRef.current.style.height = `${contentsHeight}px`;

    // scale 적용 (비율 유지)
    const widthScale = rootWidth / contentsWidth;
    const heightScale = rootHeight / contentsHeight;
    const scale = Math.min(widthScale, heightScale);

    contentsRef.current.style.transform = `scale(${scale})`;

    const backgroundCanvas = document.getElementById(backgroundImageCanvasId);
    const drawingCanvas = document.getElementById(drawingCanvasId);

    if (backgroundCanvas instanceof HTMLCanvasElement) {
      backgroundCanvas.width = contentsWidth;
      backgroundCanvas.height = contentsHeight;
    }
    if (drawingCanvas instanceof HTMLCanvasElement) {
      drawingCanvas.width = contentsWidth;
      drawingCanvas.height = contentsHeight;
    }
  }, [aspectRatio, fillScreen]);

  useEffect(() => {
    window.addEventListener('resize', changeScaleWhenResizing);

    //초기 실행
    changeScaleWhenResizing();

    //리스너 제거거
    return () => {
      window.removeEventListener('resize', changeScaleWhenResizing);
    };
  }, [changeScaleWhenResizing]);

  const isFullScreen = fillScreen || !aspectRatio;

  return (
    <Wrapper ref={rootWrapRef}>
      <ContentsWrapper
        id='contents-wrapper'
        ref={contentsRef}
        $isFullScreen={isFullScreen}
      >
        {isDrawingMode && userMode === UserRoleEnum.ADMIN && (
          <DrawingToolBox
            isToolboxVisible={isDrawingMode}
            onStepBack={() => {
              if (onStepBack) {
                onStepBack(!isDrawingMode);
                clear();
              }
            }}
            isHidden={isHidden}
          />
        )}

        <DrawingCanvas
          publish={publish}
          drawingMessage={drawingMessage}
          onMessageProcessed={onMessageProcessed}
          isConnected={isConnected}
        />
      </ContentsWrapper>
    </Wrapper>
  );
}
