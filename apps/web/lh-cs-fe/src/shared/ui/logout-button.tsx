import styled from '@emotion/styled';
import { GNBButtonText } from './text-styles';
import { LogoutOutlined } from '@mui/icons-material';
const StyledLogoutButton = styled.button`
  background: #90c31f;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  box-shadow: none;

  &:hover {
    background: #7ba619;
  }
`;
const LogoutIconWrapper = styled.div`
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface LogoutButtonProps {
  onClick: () => void;
}
export const LogoutButton = ({ onClick }: LogoutButtonProps) => {
  return (
    <StyledLogoutButton onClick={onClick}>
      <LogoutIconWrapper>
        <LogoutOutlined />
      </LogoutIconWrapper>
      <GNBButtonText>로그아웃</GNBButtonText>
    </StyledLogoutButton>
  );
};
