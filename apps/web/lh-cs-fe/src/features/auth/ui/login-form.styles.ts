import { BASE_FONT_FAMILY } from '@/shared/ui';
import styled from '@emotion/styled';
import { Alert, Box, TextField } from '@mui/material';

export const LoginFormContainer = styled.form`
  width: 100%;
`;

export const FormStack = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const InputStack = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    font-weight: 400;

    & input {
      padding: 16px 12px;
      line-height: 24px;
    }

    & fieldset {
      border-color: #0000003b;
    }

    &:hover fieldset {
      border-color: #000000;
    }

    &.Mui-focused fieldset {
      border-color: #0055a2;
      border-width: 2px;
    }
  }

  & .MuiInputLabel-root {
    font-family: 'Roboto', sans-serif;
    font-size: 12px;
    font-weight: 400;
    line-height: 12px;

    &.Mui-focused {
      color: #0055a2;
    }
  }
`;

export const LoginButton = styled.button`
  border: none;
  cursor: pointer;
  width: 100%;
  border-radius: var(--borderRadius, 4px);
  background: var(--LH_primary, #0055a2);
  box-shadow:
    0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);

  display: flex;
  padding: 8px 22px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: stretch;

  font-family: '${BASE_FONT_FAMILY}';
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.46px;
  text-transform: uppercase;
  line-height: 26px;
  color: white;

  &:hover:not(:disabled) {
    background: #004080;
    box-shadow:
      0 2px 4px -1px rgba(0, 0, 0, 0.2),
      0 4px 5px 0 rgba(0, 0, 0, 0.14),
      0 1px 10px 0 rgba(0, 0, 0, 0.12);
  }

  &:active:not(:disabled) {
    background: #003366;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const ErrorAlert = styled(Alert)`
  width: 100%;
`;
