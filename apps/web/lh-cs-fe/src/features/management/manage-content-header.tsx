import { BASE_FONT_FAMILY } from '@/shared/ui';
import styled from '@emotion/styled';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleSection = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Title = styled.h1`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 700;
  font-size: 24px;
  line-height: 1.5;
  color: #111111;
  margin: 0;
`;

const CountBadge = styled.div`
  background: rgba(51, 51, 51, 0.10);
  border-radius: 4px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
  color: #666;
`;

interface ManageContentProps {
  count?: number;
  title: string;
}
export const ManageContentHeader = ({count, title}: ManageContentProps) => {
  return (
      <Header>
        <HeaderTop>
          <TitleSection>
            <Title>{title}</Title>
            {count && <CountBadge>{count}</CountBadge>}
            
          </TitleSection>
        </HeaderTop>
      </Header>
  )
};