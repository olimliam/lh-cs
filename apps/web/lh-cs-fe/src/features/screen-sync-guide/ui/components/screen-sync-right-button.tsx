import { Button } from '@mui/material';
import styled from '@emotion/styled';

interface ScreenSyncRightButtonProps {
  label: string;
  onClick: () => void;
}

const StyledButton = styled(Button)`
  min-width: 96px;
  height: 40px;
  border-radius: 8px;
  color: #ffffff;
  background: #0055a2;
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.01em;

  &:hover {
    background: #004987;
  }
`;

export const ScreenSyncRightButton: React.FC<ScreenSyncRightButtonProps> = ({
  label,
  onClick,
}) => {
  return (
    <StyledButton variant='contained' onClick={onClick}>
      {label}
    </StyledButton>
  );
};
