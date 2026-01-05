import React from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import styled from '@emotion/styled';

const HeaderContainer = styled(Box)`
  display: flex;
  height: 44px;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled(Box)`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const TitleSection = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledTextField = styled(TextField)`
  width: 280px;

  .MuiOutlinedInput-root {
    height: 40px;

    .MuiOutlinedInput-input {
      font-size: 16px;
      font-weight: 500;
      color: #111111;

      &::placeholder {
        color: rgba(0, 0, 0, 0.6);
        opacity: 1;
      }
    }
  }
`;

interface ConsultationHeaderProps {
  consultationCode: string;
  onConsultationCodeChange: (value: string) => void;
  onClose?: () => void;
}

export const ConsultationHeader: React.FC<ConsultationHeaderProps> = ({
  consultationCode,
  onConsultationCodeChange,
  onClose,
}) => {
  return (
    <HeaderContainer>
      <HeaderLeft>
        <TitleSection>
          <Typography
            variant='h6'
            sx={{
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: '130%',
              color: '#111111',
              marginBottom: '2px',
            }}
          >
            상담 코드
          </Typography>
          <Typography
            variant='body2'
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '130%',
              color: '#666666',
            }}
          >
            상담 진행 중인 상담 코드를 입력해 주세요.
          </Typography>
        </TitleSection>

        <StyledTextField
          value={consultationCode}
          onChange={(e) => onConsultationCodeChange(e.target.value)}
          placeholder='상담 코드'
          variant='outlined'
          size='small'
        />
      </HeaderLeft>

      <IconButton
        onClick={onClose}
        sx={{
          width: 40,
          height: 40,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Close />
      </IconButton>
    </HeaderContainer>
  );
};
