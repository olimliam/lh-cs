import { ErrorBoundary } from '@/shared/ui/error-boundary';
import React from 'react';
import { AlternativeTourFacilityList } from '../../../shared/ui/tour-facility-list/alternative-tour-facility-list';
import { TourList } from '../../../shared/ui/tour-list/tour-list';
import { TourFacilityList } from '@/shared/ui/tour-facility-list/tour-facility-list';

export interface CreateConsultationModalContentProps {
  consultationCode: string;
  onConsultationCodeChange: (value: string) => void;
  tourId: string | undefined;
  onSelectTour: (selectedTourId: string | undefined) => void;
  facilityId: string | undefined;
  onSelectFacility: (selectedFacilityId: string | undefined) => void;
  onClose: () => void;
  onConfirm: () => void;
  isTablet?: boolean;
}

export const CreateConsultationModalContent: React.FC<
  CreateConsultationModalContentProps
> = ({
  tourId,
  onSelectTour,
  facilityId, // 사용하지 않지만 인터페이스 호환성을 위해 유지
  onSelectFacility,
  isTablet,
}) => {
  return (
    <>
      {/* 선택 영역 */}
      <div className={`flex h-full w-full gap-6 ${isTablet ? 'flex-col' : ''}`}>
        {/* 평형 선택 */}
        <ErrorBoundary
          fallback={<div>평형 선택 중 오류가 발생했습니다.</div>}
          resetKeys={[tourId]}
        >
          <TourList tourId={tourId} onSelectTour={onSelectTour} />
        </ErrorBoundary>

        {/* 유지보수 설비 선택 */}
        <ErrorBoundary fallback={<div>설비 선택 중 오류가 발생했습니다.</div>}>
          {tourId ? (
            <TourFacilityList
              tourId={tourId}
              facilityId={facilityId}
              onSelectFacility={onSelectFacility}
            />
          ) : (
            <AlternativeTourFacilityList />
          )}
        </ErrorBoundary>
      </div>
    </>
  );
};
