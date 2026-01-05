import useSlideStore from '../model/use-slide-store';
import BackIcon from '../../../shared/ui/icons/back-icon';
import { StyledCircleBtn } from './styled-circle-btn';
import { ForwardIcon } from '@/shared/ui';

const UnRedoBtns = () => {
  const { undo, redo, slideList } = useSlideStore();

  console.log('slideList ============>', slideList);
  return (
    <div className='mx-2 flex gap-1'>
      <StyledCircleBtn
        $width={32}
        $border
        $shadow
        onClick={() => undo()}
        $isSelected={false}
        disabled={slideList[0].drawStack.length === 0}
      >
        <BackIcon
          width={18}
          height={18}
          fill={slideList[0].drawStack.length > 0 ? '#333333' : '#ccc'}
        />
      </StyledCircleBtn>
      <StyledCircleBtn
        $width={32}
        $border
        $shadow
        onClick={() => redo()}
        $isSelected={false}
        disabled={slideList[0].redoStack.length === 0}
      >
        <ForwardIcon
          width={18}
          height={18}
          fill={slideList[0].redoStack.length > 0 ? '#333333' : '#ccc'}
        />
      </StyledCircleBtn>
    </div>
  );
};

export default UnRedoBtns;
