import { TourResponse } from '@/shared/model/tour.dto';
import { TourButton } from '../tour-list-swiper/tour-button';
import { TourListProps } from './tour-list';
import { CreateTourContentHeader } from '../create-tour-content-header';

interface DesktopTourListProps extends TourListProps {
  toursData?: TourResponse[];
  tourId: string | undefined;
}

export const DesktopTourList: React.FC<DesktopTourListProps> = ({
  toursData,
  tourId,
  onSelectTour,
}) => {
  return (
    <div className='flex h-full flex-col gap-3'>
      <CreateTourContentHeader
        contentTitle='평형 선택'
        subTitle='1개의 평형만 선택할 수 있습니다.'
        count={toursData ? toursData.length : 0}
      />

      <div className='h-full w-full max-w-[288px] overflow-y-auto rounded-[6px] bg-white p-3 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.05)]'>
        <div className='grid w-full grid-cols-2 gap-3'>
          {toursData?.map((option: TourResponse) => (
            <TourButton
              key={option.id}
              option={option}
              size='sm'
              onClick={onSelectTour}
              currentTourId={tourId!}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
