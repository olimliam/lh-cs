import styled from '@emotion/styled';
import { ConsultationRoom } from '../model/consultation.types';
import { BASE_FONT_FAMILY } from '@/shared/ui';

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
  font-size: 28px;
  line-height: 1.5;
  color: #111111;
  margin: 0;
`;

const CountBadge = styled.div`
  background: #ffffff;
  border-radius: 4px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 24px;
  line-height: 1.3;
  color: #0055a2;
`;

const CreateButton = styled.button`
  background: #0055a2;
  border: none;
  border-radius: 4px;
  padding: 8px 10px 8px 14px;
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #004080;
  }
`;

const PlusIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;

  &::before {
    content: '+';
    font-size: 16px;
    font-weight: 500;
  }
`;

const ButtonText = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  color: #ffffff;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(17, 17, 17, 0.1);
  width: 100%;
`;

interface ConsultationHeaderProps {
  consultationRooms: ConsultationRoom[];
  onCreateRoom: () => void;
}

export const ConsultationHeader = ({
  consultationRooms,
  onCreateRoom,
}: ConsultationHeaderProps) => {
  return (
    <>
      <Header>
        <HeaderTop>
          <TitleSection>
            <Title>개설된 상담실</Title>
            <CountBadge>{consultationRooms.length}</CountBadge>
          </TitleSection>
          <CreateButton onClick={() => onCreateRoom()}>
            <PlusIcon />
            <ButtonText>상담실 개설하기</ButtonText>
          </CreateButton>
        </HeaderTop>
        <Divider />
      </Header>
    </>
  );
};
