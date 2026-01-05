import { type FC } from 'react';
import { Dialog } from '@mui/material';
import type { DialogProps } from '@mui/material/Dialog';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import styled from '@emotion/styled';
import { basePretendardStyle } from '@/shared/ui/text-styles';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 0;
    min-width: 100vw;
    min-height: 100vh;
    width: 100vw;
    height: 100vh;
    padding: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const DialogContainer = styled.div`
  border-radius: 12px;
  background: transparent;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

const SmallTitle = styled.div`
  ${basePretendardStyle}
  font-size: 24px;
  font-weight: 500;
  color: #ffffff;
`;

const MainTitle = styled.div`
  ${basePretendardStyle}
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
`;

const Description = styled.div`
  ${basePretendardStyle}
  font-size: 16px;
  font-weight: 500;
  color: #cccccc;
  line-height: 1.5;
  white-space: pre-line;
`;

const SelfCheckButton = styled.button`
  ${basePretendardStyle}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 4px;
  padding: 10px;
  background: #90c31f;
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #7cab1a;
  }

  &:active {
    background: #699316;
  }

  &:disabled {
    background: #bddb77;
    cursor: not-allowed;
  }
`;

interface SelfTourDialogProps {
  open: boolean;
  onClose: () => void;
  onSelfCheck: () => void;
  isSelfCheckDisabled?: boolean;
}

export const SelfCheckDialog: FC<SelfTourDialogProps> = ({
  open,
  onClose,
  onSelfCheck,
  isSelfCheckDisabled = false,
}) => {
  const handleOnClose: DialogProps['onClose'] = (_event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleOnClose}
      disableEscapeKeyDown
      maxWidth={false}
      fullScreen
    >
      <DialogContainer>
        <SmallTitle>감사합니다</SmallTitle>
        <MainTitle>상담이 종료되었습니다</MainTitle>
        <Description>
          {`※ 자가 점검을 원하시는 고객은\n자가 점검 진행 버튼을 클릭해 주세요.`}
        </Description>
        <SelfCheckButton
          type='button'
          onClick={onSelfCheck}
          disabled={isSelfCheckDisabled}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />
          자가 점검 진행
        </SelfCheckButton>
      </DialogContainer>
    </StyledDialog>
  );
};
