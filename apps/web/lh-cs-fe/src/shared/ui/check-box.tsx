import { Checkbox, CheckboxProps, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

interface CustomCheckBoxProps extends Omit<CheckboxProps, 'size'> {
  label?: string;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  labelColor?: string;
  labelJustifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around';
  labelFontSize?: string | number;
}

// 커스텀 체크박스 스타일링
const StyledCheckbox = styled(Checkbox)(() => ({
  padding: 0,
  width: 24,
  height: 24,

  '&:hover': {
    backgroundColor: 'transparent',
  },

  // Ripple 효과 제거
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
}));

interface IconProps {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  isHovered?: boolean;
}

// 커스텀 체크 아이콘
const CheckIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  stroke = '#ffffff',
  fill = '#0055A2',
}) => (
  <svg
    width={width}
    height={height}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect
      width='24'
      height='24'
      rx='4'
      fill={fill}
      style={{ transition: 'fill 0.2s ease' }}
    />
    <path
      d='M6 12L10 16L18 8'
      stroke={stroke}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

// 비체크 아이콘 (투명한 사각형)
const UncheckedIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  stroke = '#9E9E9E',
  isHovered = false,
}) => (
  <svg
    width={width}
    height={height}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect
      x='2'
      y='2'
      width='20'
      height='20'
      rx='4'
      fill={isHovered ? 'rgba(0, 85, 162, 0.10)' : 'transparent'}
      stroke={isHovered ? '#0055A2' : stroke}
      strokeWidth='2'
      style={{ transition: 'stroke 0.2s ease' }}
    />
  </svg>
);

// Label 스타일링
const StyledFormControlLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop) =>
    prop !== 'labelColor' &&
    prop !== 'labelJustifyContent' &&
    prop !== 'labelFontSize',
})<{
  labelColor?: string;
  labelJustifyContent?: string;
  labelFontSize?: string | number;
}>(({ theme, labelColor, labelJustifyContent, labelFontSize }) => ({
  margin: 0,
  gap: '12px',
  cursor: 'pointer',
  justifyContent: labelJustifyContent || 'flex-start',

  '& .MuiFormControlLabel-label': {
    fontFamily: 'inherit',
    fontSize: labelFontSize || '14px',
    fontWeight: 500,
    color: labelColor || theme.palette.grey[600],
    lineHeight: 1.3,
    userSelect: 'none',
    cursor: 'pointer',
  },

  '&.Mui-disabled': {
    cursor: 'not-allowed',
  },

  '&.Mui-disabled .MuiFormControlLabel-label': {
    color: theme.palette.text.disabled,
    opacity: 0.5,
  },
}));

// Hover 상태를 관리하는 래퍼 컴포넌트
const CheckboxWrapper = styled('div')({
  display: 'inline-flex',
  alignItems: 'center',
  position: 'relative',
});

/**
 * 커스텀 체크박스 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <CheckBox checked={isChecked} onChange={handleChange} />
 *
 * // Label과 함께 사용
 * <CheckBox
 *   checked={isChecked}
 *   onChange={handleChange}
 *   label="약관에 동의합니다"
 * />
 *
 * // Label 위치 변경
 * <CheckBox
 *   checked={isChecked}
 *   onChange={handleChange}
 *   label="동의"
 *   labelPlacement="start"
 * />
 *
 * // Disabled 상태
 * <CheckBox
 *   checked={true}
 *   disabled
 *   label="수정 불가"
 * />
 * ```
 */
export const CheckBox: React.FC<CustomCheckBoxProps> = ({
  label,
  labelColor,
  labelPlacement = 'end',
  labelJustifyContent,
  labelFontSize,
  disabled = false,
  checked = false,
  ...checkboxProps
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const checkbox = (
    <CheckboxWrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StyledCheckbox
        {...checkboxProps}
        checked={checked}
        disabled={disabled}
        icon={<UncheckedIcon width={20} height={20} isHovered={isHovered} />}
        checkedIcon={<CheckIcon width={20} height={20} isHovered={isHovered} />}
        disableRipple
      />
    </CheckboxWrapper>
  );

  // Label이 있는 경우 FormControlLabel로 감싸기
  if (label) {
    return (
      <StyledFormControlLabel
        control={checkbox}
        label={label}
        labelPlacement={labelPlacement}
        labelColor={labelColor}
        labelJustifyContent={labelJustifyContent}
        labelFontSize={labelFontSize}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  // Label이 없는 경우 체크박스만 반환
  return checkbox;
};

export default CheckBox;
