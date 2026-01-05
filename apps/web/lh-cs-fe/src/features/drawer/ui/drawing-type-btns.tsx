import { BrushIcon, DashIcon, LineupRightIcon } from '@/shared/ui';
import useCanvasStore from '../model/use-canvas-store';
import { LINE_STYLE } from '../model/whiteboard.types';
import { StyledCircleBtn } from './styled-circle-btn';

const DrawingTypeBtns = () => {
  const { canvasToolOptions, setCanvasToolOptions } = useCanvasStore();

  const handleDrawingTypeClick = (type: LINE_STYLE) => {
    setCanvasToolOptions({
      ...canvasToolOptions,
      lineStyle: type,
      isEraseMode: false, // 드로잉 타입 선택 시 지우개 모드 비활성화
    });
  };

  return (
    <div className='mx-1 ml-2 flex gap-1'>
      <StyledCircleBtn
        $width={40}
        $border
        $shadow
        $isSelected={
          !canvasToolOptions.isEraseMode &&
          canvasToolOptions.lineStyle === LINE_STYLE.SOLID
        }
        onClick={() => handleDrawingTypeClick(LINE_STYLE.SOLID)}
      >
        <BrushIcon
          width={16}
          height={16}
          color={
            !canvasToolOptions.isEraseMode &&
            canvasToolOptions.lineStyle === LINE_STYLE.SOLID
              ? '#FFFFFF'
              : '#333333'
          }
        />
      </StyledCircleBtn>

      <StyledCircleBtn
        $width={40}
        $border
        $shadow
        $isSelected={
          !canvasToolOptions.isEraseMode &&
          canvasToolOptions.lineStyle === LINE_STYLE.DASHED
        }
        onClick={() => handleDrawingTypeClick(LINE_STYLE.DASHED)}
      >
        <DashIcon
          width={20}
          height={20}
          color={
            !canvasToolOptions.isEraseMode &&
            canvasToolOptions.lineStyle === LINE_STYLE.DASHED
              ? '#FFFFFF'
              : '#333333'
          }
        />
      </StyledCircleBtn>

      <StyledCircleBtn
        $width={40}
        $border
        $shadow
        $isSelected={
          !canvasToolOptions.isEraseMode &&
          canvasToolOptions.lineStyle === LINE_STYLE.LINE
        }
        onClick={() => handleDrawingTypeClick(LINE_STYLE.LINE)}
      >
        <LineupRightIcon
          width={20}
          height={20}
          color={
            !canvasToolOptions.isEraseMode &&
            canvasToolOptions.lineStyle === LINE_STYLE.LINE
              ? '#FFFFFF'
              : '#333333'
          }
        />
      </StyledCircleBtn>
    </div>
  );
};

export default DrawingTypeBtns;
