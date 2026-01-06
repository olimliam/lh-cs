import { RadioGroup, FormControlLabel, Radio } from '@mui/material';
import styled from '@emotion/styled';

// ✅ 1. 라디오 옵션 타입 (범용)
export interface RadioOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// ✅ 2. 범용 Props 타입 정의
export interface RadioInputProps<T = string> {
  /**
   * 필드 이름 (aria-labelledby와 onChange에서 사용)
   * @example fieldName="role"
   */
  fieldName: string;

  /**
   * 현재 선택된 값
   */
  value: T;

  /**
   * 라디오 버튼 옵션 배열
   */
  options: ReadonlyArray<RadioOption<T>>;

  /**
   * 값 변경 콜백
   * @param fieldName - 변경된 필드명
   * @param value - 새로운 값
   */
  onChange: (fieldName: string, value: T) => void;

  /**
   * 비활성화 여부
   */
  disabled?: boolean;

  /**
   * 라디오 그룹 방향
   * @default "row"
   */
  direction?: 'row' | 'column';

  /**
   * 커스텀 gap 값
   * @default "32px"
   */
  gap?: string;

  /**
   * 접근성 라벨 ID
   * @default `${fieldName}-label`
   */
  ariaLabelledBy?: string;
}

// ✅ 라디오 그룹 스타일
const RadioGroupWrapper = styled(RadioGroup)<{ gap?: string }>`
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.gap || '32px'};
  margin: 0;
  /* width: 200px; */
`;

// ✅ 라디오 라벨 스타일
const StyledFormControlLabel = styled(FormControlLabel)`
  width: 92px;
  margin: 0;

  .MuiRadio-root {
    padding: 0;
    margin-right: 8px;
    color: #727171;

    &.Mui-checked {
      color: #0066cc;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .MuiTypography-root {
    font-family: 'Pretendard', sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: #111111;
    letter-spacing: 0.15px;
    margin-left: 0;
  }

  &:hover .MuiRadio-root {
    color: #0066cc;
    background-color: rgba(0, 102, 204, 0.04);
  }
`;
// interface RadioInputProps {
//   formValue?: UserRoleEnum;
//   valueArr: Options[]
//   handleInputChange: (
//       field: keyof AdminProfileFormData,
//       value: File | UserRoleEnum | string | null
//     ) => void;
//   isSubmitting?: boolean;
// }

export const RadioInput = <T extends string | number | boolean>({
  fieldName,
  value,
  options,
  onChange,
  disabled = false,
  direction = 'row',
  ariaLabelledBy,
  gap,
}: RadioInputProps<T>): React.ReactElement => {
  // ✅ 라디오 값 변경 핸들러
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value as T;
    onChange(fieldName, newValue);
  };
  return (
    <RadioGroupWrapper
      value={value ?? ''}
      gap={gap}
      onChange={handleChange}
      row={direction === 'row'}
      aria-labelledby={ariaLabelledBy || `${fieldName}-label`}
    >
      {options.map((option) => (
        <StyledFormControlLabel
          key={String(option.value)}
          value={option.value}
          control={<Radio />}
          label={option.label}
          disabled={disabled || option.disabled}
        />
      ))}
    </RadioGroupWrapper>
  );
};
