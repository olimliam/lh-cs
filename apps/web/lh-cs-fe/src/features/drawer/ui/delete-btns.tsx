import { EraserIcon, TrashIcon } from '@/shared/ui';
import useCanvasStore from '../model/use-canvas-store';
import useSlideStore from '../model/use-slide-store';
import { StyledCircleBtn } from './styled-circle-btn';

const DeleteBtns = () => {
  const { canvasToolOptions, setCanvasToolOptions } = useCanvasStore();
  const { clear } = useSlideStore();

  const handleEraseClick = () => {
    if (canvasToolOptions.isEraseMode) {
      // 지우개 모드 비활성화 - 이전 드로잉 타입으로 복원
      setCanvasToolOptions({
        ...canvasToolOptions,
        isEraseMode: false,
        lineStyle:
          canvasToolOptions.previousLineStyle || canvasToolOptions.lineStyle,
      });
    } else {
      // 지우개 모드 활성화 - 현재 드로잉 타입 저장하고 지우개 모드 활성화
      setCanvasToolOptions({
        ...canvasToolOptions,
        isEraseMode: true,
        previousLineStyle: canvasToolOptions.lineStyle,
      });
    }
  };

  return (
    <div className='mx-2 flex gap-1'>
      <StyledCircleBtn
        $width={40}
        $border
        $shadow
        $isSelected={false}
        onClick={() => {
          clear();
        }}
      >
        <TrashIcon />
      </StyledCircleBtn>
      <StyledCircleBtn
        $width={40}
        $border
        $shadow
        $isSelected={canvasToolOptions.isEraseMode}
        onClick={() => handleEraseClick()}
      >
        <EraserIcon
          color={canvasToolOptions.isEraseMode ? '#FFFFFF' : '#333333'}
        />
      </StyledCircleBtn>
    </div>
  );
};

export default DeleteBtns;
