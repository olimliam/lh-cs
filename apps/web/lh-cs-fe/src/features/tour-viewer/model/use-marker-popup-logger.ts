import { TourMarkerType, TravelerMarkerContent } from '@packages/traveler';
import { useEffect } from 'react';

export type ViewerMarkerContent = {
  markerId: number | string | null;
  type: TourMarkerType | null;
  option: TravelerMarkerContent | null;
} | null;

interface UseMarkerPopupLoggerParams {
  markerContent: ViewerMarkerContent;
  consultationId?: string;
  profileId?: string;
  logPopupToggle: (
    consultationId: string,
    profileId: string,
    markerId?: string
  ) => void;
}

export const useMarkerPopupLogger = ({
  markerContent,
  consultationId,
  profileId,
  logPopupToggle,
}: UseMarkerPopupLoggerParams) => {
  useEffect(() => {
    if (!consultationId || !profileId || !markerContent) return;
    logPopupToggle(
      consultationId,
      profileId,
      markerContent.markerId ? String(markerContent.markerId) : undefined
    );
  }, [consultationId, profileId, logPopupToggle, markerContent]);
};

