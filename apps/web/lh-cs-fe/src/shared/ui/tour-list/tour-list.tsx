import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import React from 'react';
import { DesktopTourList } from './desktop-tour-list';
import { useGetAllTours } from '@/shared/api/hooks/tour-hooks';
import { TabletTourList } from './tablet-tour-list';

export interface TourListProps {
  tourId: string | undefined;
  onSelectTour: (tourId: string | undefined) => void;
}

export const TourList: React.FC<TourListProps> = ({ tourId, onSelectTour }) => {
  const { data: toursData } = useGetAllTours();

  const handleSelectTour = (tourId: string | undefined) => {
    onSelectTour(tourId);
  };

  const { isTablet } = useDeviceDetector();

  const commonProps: TourListProps = {
    tourId,
    onSelectTour: handleSelectTour,
  };

  if (isTablet) {
    return (
      <TabletTourList {...commonProps} toursData={toursData} tourId={tourId} />
    );
  }

  return (
    <DesktopTourList {...commonProps} toursData={toursData} tourId={tourId} />
  );
};
