import React, { useEffect, useMemo, useRef } from 'react';
import useCanvasDrawing from '../hooks/use-canvas-drawing';
import { SlideItemDto } from '../model/slide-item.dto';
import useCanvasStore from '../model/use-canvas-store';
import useSlideStore from '../model/use-slide-store';
import { drawingCanvasId } from '../model/whiteboard.constants';
import { DRAW_TYPE, DrawInfo, PublishMessage } from '../model/whiteboard.types';

interface DrawingCanvasProps {
  publish: (message: PublishMessage) => void;
  isConnected?: boolean;
  drawingMessage?: string | null;
  onMessageProcessed?: () => void;
}

export default function DrawingCanvas({
  publish,
  isConnected = false,
  drawingMessage,
  onMessageProcessed,
}: DrawingCanvasProps) {
  const { canvasToolOptions } = useCanvasStore();
  const { slideList, setSlideList } = useSlideStore();
  const { isDrawing, startDrawing, onDrawing, stopDrawing, redraw } =
    useCanvasDrawing({
      canvasId: drawingCanvasId,
      canvasToolOptions: canvasToolOptions,
    });
  const drawStackRef = useRef<DrawInfo[][]>([]);
  const stackRef = useRef<DrawInfo[]>([]);
  const isInitialized = useRef(false);

  // 메시지 처리 함수
  const handleMessage = (message: string) => {
    // console.log('Received message in DrawingCanvas:', message);
    try {
      const data = JSON.parse(message);
      // console.log('Parsed data:', data);
      switch (data.type) {
        case DRAW_TYPE.SLIDE_LIST:
          // console.log('Updating slide list with received data:', data.data);
          setSlideList(data.data);
          return;
        case DRAW_TYPE.IMAGE_UPDATE:
          // console.log('Updating image for slide:', data.slideId);
          setSlideList(
            slideList.map((slide) =>
              slide.id === data.slideId
                ? { ...slide, image: data.imageUrl || data.imageData }
                : slide
            )
          );
          return;
        default:
          console.log('Unknown message type:', data.type);
          return;
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  // TourViewer에서 전달받은 그림 메시지 처리
  useEffect(() => {
    if (drawingMessage) {
      // console.log(
      //   'Processing drawing message in DrawingCanvas:',
      //   drawingMessage
      // );
      handleMessage(drawingMessage);
      // 메시지 처리 완료를 TourViewer에 알림
      if (onMessageProcessed) {
        onMessageProcessed();
      }
    }
  }, [drawingMessage, onMessageProcessed]);

  // 연결 성공 시 서버에서 현재 상태 요청
  useEffect(() => {
    if (isConnected && !isInitialized.current) {
      console.log('Connected to server, requesting current state...');

      // 서버에 현재 상태 요청
      publish({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: 'REQUEST_CURRENT_STATE' as any,
        data: [],
      });

      isInitialized.current = true;
    }
  }, [isConnected, publish]);

  // 현재 슬라이드 전체 객체
  const currentSlide = useMemo(() => {
    return slideList.find((slide) => slide.isSelected);
  }, [slideList]);

  // drawStack이 실제로 변경되었을 때만 redraw 실행
  const drawStackStringified = useMemo(() => {
    return currentSlide?.drawStack
      ? JSON.stringify(currentSlide.drawStack)
      : '';
  }, [currentSlide?.drawStack]);

  const redrawRef = useRef(redraw);

  // redraw 함수가 변경될 때마다 ref 업데이트
  useEffect(() => {
    redrawRef.current = redraw;
  }, [redraw]);

  useEffect(() => {
    if (currentSlide?.drawStack) {
      redrawRef.current(currentSlide.drawStack);
      drawStackRef.current = currentSlide.drawStack;
    }
  }, [currentSlide, drawStackStringified]); // redraw 의존성 완전히 제거

  const slideRef = useRef<SlideItemDto[]>([]);

  useEffect(() => {
    const slideValueChanged =
      JSON.stringify(slideRef.current) !== JSON.stringify(slideList);

    if (slideValueChanged) {
      // 실시간 동기화에는 thumbnail, image 제외하여 네트워크 트래픽 최소화
      const lightweightSlideList = slideList.map((slide) => ({
        id: slide.id,
        isSelected: slide.isSelected,
        drawStack: slide.drawStack,
        redoStack: slide.redoStack,
        // thumbnail과 image는 제외 (별도 전송)
      }));

      publish({
        type: DRAW_TYPE.SLIDE_LIST,
        data: lightweightSlideList,
      });
      slideRef.current = [...slideList];
    }
  }, [slideList, publish]);

  const getRatioPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.nativeEvent.layerX / rect.width;
    const y = e.nativeEvent.layerY / rect.height;
    return { x, y };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const x = e.nativeEvent.layerX;
    const y = e.nativeEvent.layerY;

    startDrawing(x, y);

    stackRef.current.push({
      type: DRAW_TYPE.START,
      position: getRatioPosition(e),
      options: canvasToolOptions,
    });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const x = e.nativeEvent.layerX;
    const y = e.nativeEvent.layerY;

    onDrawing(x, y);

    if (isDrawing || canvasToolOptions.isEraseMode) {
      stackRef.current.push({
        type: DRAW_TYPE.DRAW,
        position: getRatioPosition(e),
        options: canvasToolOptions,
      });
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const x = e.nativeEvent.layerX;
    const y = e.nativeEvent.layerY;
    stopDrawing(x, y);

    stackRef.current.push({
      type: DRAW_TYPE.STOP,
      position: getRatioPosition(e),
      options: canvasToolOptions,
    });

    drawStackRef.current.push(stackRef.current);

    stackRef.current = [];

    setSlideList(
      slideList.map((slide) => {
        if (slide.isSelected) {
          return {
            ...slide,
            drawStack: [...drawStackRef.current],
          };
        } else {
          return slide;
        }
      })
    );
  };

  // useEffect(() => {
  //   // const imageUrl = getCurrentSlide()?.image;
  //   const backgroundCanvas = document.getElementById(
  //     backgroundImageCanvasId
  //   ) as HTMLCanvasElement | null;

  //   const drawingCanvas = document.getElementById(
  //     drawingCanvasId
  //   ) as HTMLCanvasElement | null;

  //   if (backgroundCanvas && imageUrl) {
  //     const ctx = backgroundCanvas.getContext('2d');
  //     const img = new Image();
  //     img.src = imageUrl;

  //     img.onload = () => {
  //       const drawingCanvasRect = drawingCanvas.getBoundingClientRect();

  //       backgroundCanvas.width = drawingCanvasRect.width;
  //       backgroundCanvas.height = drawingCanvasRect.height;

  //       const scale = Math.min(
  //         backgroundCanvas.width / img.width,
  //         backgroundCanvas.height / img.height
  //       );

  //       const imgWidth = img.width * scale;
  //       const imgHeight = img.height * scale;

  //       const dx = (backgroundCanvas.width - imgWidth) / 2;
  //       const dy = (backgroundCanvas.height - imgHeight) / 2;

  //       ctx?.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
  //       ctx?.drawImage(img, dx, dy, imgWidth, imgHeight);
  //     };
  //   }
  // }, [getCurrentSlide()?.image]);

  return (
    <div className={`flex h-full flex-1 flex-row`}>
      <div
        className={`border-1 relative flex w-full items-center justify-center border-solid border-black`}
      >
        <canvas
          id='background-image-canvas'
          className={`absolute left-0 top-0 h-full w-full`}
        />
        <canvas
          id={drawingCanvasId}
          className='absolute left-0 top-0 h-full w-full'
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
      </div>
    </div>
  );
}
