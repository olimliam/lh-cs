import { ButtonProps } from '@mui/material';
import { StyledLineBtn, StyledLineBtnInnerSpan } from './styled-line-btn';

const StrokeTypeBtn = (
  props: {
    isSelected: boolean;
    strokeHeight: number;
  } & ButtonProps
) => {
  return (
    <StyledLineBtn $isSelected={props.isSelected} {...props}>
      <StyledLineBtnInnerSpan
        $strokeHeight={props.strokeHeight}
        $isSelected={props.isSelected}
      />
    </StyledLineBtn>
  );
};

export default StrokeTypeBtn;
