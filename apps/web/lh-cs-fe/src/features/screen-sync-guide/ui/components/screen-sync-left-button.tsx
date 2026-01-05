import { Button } from '@mui/material';
import styled from '@emotion/styled';

interface ScreenSyncLeftButtonProps {
  label: string;
  onClick: () => void;
}

const StyledButton = styled(Button)`
  min-width: 96px;
  height: 40px;
  border-radius: 8px;
  color: #0055a2;
  background: #e1e9f1;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.01em;

  &:hover {
    background: #d6e1ec;
  }
`;

export const ScreenSyncLeftButton: React.FC<ScreenSyncLeftButtonProps> = ({
  label,
  onClick,
}) => {
  return (
    <StyledButton variant='contained' onClick={onClick}>
      {label}
    </StyledButton>
  );
};
