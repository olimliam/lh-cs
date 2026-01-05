import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, ExitToApp as ExitIcon } from '@mui/icons-material';
import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '@/shared/ui';

// Styled Components following Figma design (node-id=1061-66816)
const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    border-radius: 12px;
    padding: 8px;
    min-width: 400px;
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px 24px;

  .title-text {
    font-family: ${BASE_FONT_FAMILY};
    font-weight: 600;
    font-size: 18px;
    color: #111111;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const StyledDialogContent = styled(DialogContent)`
  padding: 12px 24px 20px 24px;
`;

const MessageText = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 400;
  font-size: 16px;
  color: #333333;
  line-height: 1.5;
`;

const WarningText = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 14px;
  color: #ce2e36;
  margin-top: 12px;
`;

const StyledDialogActions = styled(DialogActions)`
  padding: 12px 24px 20px 24px;
  gap: 8px;
`;

const CancelButton = styled(Button)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 14px;
  color: #666666;
  border-color: #e2e2e2;
  padding: 8px 20px;

  &:hover {
    background-color: #f5f5f5;
    border-color: #d0d0d0;
  }
`;

const ExitButton = styled(Button)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 14px;
  background-color: #ce2e36;
  color: #ffffff;
  padding: 8px 20px;

  &:hover {
    background-color: #b02830;
  }
`;

interface ExitConsultationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  consultationCode?: string;
  userRole?: 'ADMIN' | 'USER';
}

export const ExitConsultationModal: React.FC<ExitConsultationModalProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  consultationCode,
  userRole = 'USER',
}) => {
  const isAdmin = userRole === 'ADMIN';

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      aria-labelledby='exit-consultation-dialog-title'
    >
      <StyledDialogTitle id='exit-consultation-dialog-title'>
        <Box className='title-text'>
          <ExitIcon />
          {isAdmin ? '상담 종료' : '상담실 나가기'}
        </Box>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ color: '#666666' }}
          disabled={isLoading}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        <MessageText>
          {isAdmin ? (
            <>
              상담을 종료하시겠습니까?
              <br />
              종료 후에는 고객이 더 이상 상담실에 접속할 수 없습니다.
            </>
          ) : (
            <>
              상담실에서 나가시겠습니까?
              <br />
              나간 후에는 다시 입장 코드를 입력해야 합니다.
            </>
          )}
        </MessageText>

        {consultationCode && (
          <Typography
            variant='body2'
            sx={{
              mt: 1,
              color: '#666666',
              fontFamily: 'Pretendard',
            }}
          >
            상담실 코드: #{consultationCode}
          </Typography>
        )}

        <WarningText>
          {isAdmin
            ? '이 작업은 되돌릴 수 없습니다.'
            : '진행 중인 상담이 중단될 수 있습니다.'}
        </WarningText>
      </StyledDialogContent>

      <StyledDialogActions>
        <CancelButton onClick={onClose} variant='outlined' disabled={isLoading}>
          취소
        </CancelButton>
        <ExitButton
          onClick={onConfirm}
          variant='contained'
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : isAdmin ? '상담 종료' : '나가기'}
        </ExitButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};
