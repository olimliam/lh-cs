import { useState } from 'react';
import { PEN_COLOR } from '../model/whiteboard.types';
import useCanvasStore from '../model/use-canvas-store';
import { StyledColorBtn, StyledInnerCircleSpan } from './styled-color-btn';
import { COLOR_CHIP } from '../model/whiteboard.constants';

const ColorChipBtns = () => {
  const { canvasToolOptions, setCanvasToolOptions } = useCanvasStore();

  const handleColorChipClick = (color: PEN_COLOR) => {
    setCanvasToolOptions({ ...canvasToolOptions, penColor: color });
  };

  const [colorDataArr, setColorDataArr] = useState([
    { id: '0', color: PEN_COLOR.BLACK, isSelected: true },
    { id: '1', color: PEN_COLOR.BLUE, isSelected: false },
    { id: '2', color: PEN_COLOR.GREEN, isSelected: false },
    { id: '3', color: PEN_COLOR.YELLOW, isSelected: false },
    { id: '4', color: PEN_COLOR.RED, isSelected: false },
    { id: '5', color: PEN_COLOR.WHITE, isSelected: false },
  ]);

  const handleColorSelect = (selectedColorId: string, color: PEN_COLOR) => {
    setColorDataArr((prevColors) =>
      prevColors.map((item) =>
        item.id === selectedColorId
          ? { ...item, isSelected: true }
          : { ...item, isSelected: false }
      )
    );
    handleColorChipClick(color);
  };

  return (
    <div className='mx-3 grid h-[44px] w-[68px] grid-cols-3 grid-rows-2 items-center justify-items-center gap-1'>
      {colorDataArr.map((item) => (
        <StyledColorBtn
          key={item.id}
          $isSelected={item.isSelected}
          $color={
            COLOR_CHIP[item.color.toUpperCase() as keyof typeof PEN_COLOR]
          }
          onClick={() => handleColorSelect(item.id, item.color)}
        >
          <StyledInnerCircleSpan
            $isSelected={item.isSelected}
            $color={
              COLOR_CHIP[item.color.toUpperCase() as keyof typeof PEN_COLOR]
            }
          />
        </StyledColorBtn>
      ))}
    </div>
  );
};

export default ColorChipBtns;
