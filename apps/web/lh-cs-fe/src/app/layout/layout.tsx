import { Outlet } from 'react-router-dom';
import styled from '@emotion/styled';

const Container = styled.div`
  width: 100%;
  height: var(--vh);
`;

export const MainLayout = () => {
  return (
    <Container>
      <Outlet />
    </Container>
  );
};
