import styled from '@emotion/styled';

const TabNav = styled.nav`
  display: flex;
`;

interface TabProps {
  children?: React.ReactNode;
}

export const TabBox: React.FC<TabProps> = ({ children }) => (
  <TabNav>
    {children}
  </TabNav>
);