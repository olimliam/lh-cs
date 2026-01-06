import {
  Button,
  CountdownText,
  DialogPopup,
  DialogPopupHeader,
} from '@/shared/ui';
import { CommonTextField } from '@/shared/ui/input/input.styles';
import { media } from '@/shared/utils/device-util';
import styled from '@emotion/styled';
import { CircularProgress, DialogActions, Typography } from '@mui/material';

const ModalContent = styled.div`
  font-family: 'Pretendard';
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;

  ${media.tablet`
    padding: 20px;
    gap: 16px;
  `}
`;

interface VerifySmsDialogProps {
  open: boolean;
  phoneNumberDisplay: string;
  verificationCode: string;
  verificationError: string;
  isCountdownActive: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  isSendCodePending: boolean;
  isVerifyPending: boolean;
  onChangeVerificationCode: (value: string) => void;
  onResendCode: () => void;
  onCancel: () => void;
  onVerify: () => void;
}

export const VerifySmsDialog = ({
  open,
  phoneNumberDisplay,
  verificationCode,
  verificationError,
  isCountdownActive,
  timeLeft,
  formatTime,
  isSendCodePending,
  isVerifyPending,
  onChangeVerificationCode,
  onResendCode,
  onCancel,
  onVerify,
}: VerifySmsDialogProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onVerify();
    }
  };
  return (
    <DialogPopup
      isOpen={open}
      onClose={onCancel}
      modalSize={{ width: 428, height: 'auto' }}
    >
      <ModalContent>
        <DialogPopupHeader
          titleComponent={<>SMS 인증</>}
          subTitleComponent={
            <>
              보안 강화를 위해 2차 인증을 진행합니다. <br />
              전화번호로 발송된 <b>인증번호를 입력</b>해 주세요.
            </>
          }
          onClose={onCancel}
        />
        <Typography
          variant='subtitle2'
          color='text.primary'
          sx={{ fontFamily: 'inherit' }}
        >
          인증 번호 수신 번호: {phoneNumberDisplay}
        </Typography>

        <div className='flex items-center gap-3'>
          <CommonTextField
            placeholder='인증번호를 입력하세요. (3분 이내)'
            value={verificationCode}
            onChange={(event) =>
              onChangeVerificationCode(
                event.target.value.replace(/[^0-9]/g, '').slice(0, 6)
              )
            }
            onKeyDown={(e) => handleKeyDown(e)}
            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            helperText={verificationError}
            error={Boolean(verificationError)}
            autoFocus
          />
          {isCountdownActive && timeLeft > 0 ? (
            <CountdownText bgColor='rgba(0, 85, 162, 0.05)'>
              {formatTime(timeLeft)}
            </CountdownText>
          ) : (
            <Button
              variant='opacityPrimary'
              size={'sm'}
              onClick={onResendCode}
              disabled={isSendCodePending}
            >
              {isSendCodePending ? (
                <CircularProgress size={16} sx={{ color: '#0055a2' }} />
              ) : (
                '인증번호 재전송'
              )}
            </Button>
          )}
        </div>

        <DialogActions sx={{ justifyContent: 'center', gap: 3, padding: 0 }}>
          <Button
            fullWidth
            variant='outlinePrimary'
            size={'md'}
            onClick={onCancel}
            color='inherit'
          >
            취소
          </Button>
          <Button
            className='!ml-0'
            fullWidth
            variant='primary'
            onClick={onVerify}
            disabled={isVerifyPending || verificationCode.length !== 6}
          >
            {isVerifyPending ? (
              <CircularProgress size={18} sx={{ color: '#ffffff' }} />
            ) : (
              '확인'
            )}
          </Button>
        </DialogActions>
      </ModalContent>
    </DialogPopup>
  );
};
