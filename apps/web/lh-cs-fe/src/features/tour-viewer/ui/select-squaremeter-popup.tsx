import { Button, DialogPopup, RadioInput } from '@/shared/ui';
import styled from '@emotion/styled';
import {
  ActionsContainer,
  ContentArea,
  Header,
  MainContent,
  ModalContent,
  Subtitle,
  Title,
} from '@/features/notice-faq-list/style/popup-styles';
import { TourResponse } from '@/shared/model/tour.dto';

interface LandingListModalProps {
  isOpen: boolean;
  changeTourId: string;
  currentSquareMeter: number;
  toursData: TourResponse[] | undefined;
  onClose: () => void;
  onChange: (fieldName: string, value: string) => void;
  handleFetchTourData: () => void;
}

const SelectTourBox = styled.div`
  width: 100%;
  padding: 16px;
  border-radius: 4px;
  background: #eee;
`;

export const SelectSquareMeterPopup: React.FC<LandingListModalProps> = ({
  // contentType,
  // selectedItemId,
  currentSquareMeter,
  changeTourId,
  toursData,
  isOpen,
  onClose,
  onChange,
  handleFetchTourData,
}) => {
  if (!isOpen) return null;
  return (
    <DialogPopup
      isOpen={isOpen}
      onClose={onClose}
      container={() => document.getElementById('root')}
      modalSize={{ width: 458, height: 400 }}
      paperClassName='bg-neutral-100'
    >
      <ModalContent>
        <Header>
          <div>
            <Title>평형 변경</Title>
            <Subtitle>평형을 변경하시겠습니까?</Subtitle>
          </div>
          <div className='rounded-[4px] bg-[#eee] p-2'>
            현재 평형: <strong>{currentSquareMeter}</strong>㎡
          </div>
        </Header>

        <MainContent>
          <ContentArea>
            <SelectTourBox>
              <p className='pb-3 text-[#333]'>변경 가능한 평형</p>
              {toursData && (
                <RadioInput<string>
                  fieldName='targetTourId'
                  value={changeTourId}
                  options={toursData.map((tour) => ({
                    label: `${tour.squareMeters}㎡`,
                    value: tour.id,
                  }))}
                  onChange={onChange}
                  gap='12px'
                  ariaLabelledBy='user-status-label'
                />
              )}
            </SelectTourBox>
          </ContentArea>

          <ActionsContainer>
            <Button
              variant={'outlinePrimary'}
              size={'md'}
              fullWidth
              onClick={onClose}
            >
              닫기
            </Button>
            <Button
              variant={'outlinePrimary'}
              size={'md'}
              fullWidth
              onClick={handleFetchTourData}
            >
              변경
            </Button>
          </ActionsContainer>
        </MainContent>
      </ModalContent>
    </DialogPopup>
  );
};
