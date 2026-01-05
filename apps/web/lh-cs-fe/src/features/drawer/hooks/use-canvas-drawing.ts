import { useRef, useState, useEffect, useCallback } from 'react';
import {
  CanvasToolOptions,
  DRAW_TYPE,
  DrawInfo,
  LINE_STYLE,
  Position,
} from '../model/whiteboard.types';

interface UseCanvasDrawingProps {
  canvasId: string;
  canvasToolOptions: CanvasToolOptions;
}

/**
 * 슬라이드 인덱스에 따라 현재 그리고 있는 그림을 저장해야한다.
 * @returns
 */
const useCanvasDrawing = ({
  canvasId,
  canvasToolOptions,
}: UseCanvasDrawingProps) => {
  // element id 를 받아서 drawing의 대상이 되는 canvas 지정
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    if (canvas && canvas instanceof HTMLCanvasElement) {
      canvasRef.current = canvas;
    }
  }, [canvasId]);

  const getCanvasCaptureImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      return context?.getImageData(0, 0, canvas.width, canvas.height); // 현재 내용 저장
    }
  };

  const resizeCanvas = useCallback(() => {
    const imageData = getCanvasCaptureImage();
    const canvas = canvasRef.current;

    if (canvas) {
      const context = canvas.getContext('2d');

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      if (imageData) {
        context?.putImageData(imageData, 0, 0); // 저장한 내용 복원
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // 초기 사이즈 조정

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);

  const drawStroke = (
    context: CanvasRenderingContext2D | null,
    lastPosition: Position,
    calcPosition: Position,
    options: CanvasToolOptions
  ) => {
    if (!context) return;
    context.beginPath();
    context.moveTo(lastPosition.x, lastPosition.y);
    context.lineTo(calcPosition.x, calcPosition.y);
    context.strokeStyle = options.penColor;
    context.lineWidth = options.penWidth;

    context.setLineDash(options.lineStyle === LINE_STYLE.DASHED ? [5, 10] : []);
    context.stroke();
  };

  const startDrawing = (x: number, y: number) => {
    const calcPosition = getCalcPosition(x, y);
    if (!calcPosition) return;

    if (canvasToolOptions.lineStyle !== LINE_STYLE.LINE) {
      setIsDrawing(true);
    }
    setLastPosition({ x: calcPosition.x, y: calcPosition.y });
  };

  const onDrawing = (x: number, y: number) => {
    if ((!isDrawing && !canvasToolOptions.isEraseMode) || !lastPosition) return;

    const calcPosition = getCalcPosition(x, y);
    if (!calcPosition) return;

    const canvasContext = getCanvasContext();
    if (!canvasContext) return;

    if (canvasToolOptions.isEraseMode) {
      canvasContext.context.clearRect(calcPosition.x - 10, y - 10, 20, 20);
    } else {
      drawStroke(
        canvasContext.context,
        lastPosition,
        calcPosition,
        canvasToolOptions
      );
    }

    setLastPosition({ x: calcPosition.x, y: calcPosition.y });
  };

  const stopDrawing = (x: number, y: number) => {
    if (
      canvasToolOptions.lineStyle === LINE_STYLE.LINE &&
      !canvasToolOptions.isEraseMode
    ) {
      if (!lastPosition) return;

      const calcPosition = getCalcPosition(x, y);
      if (!calcPosition) return;

      const canvasContext = getCanvasContext();
      if (!canvasContext) return;

      drawStroke(
        canvasContext.context,
        lastPosition,
        calcPosition,
        canvasToolOptions
      );
    }

    setIsDrawing(false);
    setLastPosition(null);
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    context?.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }, []);

  const convertRatioToCanvasPosition = (position: Position) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const { width, height } = canvas.getBoundingClientRect();
    return { x: position.x * width, y: position.y * height };
  };

  const handleDraw = useCallback(
    (prevDrawInfo: DrawInfo, drawInfo: DrawInfo) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      switch (drawInfo.type) {
        case DRAW_TYPE.DRAW:
          if (drawInfo.options.isEraseMode) {
            const canvasPosition = convertRatioToCanvasPosition(
              drawInfo.position
            );
            context.clearRect(
              canvasPosition.x - 30,
              canvasPosition.y - 30,
              30,
              30
            );
          } else {
            drawStroke(
              context,
              convertRatioToCanvasPosition(prevDrawInfo.position),
              convertRatioToCanvasPosition(drawInfo.position),
              drawInfo.options
            );
          }
          return;

        case DRAW_TYPE.STOP:
          if (drawInfo.options.isEraseMode) {
            const canvasPosition = convertRatioToCanvasPosition(
              drawInfo.position
            );
            context.clearRect(
              canvasPosition.x - 30,
              canvasPosition.y - 30,
              30,
              30
            );
          } else {
            drawStroke(
              context,
              convertRatioToCanvasPosition(prevDrawInfo.position),
              convertRatioToCanvasPosition(drawInfo.position),
              drawInfo.options
            );
          }
          return;

        case DRAW_TYPE.CLEAR:
          clearCanvas();
          return;
        default:
          return;
      }
    },
    [clearCanvas, convertRatioToCanvasPosition, drawStroke]
  );

  const redraw = useCallback(
    (drawStack: DrawInfo[][]) => {
      if (!drawStack) {
        return;
      }
      clearCanvas();

      for (let i = 0; i < drawStack.length; i++) {
        const stack = drawStack[i];
        for (let j = 1; j < stack.length; j++) {
          const drawInfo = stack[j];
          const prevDrawInfo = stack[j - 1];
          handleDraw(prevDrawInfo, drawInfo);
        }
      }
    },
    [clearCanvas, handleDraw]
  );

  const undo = useCallback(
    (drawStack: DrawInfo[][], redoStack: DrawInfo[][]) => {
      const lastDraw = drawStack.pop();
      if (lastDraw) {
        redoStack.push(lastDraw);
        redraw(drawStack);
      }
    },
    [redraw]
  );

  const redo = useCallback(
    (drawStack: DrawInfo[][], redoStack: DrawInfo[][]) => {
      const lastDraw = redoStack.pop();
      if (lastDraw) {
        drawStack.push(lastDraw);
        redraw(drawStack);
      }
    },
    [redraw]
  );

  const getCalcPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const calcX: number = x;
    const calcY: number = y;

    return { x: calcX, y: calcY };
  };

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    return { canvas: canvas, context: canvas.getContext('2d')! };
  }, []);

  return {
    isDrawing,
    getCanvasCaptureImage,
    startDrawing,
    onDrawing,
    stopDrawing,
    clearCanvas,
    redraw,
    undo,
    redo,
  };
};

export default useCanvasDrawing;
