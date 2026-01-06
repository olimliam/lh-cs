import styled from '@emotion/styled';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { media } from '@/shared/utils';

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled.h2`
  font-weight: 600;
  font-size: 24px;
  line-height: 1.3;
  color: #111111;
  margin: 0;
  padding-bottom: 4px;

  ${media.tablet`
    font-size: 20px;
  `}
`;
const Subtitle = styled.p`
  color: #666;
  ${media.tablet`
    font-size: 14px;
  `}
`;

const CloseButton = styled.button`
  width: 18px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  svg {
    width: 13.15px;
    height: 13.15px;
  }
`;

interface DialogPopupHeaderProps {
  titleComponent: React.ReactNode;
  subTitleComponent: React.ReactNode;
  onClose?: () => void;
}

export const DialogPopupHeader: React.FC<DialogPopupHeaderProps> = ({
  titleComponent,
  subTitleComponent,
  onClose,
}) => {
  return (
    <Header>
      <div>
        <Title>{titleComponent}</Title>
        <Subtitle>{subTitleComponent}</Subtitle>
      </div>

      {onClose && (
        <CloseButton onClick={onClose} aria-label='모달 닫기'>
          <CloseIcon width={18} height={18} />
        </CloseButton>
      )}
    </Header>
  );
};
