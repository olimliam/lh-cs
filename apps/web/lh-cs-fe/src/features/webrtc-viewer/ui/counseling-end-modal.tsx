import React from 'react';
import styled from '@emotion/styled';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 0;

    width: 320px;
    padding: 0;
    display: flex;
    border-radius: 8px;
    background: #fafafa;
  }
`;

interface CounselingEndModalProps {
  open: boolean;
  onClose: () => void;
  onEndConsultation: () => void;
}

export const CounselingEndModal: React.FC<CounselingEndModalProps> = ({
  open,
  onClose,
  onEndConsultation,
}: CounselingEndModalProps) => {
  return (
    <StyledDialog maxWidth={'sm'} open={open} onClose={onClose}>
      <DialogTitle sx={{ fontSize: '24px', fontWeight: 600, color: '#111111' }}>
        상담 종료
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#333',
          }}
        >
          상담을 종료하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0 24px 24px 24px',
          gap: '16px',
        }}
      >
        <Button fullWidth variant='outlined' onClick={onClose}>
          취소
        </Button>
        <Button
          fullWidth
          variant='contained'
          onClick={onEndConsultation}
          color='primary'
        >
          상담 종료
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
