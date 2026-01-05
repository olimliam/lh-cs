import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { BASE_FONT_FAMILY } from '@/shared/ui';
import { media } from '@/shared/utils';
import styled from '@emotion/styled';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { CodeInput } from './code-input';

const logoImg = '/logo/lh-brand-logo.svg';

export interface EnterCodeModalProps {
  open: boolean;
  onSubmit: (enterCode: string) => Promise<void>;
  onClose?: () => void;
  loading?: boolean;
  error?: string;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 0;
    min-width: 100vw;
    height: var(--vh);
    padding: 0;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MainContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 60px;
  align-items: center;
  justify-content: center;
  min-height: 500px;

  ${media.tablet`
    min-height: 100%;
    justify-content: flex-start;
    padding: 24px;

  gap: 20px;

    `}
`;

const HeaderSection = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 36px;
  align-items: center;
  text-align: center;

  ${media.tablet`
    justify-content: flex-start;
  `}
`;

const LogoContainer = styled(Box)`
  height: 160px;
  width: 240px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ${media.tablet`
    height: 72px;
    font-size: 108px;
  `}
`;

const CodeInputSection = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;

  ${media.tablet`
    gap: 12px;
  `}
`;

const CodeInputsContainer = styled(Box)`
  display: flex;
  gap: 30px;
  align-items: center;

  ${media.tablet`
    gap: 12px;
  `}
`;

export const StyledCodeInput = styled(CodeInput)`
  box-sizing: border-box;
  --focus-bw: 4px;

  width: 96px;
  height: 96px;
  border-radius: 8px;

  border: var(--focus-bw) solid transparent;
  box-shadow: inset 0 0 0 1px rgba(51, 51, 51, 0.3);

  background: transparent;
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 36px;
  text-align: center;
  color: #000;
  outline: none;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;

  &:focus {
    border-color: #0055a2;
    box-shadow: none;
  }

  &[data-focused='true'] {
    border-color: #0055a2;
    box-shadow: none;
  }

  &[data-has-value='true'] {
    background: #eeeeee;
  }

  &::placeholder {
    color: transparent;
  }

  ${media.tablet`
    --focus-bw: 2px;
    width: 60px;
    height: 60px;
    font-size: 28px;
  `}
`;
const SubmitButton = styled(Button)`
  background: #0055a2;
  color: white;
  border-radius: 4px;
  padding: 16px 20px;
  width: 100%;
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.46px;
  text-transform: uppercase;

  &:hover {
    background: rgba(0, 85, 162, 0.8);
  }

  &:disabled {
    background: rgba(0, 85, 162, 0.2);
    color: rgba(0, 85, 162, 0.3);
  }

  ${media.tablet`
    position: fixed;
    bottom: 0;
    border-radius: 0px;
  `}
`;

export const EnterCodeModal: React.FC<EnterCodeModalProps> = ({
  open,
  onSubmit,
  onClose,
  loading = false,
  error,
}) => {
  const [codes, setCodes] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const toastMessages = useToastMessages();

  // Focus first input when modal opens
  useEffect(() => {
    if (open && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
        setFocusedIndex(0);
      }, 100);
    }
  }, [open]);

  // 다음 빈 input으로 포커스 이동하는 함수
  const focusNextEmptyInput = () => {
    const firstEmptyIndex = codes.findIndex((code) => code === '');
    const targetIndex =
      firstEmptyIndex === -1 ? codes.length - 1 : firstEmptyIndex;

    if (inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex]?.focus();
      setFocusedIndex(targetIndex);
    }
  };

  // 화면 클릭 시 다음 빈 input으로 포커스
  const handleContainerClick = (e: React.MouseEvent) => {
    // input 요소를 클릭한 경우가 아닐 때만 포커스 이동
    if (!(e.target as HTMLElement).matches('input')) {
      focusNextEmptyInput();
    }
  };

  const handleInputChange = (index: number, value: string) => {
    // Get the last character typed or pasted
    const lastChar = value.slice(-1);

    // If empty, allow clearing
    if (value === '') {
      const newCodes = [...codes];
      newCodes[index] = '';
      setCodes(newCodes);
      return;
    }

    // Check if Korean character was entered first
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(lastChar) || !/^[a-zA-Z0-9]$/.test(lastChar)) {
      console.log('Invalid character entered:', lastChar);
      toastMessages.showOnlyEnglishOrNumberAllowed();
      return;
    }

    const newCodes = [...codes];
    newCodes[index] = lastChar.toUpperCase();
    setCodes(newCodes);

    // Auto move to next input if character was entered
    if (lastChar && index < 3) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }, 0);
    }
  };

  const handleKeyDown = (_: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      // 마지막으로 채워진 input 찾아서 삭제
      let lastFilledIndex = -1;
      for (let i = codes.length - 1; i >= 0; i--) {
        if (codes[i] !== '') {
          lastFilledIndex = i;
          break;
        }
      }

      if (lastFilledIndex >= 0) {
        const newCodes = [...codes];
        newCodes[lastFilledIndex] = '';
        setCodes(newCodes);
        inputRefs.current[lastFilledIndex]?.focus();
        setFocusedIndex(lastFilledIndex);
      }
    } else if (e.key === 'Enter') {
      // Submit on Enter if all fields are filled
      const enterCode = codes.join('');
      if (enterCode.length === 4) {
        handleSubmit();
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleSubmit = async () => {
    const enterCode = codes.join('');
    if (enterCode.length !== 4 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(enterCode);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;
  const isComplete = codes.every((code) => code !== '');

  const { isTablet } = useDeviceDetector();

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      disableEscapeKeyDown={true}
      maxWidth={false}
      fullScreen
    >
      <DialogContent
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
        onClick={handleContainerClick}
      >
        <MainContainer>
          <HeaderSection>
            <LogoContainer>
              <img src={logoImg} alt='LH Logo' />
            </LogoContainer>
            <Typography
              sx={{
                fontFamily: BASE_FONT_FAMILY,
                fontWeight: 700,
                fontSize: isTablet ? '24px' : '36px',
                color: '#58686c',
                textAlign: 'center',
                letterSpacing: '-1.8px',
                lineHeight: 'normal',
              }}
            >
              3D 가상현실 기반 유지보수 상담실
            </Typography>
          </HeaderSection>

          <CodeInputSection>
            <CodeInputsContainer>
              {codes.map((code, index) => (
                <StyledCodeInput
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={code}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => handleFocus(index)}
                  isFocused={focusedIndex === index}
                  hasValue={code !== ''}
                  maxLength={1}
                  disabled={isLoading}
                />
              ))}
            </CodeInputsContainer>

            <Typography
              sx={{
                fontFamily: BASE_FONT_FAMILY,
                fontWeight: 500,
                fontSize: isTablet ? '14px' : '24px',
                color: '#58686c',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              ※ 상담원에게 안내 받은 입장 코드를 입력해 주세요.
            </Typography>

            {error && (
              <Alert severity='error' sx={{ width: '100%', mt: 2 }}>
                {error}
              </Alert>
            )}
          </CodeInputSection>

          <SubmitButton
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            fullWidth
          >
            {isLoading ? '입장 중...' : '입장하기'}
          </SubmitButton>
        </MainContainer>
      </DialogContent>
    </StyledDialog>
  );
};
