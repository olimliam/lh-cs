import React from 'react';
import { Dialog, DialogTitle, DialogActions } from '@mui/material';
import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '../typography';

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  noticeTextNode?: React.ReactNode;
  children?: React.ReactNode;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #fafafa;
    border-radius: 8px;
    padding: 24px;
    width: 100%;
    max-width: 320px;
    box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .MuiBackdrop-root {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  padding: 0;
  margin: 0;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  justify-content: center;
`;

const Title = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: #111111;
  white-space: pre;
`;

const Message = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #333333;
  white-space: pre;
`;

const StyledDialogActions = styled(DialogActions)`
  padding: 0;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`;

const StyledNoticeTextNode = styled.p`
  font-family: ${BASE_FONT_FAMILY};
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  color: #666666;
`;

export const BaseModal: React.FC<BaseModalProps> = ({
  open,
  onClose,
  title,
  message,
  noticeTextNode,
  children,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
    >
      <StyledDialogTitle>
        <ContentSection>
          <Title>{title}</Title>
          <Message>{message}</Message>
          {noticeTextNode && (<StyledNoticeTextNode>{noticeTextNode}</StyledNoticeTextNode>)}
        </ContentSection>
      </StyledDialogTitle>

      <StyledDialogActions>{children}</StyledDialogActions>
    </StyledDialog>
  );
};
