import { styled, TextField } from '@mui/material';
import { BASE_FONT_FAMILY } from '../typography';
export const FormField = styled('div')<{ width?: string }>`
  display: flex;
  align-items: center;
  width: ${({ width }) => width || '100%'};
`;
export const FieldLabel = styled('label')`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  color: #111111;
  width: 96px;
  flex-shrink: 0;
`;
export const LabelText = styled('label')<{ width?: number }>`
  width: ${({ width }) => (width ? `${width}px` : '80px')};
  font-size: 14px;
  font-weight: 600;
  color: #333;
  font-family: inherit;
`;

// ✅ 커스텀 Props 타입 정의
interface CommonTextFieldProps {
  padding?: string;
  maxWidth?: string;
}

export const CommonTextField = styled(TextField)<CommonTextFieldProps>(
  ({ padding, maxWidth }) => ({
    fontSize: 16,
    fontWeight: 500,
    flex: '1 0 0',
    fontFamily: BASE_FONT_FAMILY,
    width: '100%',

    // ✅ padding props 적용
    ...(padding && {
      '& .MuiInputBase-input': {
        padding,
      },
    }),

    // ✅ maxWidth props 적용
    ...(maxWidth && {
      maxWidth,
    }),
    '& .MuiFormHelperText-root': {
      position: 'absolute',
      bottom: '-22px',
      margin: '3px 0 0 0',
      fontFamily: 'inherit',
      letterSpacing: '0.4px',
    },
  })
);
