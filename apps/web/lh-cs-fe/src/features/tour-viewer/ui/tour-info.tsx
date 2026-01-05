import { BASE_FONT_FAMILY } from '@/shared/ui';
import { InfoIcon } from '@/shared/ui/icons/info-icon';
import styled from '@emotion/styled';
import { TourInfoData } from './simple-tour-viewer';

const TourInfoContainer = styled.div`
  display: flex;
  padding: 12px;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  position: fixed;
  top: 80px;
  left: 24px;

  z-index: 1250;
  border-radius: 6px;
  background: #fff;

  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);

  width: 280px;
  /* height: 174px; */
`;

const InfoHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  color: #333;
`;

const StrongText = styled.span`
  color: #111;

  font-family: ${BASE_FONT_FAMILY};
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 130%; /* 18.2px */
`;

const InfoTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  color: #333;

  font-family: ${BASE_FONT_FAMILY};
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;

  ${StrongText} {
    font-size: 16px;
  }
`;

const EnterCode = styled.div`
  display: flex;
  padding: 2px 8px;
  justify-content: center;
  align-items: center;
  gap: 6px;

  border-radius: 4px;
  background: rgba(114, 113, 113, 0.1);
`;

const InfoDescription = styled.div`
  display: flex;
  padding: 12px;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;

  border-radius: 4px;
  background: #eee;
`;

const KeyText = styled.p`
  color: #333;

  font-family: ${BASE_FONT_FAMILY};
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%; /* 18.2px */
`;

interface TourInfoProps {
  room: TourInfoData | null | undefined;
  handleOpenFacilityPopup?: () => void;
}

export const TourInfo: React.FC<TourInfoProps> = ({
  room,
  handleOpenFacilityPopup,
}) => {
  console.log('room info:', room);
  return (
    <>
      <TourInfoContainer>
        <InfoHeader>
          <InfoTitle>
            <div className='width-4 flex h-4 items-center justify-center text-[#666]'>
              <InfoIcon width={20} height={20} />
            </div>
            <StrongText>상담실 정보</StrongText>
          </InfoTitle>
          <EnterCode>
            <KeyText>입장코드</KeyText>{' '}
            <StrongText>{room?.enterCode}</StrongText>
          </EnterCode>
        </InfoHeader>
        <InfoDescription>
          <div className='flex items-center'>
            <KeyText>
              평형 정보:<StrongText>{room?.squareMeters}</StrongText> ㎡
            </KeyText>
            <button
              type='button'
              className='ml-1 rounded border border-solid border-[#ccc] bg-[rgba(255,255,255,0.8)] p-[4px_8px] text-[14px] text-[#111]'
              onClick={handleOpenFacilityPopup}
            >
              변경
            </button>
          </div>

          <KeyText>
            유지보수 설비 정보:
            <StrongText>{room?.facilityTitle || '-'}</StrongText>
          </KeyText>
          <KeyText>
            상담코드:<StrongText>{room?.consultationCode}</StrongText>
          </KeyText>
          <KeyText>
            방 번호:<StrongText>{room?.roomId}</StrongText>
          </KeyText>
        </InfoDescription>
      </TourInfoContainer>
    </>
  );
};
