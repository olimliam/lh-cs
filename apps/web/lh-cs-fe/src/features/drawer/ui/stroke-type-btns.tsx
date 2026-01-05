import { useState } from 'react';
import { PEN_WIDTH } from '../model/whiteboard.types';
import useCanvasStore from '../model/use-canvas-store';
import StrokeTypeBtn from './stroke-type-btn';

const StrokeTypeBtns = () => {
  const [selectedStroke, setSelectedStroke] = useState<PEN_WIDTH>(
    PEN_WIDTH.LIGHT
  );

  const { canvasToolOptions, setCanvasToolOptions } = useCanvasStore();

  const handleStrokeTypeBtnsClick = (strokeType: PEN_WIDTH) => {
    setCanvasToolOptions({ ...canvasToolOptions, penWidth: strokeType });
  };

  const handleStrokeSelect = (strokeType: PEN_WIDTH) => {
    setSelectedStroke(strokeType);
    handleStrokeTypeBtnsClick(strokeType);
  };

  return (
    <div className='flex flex-col'>
      {[PEN_WIDTH.LIGHT, PEN_WIDTH.NORMAL, PEN_WIDTH.BOLD].map(
        (strokeType: PEN_WIDTH) => (
          <StrokeTypeBtn
            key={'strokeHeight-' + strokeType}
            isSelected={selectedStroke === strokeType}
            strokeHeight={strokeType}
            onClick={() => handleStrokeSelect(strokeType)}
          />
        )
      )}
    </div>
  );
};

export default StrokeTypeBtns;
