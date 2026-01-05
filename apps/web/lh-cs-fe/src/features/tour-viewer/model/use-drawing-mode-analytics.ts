import { useEffect } from 'react';

interface UseDrawingModeAnalyticsParams {
  isDrawingMode: boolean | null;
  currentSceneId?: number;
  consultationId?: string;
  userId: string;
  logDrawingModeToggle: (
    consultationId: string,
    userId: string,
    sceneId: string,
    isDrawingMode: boolean
  ) => void;
}

export const useDrawingModeAnalytics = ({
  isDrawingMode,
  currentSceneId,
  consultationId,
  userId,
  logDrawingModeToggle,
}: UseDrawingModeAnalyticsParams) => {
  useEffect(() => {
    if (!isDrawingMode || !currentSceneId || !consultationId) {
      return;
    }
    logDrawingModeToggle(
      consultationId,
      userId,
      String(currentSceneId),
      isDrawingMode
    );
  }, [
    consultationId,
    currentSceneId,
    isDrawingMode,
    logDrawingModeToggle,
    userId,
  ]);
};

