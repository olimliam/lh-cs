import { HelpCircleIcon, NotificationIcon } from '@/shared/ui';
import styled from '@emotion/styled';

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f8fcff;
`;
const BadgeText = styled.span`
  font-weight: 700;
  color: #0055a2;
  line-height: 1.3;
`;

export const CurrentContentBadge = ({
  contentType,
}: {
  contentType: 'notice' | 'qna' | null;
}) => {
  return (
    <BadgeContainer>
      {contentType === 'notice' ? (
        <NotificationIcon fill='#0055A2' />
      ) : (
        <HelpCircleIcon fill='#0055A2' />
      )}

      <BadgeText>
        {contentType === 'notice' ? '공지' : '자주묻는 질문'}
      </BadgeText>
    </BadgeContainer>
  );
};
